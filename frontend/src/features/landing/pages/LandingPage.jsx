import { Link } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import ThemeToggle from '../../../components/common/ThemeToggle';
import AvatarWithFrame from '../../../components/common/AvatarWithFrame';
import BrandLogo from '../../../components/common/BrandLogo';
import { AVATAR_FRAME_STYLES } from '../../../utils/avatarFrames';

const FEATURES = [
  {
    title: 'Thư viện Game & Nhật ký Chơi',
    description:
      'Quản lý toàn bộ game đang chơi, backlog và wishlist với dữ liệu từ IGDB. Lưu nhật ký từng phiên chơi, chấm điểm cá nhân và xem ảnh chụp màn hình HD.',
    iconPath:
      'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    accent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'Cố vấn AI Thấu hiểu Gu Game',
    description:
      'Trợ lý AI đọc lịch sử và thể loại bạn yêu thích để gợi ý tựa game phù hợp, kèm thẻ game tương tác giúp thêm vào kho chỉ với một lần bấm.',
    iconPath:
      'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    accent: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
  },
  {
    title: 'Điểm danh Lên cấp & Khung Avatar',
    description:
      'Điểm danh hàng ngày để nhận PixelCoins và tích lũy cấp độ tới mốc tối đa Cấp 100. Đạt mỗi mốc chia hết cho 10 để mở khóa khung avatar độc quyền.',
    iconPath:
      'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    accent: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    title: 'Thống kê Trực quan & Mở Rương Gacha',
    description:
      'Theo dõi biểu đồ giờ chơi theo tuần, phân bổ thể loại yêu thích và dùng PixelCoins kiếm được để thử vận may mở rương sưu tập vật phẩm hiếm.',
    iconPath:
      'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    accent: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
];

const SHOWCASE_FRAMES = [
  AVATAR_FRAME_STYLES.frame_lv10,
  AVATAR_FRAME_STYLES.frame_lv40,
  AVATAR_FRAME_STYLES.frame_lv70,
  AVATAR_FRAME_STYLES.frame_lv100,
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-150">
      <div>
        {/* Top Public Header */}
        <header className="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-2 sm:gap-4">
            <Link
              to="/"
              className="inline-flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
            >
              <BrandLogo size="md" />
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="hidden sm:inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
                  >
                    {user?.username || 'Hồ sơ'}
                  </Link>
                  <Link
                    to="/library"
                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
                  >
                    <span>Vào Thư viện</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
                  >
                    Bắt đầu ngay
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div
            className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-violet-500/15"
            aria-hidden="true"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Copy */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-800/70">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span>Nền tảng Quản lý Thư viện Game & AI Companion</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
                  Lưu giữ mọi hành trình{' '}
                  <span className="text-emerald-600 dark:text-emerald-400">
                    chinh phục thế giới game
                  </span>{' '}
                  của riêng bạn.
                </h1>

                <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
                  PixelLog GL giúp bạn sắp xếp kho game khoa học, ghi nhận nhật ký chơi mỗi ngày, nhận gợi ý cá nhân hóa từ Cố vấn AI và thăng cấp mở khóa khung avatar độc quyền.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {isAuthenticated ? (
                    <Link
                      to="/library"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm sm:text-base transition-colors shadow-md shadow-emerald-900/15"
                    >
                      <span>Mở Thư viện cá nhân</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm sm:text-base transition-colors shadow-md shadow-emerald-900/15"
                      >
                        <span>Tạo kho game miễn phí</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-bold text-sm sm:text-base border border-zinc-200 dark:border-zinc-800 transition-colors"
                      >
                        Đã có tài khoản? Đăng nhập
                      </Link>
                    </>
                  )}
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-4 max-w-md">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tabular-nums">
                      500K+
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Tựa game từ IGDB
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      Lv. 100
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Hệ thống thăng cấp
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                      10 Khung
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Avatar mốc 10–100
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Preview Card */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Lộ trình phần thưởng
                      </div>
                      <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white mt-0.5">
                        Điểm danh mỗi ngày, mở khóa khung hiếm
                      </h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                      +150 Xu/ngày
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {SHOWCASE_FRAMES.map((frame) => (
                      <div
                        key={frame.id}
                        className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 flex flex-col items-center text-center gap-2.5"
                      >
                        <AvatarWithFrame
                          frameId={frame.id}
                          previewLevel={frame.milestoneLevel}
                          size="md"
                          showLevelBadge
                        />

                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white">
                            {frame.name}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Mốc Cấp {frame.milestoneLevel} • {frame.tier}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      Cơ chế công bằng:
                    </span>{' '}
                    Cấp càng cao số lần điểm danh cần để thăng cấp càng tăng, giúp những huy hiệu Cấp 50–100 trở thành biểu tượng tự hào thực sự trên thanh điều hướng.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Mọi công cụ game thủ cần trong một không gian duy nhất
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              Từ quản lý backlog, ghi nhật ký hành trình đến cố vấn AI gợi ý game và minigame mở rương giải trí.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${feat.accent}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feat.iconPath} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-200 dark:border-zinc-800/80 text-center text-sm text-zinc-600 dark:text-zinc-400">
        PixelLog GL © 2026. Nền tảng quản lý game và trợ lý AI thông minh.
      </footer>
    </div>
  );
}
