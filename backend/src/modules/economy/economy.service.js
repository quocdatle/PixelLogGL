const mongoose = require('mongoose');
const Item = require('./item.model');
const Wallet = require('./wallet.model');
const Inventory = require('./inventory.model');
const CaseOpenLog = require('./caseOpenLog.model');
const User = require('../users/user.model');
const { toPublicUser } = require('../auth/auth.service');
const { applyDailyCheckInToUser, canCheckIn, CHECK_IN_COOLDOWN_MS } = require('../users/levelSystem');
const { seedItems } = require('../../../database/seeders/items.seed');

const { DAILY_REWARD_AMOUNT, INITIAL_BALANCE } = Wallet;

// Cấu hình các loại rương mở hòm
const CASE_CONFIGS = {
  standard: {
    id: 'standard',
    name: 'Rương Tân Thủ',
    englishName: 'Standard Case',
    description: 'Rương nhập môn dành cho mọi game thủ. Chi phí vừa phải, cơ hội mở được nhiều bảo bối kinh điển.',
    cost: 100,
    keyName: 'Chìa Khóa Tân Thủ',
    keyIcon: '🗝️',
    icon: '📦',
    themeColor: 'emerald',
    chances: {
      common: 0.60,
      uncommon: 0.30,
      rare: 0.085,
      epic: 0.014,
      legendary: 0.001,
    },
    displayChances: {
      common: '60%',
      uncommon: '30%',
      rare: '8.5%',
      epic: '1.4%',
      legendary: '0.1%',
    },
  },
  cyber: {
    id: 'cyber',
    name: 'Rương Cyberpunk',
    englishName: 'Cyber Vault',
    description: 'Kho báu công nghệ tương lai từ Night City. Tỷ lệ rơi vật phẩm Hiếm và Sử Thi cực hấp dẫn!',
    cost: 250,
    keyName: 'Chìa Khóa Cyberpunk',
    keyIcon: '🔑',
    icon: '⚡',
    themeColor: 'sky',
    chances: {
      common: 0.20,
      uncommon: 0.45,
      rare: 0.25,
      epic: 0.08,
      legendary: 0.02,
    },
    displayChances: {
      common: '20%',
      uncommon: '45%',
      rare: '25%',
      epic: '8%',
      legendary: '2%',
    },
  },
  mythic: {
    id: 'mythic',
    name: 'Rương Thần Thoại',
    englishName: 'Mythic Relic',
    description: 'Hòm cổ ngữ ngưng tụ ma lực tối thượng. Đảm bảo từ Hiếm trở lên, tỷ lệ mở ra Thần Thoại cao nhất!',
    cost: 500,
    keyName: 'Chìa Khóa Thần Thoại',
    keyIcon: '🔱',
    icon: '👑',
    themeColor: 'amber',
    chances: {
      common: 0,
      uncommon: 0,
      rare: 0.45,
      epic: 0.40,
      legendary: 0.15,
    },
    displayChances: {
      common: '0%',
      uncommon: '0%',
      rare: '45%',
      epic: '40%',
      legendary: '15%',
    },
  },
};

function httpError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

// Đảm bảo database luôn có sẵn items
async function ensureItemsSeeded() {
  const count = await Item.countDocuments();
  if (count === 0) {
    await seedItems();
  }
}

// Chuẩn hóa số lượng chìa khóa từ Wallet document (an toàn với bản ghi cũ chưa có keys)
function normalizeWalletKeys(wallet) {
  return {
    standard: Math.max(0, Number(wallet?.keys?.standard) || 0),
    cyber: Math.max(0, Number(wallet?.keys?.cyber) || 0),
    mythic: Math.max(0, Number(wallet?.keys?.mythic) || 0),
  };
}

