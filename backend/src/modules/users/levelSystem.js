const MAX_LEVEL = 100;
const CHECK_IN_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const STREAK_GRACE_MS = 48 * 60 * 60 * 1000;

const AVATAR_FRAMES = [
  {
    id: 'frame_lv10',
    milestoneLevel: 10,
    name: 'Lục Bảo Khởi Nguyên',
    tier: 'Uncommon',
    description: 'Phần thưởng mốc cấp 10 — Viền ngọc lục bảo phát sáng nhẹ.',
  },
  {
    id: 'frame_lv20',
    milestoneLevel: 20,
    name: 'Xung Nhịp Bầu Trời',
    tier: 'Rare',
    description: 'Phần thưởng mốc cấp 20 — Vòng năng lượng cyber xanh lam.',
  },
  {
    id: 'frame_lv30',
    milestoneLevel: 30,
    name: 'Thạch Anh Tím',
    tier: 'Rare',
    description: 'Phần thưởng mốc cấp 30 — Hào quang thạch anh tím huyền bí.',
  },
  {
    id: 'frame_lv40',
    milestoneLevel: 40,
    name: 'Hoàng Kim Kỵ Sĩ',
    tier: 'Epic',
    description: 'Phần thưởng mốc cấp 40 — Khung vàng hoàng gia rực rỡ.',
  },
  {
    id: 'frame_lv50',
    milestoneLevel: 50,
    name: 'Phượng Hoàng Lửa',
    tier: 'Epic',
    description: 'Phần thưởng mốc cấp 50 — Ngọn lửa rực cháy nửa chặng đường.',
  },
  {
    id: 'frame_lv60',
    milestoneLevel: 60,
    name: 'Dạ Ảnh Lam Ngọc',
    tier: 'Epic',
    description: 'Phần thưởng mốc cấp 60 — Sắc chàm huyền ảo kết hợp tinh thể băng.',
  },
  {
    id: 'frame_lv70',
    milestoneLevel: 70,
    name: 'Băng Tinh Vĩnh Cửu',
    tier: 'Legendary',
    description: 'Phần thưởng mốc cấp 70 — Vòng hào quang băng giá đa sắc.',
  },
  {
    id: 'frame_lv80',
    milestoneLevel: 80,
    name: 'Tinh Tú Rực Rỡ',
    tier: 'Legendary',
    description: 'Phần thưởng mốc cấp 80 — Tinh vân vũ trụ xoay quanh ảnh đại diện.',
  },
  {
    id: 'frame_lv90',
    milestoneLevel: 90,
    name: 'Hư Không Hỗn Mang',
    tier: 'Mythic',
    description: 'Phần thưởng mốc cấp 90 — Lõi năng lượng kép của bậc thầy.',
  },
  {
    id: 'frame_lv100',
    milestoneLevel: 100,
    name: 'Huyền Thoại Tối Thượng',
    tier: 'Grandmaster',
    description: 'Phần thưởng mốc cấp tối đa 100 — Vầng hào quang cầu vồng vĩnh cửu.',
  },
];

const FRAME_MAP = new Map(AVATAR_FRAMES.map((frame) => [frame.id, frame]));

/**
 * Số lần điểm danh cần thiết để lên từ cấp `level` sang `level + 1`.
 * Cấp càng cao càng cần nhiều lần điểm danh, tối đa cấp 100.
 */
function getRequiredCheckIns(level) {
  const safeLevel = Math.max(1, Math.min(Number(level) || 1, MAX_LEVEL));
  if (safeLevel >= MAX_LEVEL) return 0;
  return Math.floor((safeLevel - 1) / 10) + 1;
}

function getFrameForLevel(level) {
  if (level % 10 !== 0 || level < 10 || level > MAX_LEVEL) return null;
  return AVATAR_FRAMES.find((f) => f.milestoneLevel === level) || null;
}

function ensureMilestoneFrames(user) {
  const currentLevel = Math.max(1, Math.min(user.level || 1, MAX_LEVEL));
  const unlocked = new Set(Array.isArray(user.unlockedFrames) ? user.unlockedFrames : []);
  const newlyUnlocked = [];

  for (let lv = 10; lv <= currentLevel; lv += 10) {
    const frame = getFrameForLevel(lv);
    if (frame && !unlocked.has(frame.id)) {
      unlocked.add(frame.id);
      newlyUnlocked.push(frame);
    }
  }

  user.unlockedFrames = Array.from(unlocked);
  return newlyUnlocked;
}

function canCheckIn(lastCheckInAt, now = new Date()) {
  if (!lastCheckInAt) return { canCheckIn: true, nextCheckInAt: null, remainingMs: 0 };
  const lastMs = new Date(lastCheckInAt).getTime();
  const elapsed = now.getTime() - lastMs;
  if (elapsed >= CHECK_IN_COOLDOWN_MS) {
    return { canCheckIn: true, nextCheckInAt: null, remainingMs: 0 };
  }
  const remainingMs = CHECK_IN_COOLDOWN_MS - elapsed;
  return {
    canCheckIn: false,
    nextCheckInAt: new Date(lastMs + CHECK_IN_COOLDOWN_MS),
    remainingMs,
  };
}

function applyDailyCheckInToUser(user, now = new Date()) {
  const previousLevel = Math.max(1, Math.min(user.level || 1, MAX_LEVEL));
  user.level = previousLevel;
  user.checkInProgress = Math.max(0, user.checkInProgress || 0);
  user.totalCheckIns = Math.max(0, user.totalCheckIns || 0);

  // Cập nhật chuỗi điểm danh
  if (user.lastCheckInAt) {
    const elapsed = now.getTime() - new Date(user.lastCheckInAt).getTime();
    user.checkInStreak = elapsed <= STREAK_GRACE_MS ? (user.checkInStreak || 0) + 1 : 1;
  } else {
    user.checkInStreak = 1;
  }

  user.totalCheckIns += 1;
  user.lastCheckInAt = now;

  if (user.level < MAX_LEVEL) {
    user.checkInProgress += 1;
    while (user.level < MAX_LEVEL) {
      const required = getRequiredCheckIns(user.level);
      if (user.checkInProgress < required) break;
      user.checkInProgress -= required;
      user.level += 1;
    }
    if (user.level >= MAX_LEVEL) {
      user.level = MAX_LEVEL;
      user.checkInProgress = 0;
    }
  }

  const newlyUnlockedFrames = ensureMilestoneFrames(user);
  // Tự động trang bị khung mới nếu người dùng chưa trang bị khung nào
  if (newlyUnlockedFrames.length > 0 && !user.equippedFrame) {
    user.equippedFrame = newlyUnlockedFrames[newlyUnlockedFrames.length - 1].id;
  }

  return {
    previousLevel,
    newLevel: user.level,
    leveledUp: user.level > previousLevel,
    newlyUnlockedFrames,
  };
}

module.exports = {
  MAX_LEVEL,
  CHECK_IN_COOLDOWN_MS,
  AVATAR_FRAMES,
  FRAME_MAP,
  getRequiredCheckIns,
  getFrameForLevel,
  ensureMilestoneFrames,
  canCheckIn,
  applyDailyCheckInToUser,
};
