const mongoose = require('mongoose');
const Item = require('./item.model');
const Wallet = require('./wallet.model');
const Inventory = require('./inventory.model');
const CaseOpenLog = require('./caseOpenLog.model');
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

// Lấy hoặc khởi tạo ví của người dùng
async function getWallet(userId) {
  let wallet = await Wallet.findOne({ userId });

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
  let canClaimDaily = true;
  let nextDailyAt = null;

  if (wallet.lastDailyReward) {
    const elapsed = now.getTime() - new Date(wallet.lastDailyReward).getTime();
    const cooldownMs = 24 * 60 * 60 * 1000;
    if (elapsed < cooldownMs) {
      canClaimDaily = false;
      nextDailyAt = new Date(new Date(wallet.lastDailyReward).getTime() + cooldownMs);
    }
  }

  return {
    balance: wallet.balance,
    totalEarned: wallet.totalEarned,
    totalSpent: wallet.totalSpent,
    canClaimDaily,
    nextDailyAt,
    dailyRewardAmount: DAILY_REWARD_AMOUNT,
  };
}

// Điểm danh nhận xu hàng ngày (Daily Check-in)
async function claimDailyReward(userId) {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }

  const now = new Date();
  if (wallet.lastDailyReward) {
    const elapsed = now.getTime() - new Date(wallet.lastDailyReward).getTime();
    const cooldownMs = 24 * 60 * 60 * 1000;
    if (elapsed < cooldownMs) {
      const waitMinutes = Math.ceil((cooldownMs - elapsed) / (60 * 1000));
      const hours = Math.floor(waitMinutes / 60);
      const minutes = waitMinutes % 60;
      throw httpError(
        `Bạn đã nhận xu hôm nay rồi. Vui lòng quay lại sau ${hours} giờ ${minutes} phút.`,
        400,
        'ALREADY_CLAIMED'
      );
    }
  }

  wallet.balance += DAILY_REWARD_AMOUNT;
  wallet.totalEarned += DAILY_REWARD_AMOUNT;
  wallet.lastDailyReward = now;
  await wallet.save();

  const nextDailyAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    balance: wallet.balance,
    claimedAmount: DAILY_REWARD_AMOUNT,
    nextDailyAt,
    message: `Điểm danh thành công! Bạn nhận được +${DAILY_REWARD_AMOUNT} Xu.`,
  };
}

// Lấy danh sách rương và thông số tỷ lệ
async function getCases() {
  await ensureItemsSeeded();
  const allItems = await Item.find().sort({ coinValue: 1 }).lean();

  return Object.values(CASE_CONFIGS).map((c) => ({
    ...c,
    itemCount: allItems.length,
    poolPreview: allItems.slice(0, 8),
  }));
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

  if (wallet.balance < caseConfig.cost) {
    throw httpError(
      `Số dư không đủ. Bạn cần ${caseConfig.cost} Xu nhưng hiện chỉ có ${wallet.balance} Xu.`,
      400,
      'INSUFFICIENT_FUNDS'
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

  // 4. Trừ xu trong ví
  wallet.balance -= caseConfig.cost;
  wallet.totalSpent += caseConfig.cost;
  await wallet.save();

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
    remainingBalance: wallet.balance,
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
  getCases,
  openCase,
  getInventory,
  sellItem,
  getCaseHistory,
  getRecentDrops,
};