// Lấy hoặc khởi tạo ví của người dùng
async function getWallet(userId) {
  const [existingWallet, user] = await Promise.all([
    Wallet.findOne({ userId }),
    User.findById(userId).select('lastCheckInAt'),
  ]);

  let wallet = existingWallet;
  if (!wallet) {
    wallet = await Wallet.create({
      userId,
      balance: INITIAL_BALANCE,
      totalEarned: INITIAL_BALANCE,
      totalSpent: 0,
      lastDailyReward: null,
    });
  }

  const now = new Date();
  const latestTimestamp = Math.max(
    wallet.lastDailyReward ? new Date(wallet.lastDailyReward).getTime() : 0,
    user?.lastCheckInAt ? new Date(user.lastCheckInAt).getTime() : 0
  );
  const checkInState = canCheckIn(latestTimestamp ? new Date(latestTimestamp) : null, now);

  return {
    balance: wallet.balance,
    totalEarned: wallet.totalEarned,
    totalSpent: wallet.totalSpent,
    keys: normalizeWalletKeys(wallet),
    canClaimDaily: checkInState.canCheckIn,
    nextDailyAt: checkInState.nextCheckInAt,
    dailyRewardAmount: DAILY_REWARD_AMOUNT,
  };
}

// Điểm danh nhận xu hàng ngày & tăng tiến độ cấp độ (Daily Check-in)
async function claimDailyReward(userId) {
  const [existingWallet, user] = await Promise.all([
    Wallet.findOne({ userId }),
    User.findById(userId),
  ]);

  if (!user) {
    throw httpError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
  }

  let wallet = existingWallet;
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }

  const now = new Date();
  const latestTimestamp = Math.max(
    wallet.lastDailyReward ? new Date(wallet.lastDailyReward).getTime() : 0,
    user.lastCheckInAt ? new Date(user.lastCheckInAt).getTime() : 0
  );
  const checkInState = canCheckIn(latestTimestamp ? new Date(latestTimestamp) : null, now);

  if (!checkInState.canCheckIn) {
    const waitMinutes = Math.ceil(checkInState.remainingMs / (60 * 1000));
    const hours = Math.floor(waitMinutes / 60);
    const minutes = waitMinutes % 60;
    throw httpError(
      `Bạn đã điểm danh hôm nay rồi. Vui lòng quay lại sau ${hours} giờ ${minutes} phút.`,
      400,
      'ALREADY_CLAIMED'
    );
  }

  wallet.balance += DAILY_REWARD_AMOUNT;
  wallet.totalEarned += DAILY_REWARD_AMOUNT;
  wallet.lastDailyReward = now;
  await wallet.save();

  const checkInResult = applyDailyCheckInToUser(user, now);
  await user.save();

  const nextDailyAt = new Date(now.getTime() + CHECK_IN_COOLDOWN_MS);
  const messageParts = [`Điểm danh thành công! Bạn nhận được +${DAILY_REWARD_AMOUNT} Xu`];
  if (checkInResult.leveledUp) {
    messageParts.push(`Thăng lên Cấp ${checkInResult.newLevel}`);
  }
  if (checkInResult.newlyUnlockedFrames.length > 0) {
    const names = checkInResult.newlyUnlockedFrames.map((f) => f.name).join(', ');
    messageParts.push(`Mở khóa khung avatar: ${names}`);
  }

  return {
    balance: wallet.balance,
    keys: normalizeWalletKeys(wallet),
    claimedAmount: DAILY_REWARD_AMOUNT,
    nextDailyAt,
    user: toPublicUser(user),
    checkInResult,
    message: `${messageParts.join(' • ')}.`,
  };
}

// Mua chìa khóa mở rương bằng Xu ảo
async function buyKey(userId, { caseId = 'standard', quantity = 1 }) {
  const caseConfig = CASE_CONFIGS[caseId];
  if (!caseConfig) {
    throw httpError(
      `Loại chìa khóa không hợp lệ. Phải là một trong: ${Object.keys(CASE_CONFIGS).join(', ')}`,
      400,
      'INVALID_CASE'
    );
  }

  const parsedQty = Number(quantity);
  if (!Number.isInteger(parsedQty) || parsedQty < 1 || parsedQty > 50) {
    throw httpError('Số lượng chìa khóa phải là số nguyên từ 1 đến 50.', 400, 'INVALID_QUANTITY');
  }

  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }

  const totalCost = caseConfig.cost * parsedQty;
  if (wallet.balance < totalCost) {
    throw httpError(
      `Số dư không đủ. Cần ${totalCost} Xu để mua ${parsedQty} ${caseConfig.keyName}, nhưng bạn chỉ có ${wallet.balance} Xu.`,
      400,
      'INSUFFICIENT_FUNDS'
    );
  }

  const updatedWallet = await Wallet.findOneAndUpdate(
    { _id: wallet._id, balance: { $gte: totalCost } },
    {
      $inc: {
        balance: -totalCost,
        totalSpent: totalCost,
        [`keys.${caseId}`]: parsedQty,
      },
    },
    { new: true }
  );

  if (!updatedWallet) {
    throw httpError(
      `Số dư không đủ để mua ${parsedQty} ${caseConfig.keyName}.`,
      400,
      'INSUFFICIENT_FUNDS'
    );
  }

  return {
    balance: updatedWallet.balance,
    totalSpent: updatedWallet.totalSpent,
    keys: normalizeWalletKeys(updatedWallet),
    purchasedCaseId: caseId,
    keyName: caseConfig.keyName,
    quantity: parsedQty,
    totalCost,
    message: `Đã mua thành công ${parsedQty} ${caseConfig.keyName} (-${totalCost} Xu)!`,
  };
}

