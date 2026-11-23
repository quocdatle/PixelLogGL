const mongoose = require('mongoose');
const connectDB = require('../../src/config/db');
require('../../src/modules/games/game.model');
const UserGame = require('../../src/modules/library/userGame.model');
const User = require('../../src/modules/users/user.model');

/**
 * Script tạo dữ liệu phiên chơi (playSessions) trong vòng 30 ngày gần đây
 * cho tài khoản 'test' để phục vụ demo các biểu đồ thống kê:
 * - Biểu đồ giờ chơi theo ngày (Daily Playtime - 7 ngày gần nhất)
 * - Biểu đồ giờ chơi theo tuần (Weekly Playtime - các tuần gần nhất)
 * - Biểu đồ giờ chơi theo tháng (Monthly Playtime)
 * - Nhật ký lịch sử chơi trong chi tiết game
 */

async function seedPlaytime() {
  await connectDB();

  const user = await User.findOne({ username: 'test' });
  if (!user) {
    console.error('[SEED] Không tìm thấy user test');
    process.exit(1);
  }

  const userGames = await UserGame.find({ userId: user._id }).populate('gameId');
  if (userGames.length === 0) {
    console.error('[SEED] User test chưa có game trong thư viện');
    process.exit(1);
  }

  const gameMap = new Map();
  for (const ug of userGames) {
    gameMap.set(ug.gameId.name, ug);
  }

  console.log(`[SEED] Tìm thấy ${userGames.length} tựa game trong thư viện của user 'test':`);
  userGames.forEach((ug) => console.log(`  - ${ug.gameId.name} (${ug.status})`));

  // Định nghĩa các phiên chơi theo ngày (từ 2026-10-25 đến 2026-11-23)
  // Thời gian theo giờ Việt Nam (UTC+7) -> chuyển sang UTC Date
  const vnDate = (year, month, day, hour = 20, minute = 0) => {
    // Tháng trong JS 0-indexed: month - 1
    return new Date(Date.UTC(year, month - 1, day, hour - 7, minute));
  };

  const sessionsConfig = [
    // --- Tuần hiện tại (17/11 - 23/11/2026) ---
    // 23/11 (Hôm nay - Thứ Hai)
    { game: 'Warframe', date: vnDate(2026, 11, 23, 17, 30), minutes: 45, note: 'Farm relic Lith & Meso' },
    { game: 'Elden Ring', date: vnDate(2026, 11, 23, 14, 0), minutes: 60, note: 'Khám phá Leyndell Royal Capital' },

    // 22/11 (Chủ nhật)
    { game: 'Elden Ring', date: vnDate(2026, 11, 22, 20, 15), minutes: 90, note: 'Đánh boss Godfrey' },
    { game: 'Warframe', date: vnDate(2026, 11, 22, 15, 30), minutes: 120, note: 'Săn Eidolon Teralyst ban đêm' },

    // 21/11 (Thứ Bảy)
    { game: 'Hollow Knight: Silksong', date: vnDate(2026, 11, 21, 21, 0), minutes: 150, note: 'Chinh phục mê cung Pharloom' },
    { game: 'Ori and the Will of the Wisps', date: vnDate(2026, 11, 21, 14, 30), minutes: 90, note: 'Mở khóa kỹ năng bơi lội dưới nước' },

    // 20/11 (Thứ Sáu)
    { game: 'Warframe', date: vnDate(2026, 11, 20, 20, 45), minutes: 110, note: 'Cày Steel Path Incursion' },

    // 19/11 (Thứ Năm)
    { game: 'Elden Ring', date: vnDate(2026, 11, 19, 19, 30), minutes: 75, note: 'Leo tháp Ranni Rise' },
    { game: 'Counter-Strike: Global Offensive', date: vnDate(2026, 11, 19, 13, 30), minutes: 45, note: 'Khởi động Deathmatch và 1 trận Competitive' },

    // 18/11 (Thứ Tư)
    { game: 'Ori and the Will of the Wisps', date: vnDate(2026, 11, 18, 21, 15), minutes: 80, note: 'Trốn thoát quái vật khổng lồ ở Silent Woods' },

    // 17/11 (Thứ Ba)
    { game: 'Warframe', date: vnDate(2026, 11, 17, 20, 0), minutes: 95, note: 'Nâng cấp vũ khí Incarnon Genesis' },

    // --- Tuần trước (10/11 - 16/11/2026) ---
    // 16/11 (Thứ Hai)
    { game: 'Hollow Knight: Silksong', date: vnDate(2026, 11, 16, 19, 30), minutes: 60, note: 'Rèn luyện kỹ năng tơ lụa' },

    // 15/11 (Chủ nhật)
    { game: 'Red Dead Redemption 2', date: vnDate(2026, 11, 15, 21, 0), minutes: 135, note: 'Săn thú huyền thoại & cắm trại Valentine' },
    { game: 'Warframe', date: vnDate(2026, 11, 15, 15, 0), minutes: 120, note: 'Cày nguyên liệu Entrati gia tộc' },

    // 14/11 (Thứ Bảy)
    { game: 'Elden Ring', date: vnDate(2026, 11, 14, 20, 30), minutes: 160, note: 'Chinh phục Volcano Manor' },
    { game: 'Ori and the Will of the Wisps', date: vnDate(2026, 11, 14, 14, 30), minutes: 75, note: 'Giải đố hang động ánh sáng' },

    // 13/11 (Thứ Sáu)
    { game: 'Warframe', date: vnDate(2026, 11, 13, 20, 0), minutes: 100, note: 'Chạy nhiệm vụ Sortie hằng ngày' },

    // 12/11 (Thứ Năm)
    { game: 'Counter-Strike: Global Offensive', date: vnDate(2026, 11, 12, 19, 15), minutes: 85, note: 'Clutch 1v4 map Mirage' },

    // 11/11 (Thứ Tư)
    { game: 'Hollow Knight', date: vnDate(2026, 11, 11, 20, 45), minutes: 70, note: 'Thử thách đền Pantheon of Hallownest' },

    // 09/11 (Thứ Hai)
    { game: 'Warframe', date: vnDate(2026, 11, 9, 19, 30), minutes: 60, note: 'Đổi ducats mua hàng Baro Ki’Teer' },

    // --- Tuần trước nữa (03/11 - 09/11/2026) ---
    // 08/11 (Chủ nhật)
    { game: 'Elden Ring', date: vnDate(2026, 11, 8, 21, 0), minutes: 140, note: 'Đánh bại Radahn tại sa mạc Caelid' },
    { game: 'Warframe', date: vnDate(2026, 11, 8, 16, 0), minutes: 110, note: 'Cày kuva và roll riven mod' },

    // 07/11 (Thứ Bảy)
    { game: 'Hollow Knight: Silksong', date: vnDate(2026, 11, 7, 20, 30), minutes: 120, note: 'Tìm kiếm huy hiệu ẩn và công thức chế đồ' },
    { game: 'Ori and the Will of the Wisps', date: vnDate(2026, 11, 7, 15, 0), minutes: 90, note: 'Đua tốc độ Spirit Trial' },

    // 06/11 (Thứ Sáu)
    { game: 'Counter-Strike: Global Offensive', date: vnDate(2026, 11, 6, 21, 0), minutes: 90, note: 'Bắn rank cùng đồng đội tối thứ sáu' },

    // 05/11 (Thứ Năm)
    { game: 'Warframe', date: vnDate(2026, 11, 5, 20, 0), minutes: 80, note: 'Chơi chế độ Circuit The Duviri Paradox' },

    // 04/11 (Thứ Tư)
    { game: 'Red Dead Redemption 2', date: vnDate(2026, 11, 4, 19, 45), minutes: 90, note: 'Đi tàu hỏa và câu cá hồ Isabella' },

    // 03/11 (Thứ Ba)
    { game: 'Elden Ring', date: vnDate(2026, 11, 3, 20, 15), minutes: 70, note: 'Khám phá học viện Raya Lucaria' },

    // 02/11 (Thứ Hai)
    { game: 'Hollow Knight', date: vnDate(2026, 11, 2, 19, 0), minutes: 60, note: 'Thu thập Grubs ở City of Tears' },

    // --- Cuối tháng 10/2026 (25/10 - 01/11/2026) ---
    // 01/11 (Chủ nhật)
    { game: 'Warframe', date: vnDate(2026, 11, 1, 21, 30), minutes: 150, note: 'Cày sự kiện Halloween Nightwave' },
    { game: 'Counter-Strike: Global Offensive', date: vnDate(2026, 11, 1, 15, 30), minutes: 110, note: 'Full stack 5 người map Inferno' },

    // 31/10 (Thứ Bảy - Halloween)
    { game: 'Elden Ring', date: vnDate(2026, 10, 31, 21, 0), minutes: 180, note: 'Khám phá lâu đài ma quái Stormveil Castle' },
    { game: 'Ori and the Will of the Wisps', date: vnDate(2026, 10, 31, 14, 45), minutes: 60, note: 'Mở rộng khu định cư Wellspring Glades' },

    // 30/10 (Thứ Sáu)
    { game: 'Warframe', date: vnDate(2026, 10, 30, 20, 30), minutes: 90, note: 'Lắp ráp Warframe mới' },

    // 29/10 (Thứ Năm)
    { game: 'Hollow Knight: Silksong', date: vnDate(2026, 10, 29, 19, 15), minutes: 85, note: 'Khám phá vùng rêu Moss Grotto' },

    // 28/10 (Thứ Tư)
    { game: 'Red Dead Redemption 2', date: vnDate(2026, 10, 28, 20, 0), minutes: 75, note: 'Làm nhiệm vụ cướp ngân hàng cùng băng nhóm' },

    // 26/10 (Thứ Hai)
    { game: 'Warframe', date: vnDate(2026, 10, 26, 19, 30), minutes: 70, note: 'Thử nghiệm vũ khí mới rèn xong' },

    // 25/10 (Chủ nhật)
    { game: 'Elden Ring', date: vnDate(2026, 10, 25, 21, 0), minutes: 120, note: 'Đánh bại Margit the Fell Omen' },
    { game: 'Ori and the Will of the Wisps', date: vnDate(2026, 10, 25, 16, 0), minutes: 80, note: 'Bắt đầu cuộc hành trình mới' },
  ];

  // Nhóm các session theo từng UserGame
  const sessionsByGame = new Map();
  for (const item of sessionsConfig) {
    const ug = gameMap.get(item.game);
    if (!ug) {
      console.warn(`[SEED] Cảnh báo: Không tìm thấy game '${item.game}' trong thư viện của user 'test'`);
      continue;
    }
    if (!sessionsByGame.has(ug._id.toString())) {
      sessionsByGame.set(ug._id.toString(), []);
    }
    sessionsByGame.get(ug._id.toString()).push({
      playedAt: item.date,
      minutes: item.minutes,
      note: item.note,
    });
  }

  console.log(`\n[SEED] Bắt đầu ghi ${sessionsConfig.length} phiên chơi vào database...`);

  let totalSessionsAdded = 0;
  for (const [userGameId, newSessions] of sessionsByGame.entries()) {
    const ug = userGames.find((g) => g._id.toString() === userGameId);
    if (!ug) continue;

    // Gán danh sách playSessions (sắp xếp theo thời gian tăng dần)
    newSessions.sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
    ug.playSessions = newSessions;

    // Tính tổng giờ chơi từ các session này
    const sessionsMinutes = newSessions.reduce((sum, s) => sum + s.minutes, 0);
    const sessionsHours = Math.round((sessionsMinutes / 60) * 10) / 10;

    // Đảm bảo hoursPlayed ít nhất bằng tổng giờ các session
    if ((ug.hoursPlayed || 0) < sessionsHours) {
      ug.hoursPlayed = sessionsHours;
    }

    await ug.save();
    totalSessionsAdded += newSessions.length;
    console.log(
      `  ✓ Đã cập nhật ${newSessions.length} phiên chơi cho "${ug.gameId.name}" (Tổng session: ${sessionsHours}h / Tổng tích lũy: ${ug.hoursPlayed}h)`
    );
  }

  console.log(`\n[SEED] Hoàn tất! Đã thêm thành công tổng cộng ${totalSessionsAdded} phiên chơi trong 30 ngày qua cho user 'test'.`);
  process.exit(0);
}

seedPlaytime().catch((err) => {
  console.error('[SEED] Lỗi khi tạo dữ liệu phiên chơi:', err);
  process.exit(1);
});