const RARITY_ORDER = {
  legendary: 5,
  epic: 4,
  rare: 3,
  uncommon: 2,
  common: 1,
};

// Lấy danh sách rương, toàn bộ vật phẩm có thể mở được và tỷ lệ chính xác từng món
async function getCases() {
  await ensureItemsSeeded();
  const allItems = await Item.find().sort({ coinValue: -1 }).lean();

  const rarityWeightSums = {};
  allItems.forEach((item) => {
    const r = item.rarity || 'common';
    rarityWeightSums[r] = (rarityWeightSums[r] || 0) + (item.dropRate || 100);
  });

  return Object.values(CASE_CONFIGS).map((c) => {
    const pool = allItems
      .filter((item) => (c.chances?.[item.rarity] || 0) > 0)
      .map((item) => {
        const tierProb = c.chances[item.rarity] || 0;
        const weightSum = rarityWeightSums[item.rarity] || 1;
        const exactChancePct = Number(
          (tierProb * ((item.dropRate || 100) / weightSum) * 100).toFixed(3)
        );
        return {
          ...item,
          exactChancePct,
        };
      })
      .sort((a, b) => {
        const rankDiff = (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0);
        if (rankDiff !== 0) return rankDiff;
        return (b.coinValue || 0) - (a.coinValue || 0);
      });

    return {
      ...c,
      itemCount: pool.length,
      poolPreview: pool.slice(0, 8),
      pool,
    };
  });
}

// Thuật toán chọn độ hiếm theo trọng số xác suất
function pickRarityByChances(chances) {
  const rand = Math.random();
  let cumulative = 0;

  for (const [rarity, prob] of Object.entries(chances)) {
    cumulative += prob;
    if (rand < cumulative) {
      return rarity;
    }
  }

  // Fallback nếu sai số làm tròn số thực
  return 'common';
}

// Xử lý mở hòm tại Backend (RNG an toàn chống gian lận)
async function openCase(userId, { caseId = 'standard' }) {
  await ensureItemsSeeded();

  const caseConfig = CASE_CONFIGS[caseId];
  if (!caseConfig) {
    throw httpError(`Loại rương không hợp lệ. Phải là một trong: ${Object.keys(CASE_CONFIGS).join(', ')}`, 400, 'INVALID_CASE');
  }

  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }

  const keys = normalizeWalletKeys(wallet);
  if (keys[caseId] < 1) {
    throw httpError(
      `Bạn chưa có ${caseConfig.keyName} để mở ${caseConfig.name}. Vui lòng mua chìa khóa bằng Xu (${caseConfig.cost} Xu/chìa).`,
      400,
      'INSUFFICIENT_KEYS'
    );
  }

  // 1. Backend tính độ hiếm trúng thưởng theo xác suất cấu hình
  const wonRarity = pickRarityByChances(caseConfig.chances);

  // 2. Lấy danh sách item tương ứng độ hiếm
  let candidateItems = await Item.find({ rarity: wonRarity }).lean();
  if (candidateItems.length === 0) {
    candidateItems = await Item.find().lean();
  }

  // 3. Chọn ngẫu nhiên có trọng số trong cùng tier
  const totalWeight = candidateItems.reduce((sum, item) => sum + (item.dropRate || 100), 0);
  let randomWeight = Math.random() * totalWeight;
  let wonItem = candidateItems[0];

  for (const item of candidateItems) {
    randomWeight -= (item.dropRate || 100);
    if (randomWeight <= 0) {
      wonItem = item;
      break;
    }
  }

  // 4. Tiêu thụ 1 chìa khóa tương ứng với rương
  const updatedWallet = await Wallet.findOneAndUpdate(
    { _id: wallet._id, [`keys.${caseId}`]: { $gte: 1 } },
    { $inc: { [`keys.${caseId}`]: -1 } },
    { new: true }
  );

  if (!updatedWallet) {
    throw httpError(
      `Bạn chưa có ${caseConfig.keyName} để mở ${caseConfig.name}. Vui lòng mua chìa khóa bằng Xu (${caseConfig.cost} Xu/chìa).`,
      400,
      'INSUFFICIENT_KEYS'
    );
  }

  // 5. Cập nhật túi đồ người chơi (Inventory)
  const existingInventory = await Inventory.findOne({ userId, itemId: wonItem._id });
  let isNew = false;

  if (existingInventory) {
    existingInventory.quantity += 1;
    await existingInventory.save();
  } else {
    isNew = true;
    await Inventory.create({
      userId,
      itemId: wonItem._id,
      quantity: 1,
    });
  }

  // 6. Ghi log mở hòm
  await CaseOpenLog.create({
    userId,
    itemId: wonItem._id,
    caseId,
    cost: caseConfig.cost,
  });

  // 7. Tạo danh sách cuộn vòng quay roulette (45 ô, ô trúng thưởng ở index 36)
  const allItems = await Item.find().lean();
  const REEL_SIZE = 45;
  const TARGET_INDEX = 36;
  const reelItems = [];

  for (let i = 0; i < REEL_SIZE; i++) {
    if (i === TARGET_INDEX) {
      reelItems.push(wonItem);
    } else {
      const randomIndex = Math.floor(Math.random() * allItems.length);
      reelItems.push(allItems[randomIndex]);
    }
  }

  return {
    wonItem,
    isNew,
    caseId,
    cost: caseConfig.cost,
    remainingBalance: updatedWallet.balance,
    remainingKeys: normalizeWalletKeys(updatedWallet),
    reelItems,
    targetIndex: TARGET_INDEX,
  };
}

// Xem túi đồ người chơi (Inventory / Collection)
async function getInventory(userId, { rarity, type, search, sort = 'recent', page = 1, limit = 24 }) {
  await ensureItemsSeeded();

  const matchFilter = { userId: new mongoose.Types.ObjectId(userId) };
  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 24));

  const pipeline = [
    { $match: matchFilter },
    {
      $lookup: {
        from: 'items',
        localField: 'itemId',
        foreignField: '_id',
        as: 'item',
      },
    },
    { $unwind: '$item' },
  ];

  if (rarity && rarity !== 'all') {
    pipeline.push({ $match: { 'item.rarity': rarity } });
  }

  if (type && type !== 'all') {
    pipeline.push({ $match: { 'item.type': type } });
  }

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    pipeline.push({
      $match: {
        $or: [
          { 'item.name': { $regex: escaped, $options: 'i' } },
          { 'item.description': { $regex: escaped, $options: 'i' } },
        ],
      },
    });
  }

  // Sắp xếp
  let sortStage = { updatedAt: -1 };
  if (sort === 'rarityDesc') {
    // Sắp xếp theo giá trị coinValue giảm dần
    sortStage = { 'item.coinValue': -1 };
  } else if (sort === 'valueDesc') {
    sortStage = { 'item.coinValue': -1 };
  } else if (sort === 'nameAsc') {
    sortStage = { 'item.name': 1 };
  } else if (sort === 'quantityDesc') {
    sortStage = { quantity: -1 };
  }

  pipeline.push({
    $facet: {
      items: [
        { $sort: sortStage },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum },
      ],
      total: [{ $count: 'count' }],
      stats: [
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' },
            totalValue: { $sum: { $multiply: ['$quantity', '$item.coinValue'] } },
          },
        },
      ],
    },
  });

  const [result] = await Inventory.aggregate(pipeline);
  const total = result.total[0]?.count || 0;
  const stats = result.stats[0] || { totalQuantity: 0, totalValue: 0 };

  // Tổng số vật phẩm có trong game để tính % hoàn thành bộ sưu tập
  const totalCatalogItems = await Item.countDocuments();
  const uniqueOwnedCount = await Inventory.countDocuments({ userId });
  const completionRate = totalCatalogItems > 0 ? Math.round((uniqueOwnedCount / totalCatalogItems) * 100) : 0;

  return {
    items: result.items.map((entry) => ({
      id: entry._id,
      quantity: entry.quantity,
      isEquipped: entry.isEquipped,
      acquiredAt: entry.createdAt,
      item: entry.item,
    })),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      hasNext: pageNum * limitNum < total,
    },
    summary: {
      uniqueOwned: uniqueOwnedCount,
      totalCatalog: totalCatalogItems,
      completionRate,
      totalQuantity: stats.totalQuantity,
      totalValue: stats.totalValue,
    },
  };
}

// Bán vật phẩm trong túi để lấy lại Xu
async function sellItem(userId, { inventoryId, quantity = 1 }) {
  const sellQty = Math.max(1, Number.parseInt(quantity, 10) || 1);

  const inventoryEntry = await Inventory.findOne({
    _id: inventoryId,
    userId,
  }).populate('itemId');

  if (!inventoryEntry) {
    throw httpError('Không tìm thấy vật phẩm trong túi đồ của bạn', 404, 'NOT_FOUND');
  }

  if (inventoryEntry.quantity < sellQty) {
    throw httpError(
      `Bạn chỉ có ${inventoryEntry.quantity} vật phẩm, không thể bán ${sellQty}`,
      400,
      'INVALID_QUANTITY'
    );
  }

  const item = inventoryEntry.itemId;
  const refundAmount = (item.coinValue || 20) * sellQty;

  // Cập nhật số lượng hoặc xóa khỏi túi
  if (inventoryEntry.quantity === sellQty) {
    await Inventory.deleteOne({ _id: inventoryId });
  } else {
    inventoryEntry.quantity -= sellQty;
    await inventoryEntry.save();
  }

  // Cộng Xu vào ví
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }

  wallet.balance += refundAmount;
  wallet.totalEarned += refundAmount;
  await wallet.save();

  return {
    soldItem: {
      name: item.name,
      rarity: item.rarity,
      icon: item.icon,
      soldQuantity: sellQty,
    },
    refundedCoins: refundAmount,
    remainingBalance: wallet.balance,
    remainingQuantity: Math.max(0, inventoryEntry.quantity - sellQty),
    message: `Đã bán thành công x${sellQty} ${item.name} và nhận lại +${refundAmount} Xu!`,
  };
}

// Lịch sử mở hòm của cá nhân người dùng
async function getCaseHistory(userId, { limit = 20 }) {
  const limitNum = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 20));

  const logs = await CaseOpenLog.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .populate('itemId')
    .lean();

  return logs.map((log) => ({
    id: log._id,
    caseId: log.caseId,
    cost: log.cost,
    openedAt: log.createdAt,
    item: log.itemId,
  }));
}

// Bảng tin các lượt mở hòm xịn gần nhất (toàn server)
async function getRecentDrops({ limit = 10 } = {}) {
  const limitNum = Math.min(20, Math.max(1, Number.parseInt(limit, 10) || 10));

  const logs = await CaseOpenLog.find()
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .populate('itemId')
    .populate({ path: 'userId', select: 'username avatarUrl' })
    .lean();

  return logs
    .filter((l) => l.itemId && l.userId)
    .map((log) => ({
      id: log._id,
      caseId: log.caseId,
      openedAt: log.createdAt,
      item: {
        name: log.itemId.name,
        rarity: log.itemId.rarity,
        icon: log.itemId.icon,
        type: log.itemId.type,
      },
      user: {
        username: log.userId.username ? `${log.userId.username.slice(0, 3)}***` : 'Gamer',
      },
    }));
}

module.exports = {
  CASE_CONFIGS,
  getWallet,
  claimDailyReward,
  buyKey,
  getCases,
  openCase,
  getInventory,
  sellItem,
  getCaseHistory,
  getRecentDrops,
};
