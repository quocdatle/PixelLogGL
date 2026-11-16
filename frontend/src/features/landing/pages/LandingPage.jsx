import { Link } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import ThemeToggle from "../../../components/common/ThemeToggle";
import AvatarWithFrame from "../../../components/common/AvatarWithFrame";
import BrandLogo from "../../../components/common/BrandLogo";
import { AVATAR_FRAME_STYLES } from "../../../utils/avatarFrames";

import {
  BACKDROP_POSTERS,
  eldenRingPoster,
  cyberpunkPoster,
} from "../constants/backdropPosters";

const SHOWCASE_FRAMES = [
  AVATAR_FRAME_STYLES.frame_lv10,
  AVATAR_FRAME_STYLES.frame_lv40,
  AVATAR_FRAME_STYLES.frame_lv70,
  AVATAR_FRAME_STYLES.frame_lv100,
];

function StarIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 fill-amber-500 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.316.492-.474.966-.567 1.344-.197.802-.13 1.49.014 2.008-.67-.33-1.398-.82-1.946-1.516a1 1 0 00-1.709.757C5.7 7.07 5.6 8.5 6.13 9.878c-.674-.187-1.33-.518-1.87-.978a1 1 0 00-1.608.82C2.65 11.835 3.37 13.9 4.7 15.357 6.13 16.924 8.01 17.75 10 17.75c2.08 0 4.02-.876 5.42-2.486 1.37-1.572 1.95-3.75 1.47-5.88-.36-1.6-1.3-2.99-2.58-3.95-.58-.43-1.18-.74-1.72-.94a7.9 7.9 0 00-.195-1.941zM10 16.25c-1.56 0-3-.64-4.08-1.83-.98-1.078-1.48-2.59-1.29-4.13.43.34.93.61 1.47.81a1 1 0 001.21-.49c.27-.58.33-1.36.19-2.12-.11-.6-.29-1.13-.53-1.61.42.44.92.83 1.48 1.15a1 1 0 001.44-.65c.18-.72.33-1.6.33-2.54 0-.17-.01-.33-.03-.49.33.22.65.48.94.79 1.1 1.17 1.7 2.68 1.54 4.2-.14 1.32-.85 2.47-1.88 3.12a1 1 0 00-.47.86c0 .4.24.75.6.9.4.17.85.12 1.2-.13.38-.28.71-.62.98-1.02-.19 1.58-.99 2.95-2.18 3.95-.87.73-1.88 1.12-2.98 1.12z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between overflow-x-hidden transition-colors duration-150">
      <div>
        {/* Top Navigation */}
        <header
          className="w-full bg-white dark:bg-zinc-900 sticky top-0 z-40" /* taste-skill-ignore: sticky nav border */
        >
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
                    className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
                  >
                    {user?.username || "Hồ sơ"}
                  </Link>
                  <Link
                    to="/library"
                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
                  >
                    <span>Vào Thư viện</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
                  >
                    Bắt đầu ngay
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section with Visible Atmospheric Gaming Backdrop */}
        <section className="relative overflow-hidden">
          {/* Real Game Artwork Poster Backdrop */}
          <div
            className="absolute inset-0 pointer-events-none select-none overflow-hidden"
            aria-hidden="true"
          >
            {/* Tilted Infinite Horizontal Scrolling Poster Reel on the right side */}
            <div className="absolute -top-10 -right-16 sm:-right-8 lg:right-0 w-[95%] sm:w-[75%] lg:w-[60%] opacity-45 dark:opacity-55 overflow-hidden transform rotate-2">
              <div className="flex w-max animate-infinite-scroll">
                {/* Track 1 (30 game posters) */}
                <div className="grid grid-rows-2 grid-flow-col gap-3.5 pr-3.5 shrink-0">
                  {BACKDROP_POSTERS.map((poster) => (
                    <div
                      key={`t1-${poster.id}`}
                      className="w-[140px] sm:w-[180px] lg:w-[220px] aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-800 shrink-0"
                    >
                      <img
                        src={poster.img}
                        alt=""
                        className="w-full h-full object-cover filter contrast-110 saturate-110"
                        loading="eager"
                      />
                    </div>
                  ))}
                </div>
                {/* Track 2 (Duplicate for Infinite Scroll) */}
                <div className="grid grid-rows-2 grid-flow-col gap-3.5 pr-3.5 shrink-0" aria-hidden="true">
                  {BACKDROP_POSTERS.map((poster) => (
                    <div
                      key={`t2-${poster.id}`}
                      className="w-[140px] sm:w-[180px] lg:w-[220px] aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-800 shrink-0"
                    >
                      <img
                        src={poster.img}
                        alt=""
                        className="w-full h-full object-cover filter contrast-110 saturate-110"
                        loading="eager"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrim làm mờ nhỏ gọn: Chỉ phủ nhẹ bên văn bản bên trái (w-full lg:w-[40%]), không lấn sang vùng poster */}
            <div
              className="absolute inset-y-0 left-0 w-full lg:w-[40%] bg-gradient-to-r from-zinc-50 via-zinc-50/70 to-transparent dark:from-zinc-950 dark:via-zinc-950/70 dark:to-transparent" /* taste-skill-ignore: neutral backdrop scrim for game atmosphere */
            />
            <div
              className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-50 to-transparent dark:from-zinc-950 to-transparent" /* taste-skill-ignore: neutral backdrop scrim for game atmosphere */
            />
            <div
              className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-zinc-50 to-transparent dark:from-zinc-950 dark:to-transparent" /* taste-skill-ignore: neutral backdrop scrim for game atmosphere */
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Copy: Punchy 2-line title & high-action CTA */}
              <div className="lg:col-span-7 space-y-5">
                <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
                  Kho game của bạn.
                  <br />
                  Quản lý trọn vẹn.
                </h1>

                <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-200 max-w-xl leading-relaxed">
                  Đồng bộ thư viện từ 500K+ trò chơi, nhận gợi ý chuẩn gu từ AI
                  và thăng hạng mở khóa khung avatar danh giá.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {isAuthenticated ? (
                    <Link
                      to="/library"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-base transition-colors"
                    >
                      <span>Vào Thư viện cá nhân</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-base transition-colors"
                      >
                        <span>Tạo kho game ngay</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </Link>
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white font-semibold text-base transition-colors"
                      >
                        Đã có tài khoản? Đăng nhập
                      </Link>
                    </>
                  )}
                </div>

                {/* Quick Trust Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-4 max-w-md">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tabular-nums">
                      500K+
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      Tựa game hỗ trợ
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      Cấp 100
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      Hệ thống thăng hạng
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                      10 Khung
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      Avatar danh giá
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Live Activity Preview Card */}
              <div className="lg:col-span-5">
                <div
                  data-ui="hero-preview"
                  className="rounded-3xl bg-white dark:bg-zinc-900 p-6 space-y-5 border border-zinc-200/50 dark:border-zinc-800/60"
                >
                  {/* Gamer Identity Header */}
                  <div
                    className="flex items-center justify-between pb-4" /* taste-skill-ignore: preview card divider */
                  >
                    <div className="flex items-center gap-3">
                      <AvatarWithFrame
                        frameId="frame_lv70"
                        previewLevel={70}
                        size="md"
                        showLevelBadge
                      />
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white">
                          Arthur_Gamer
                        </div>
                        <div className="text-[13px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Cấp 70 • Khung Tinh Anh
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <FlameIcon />
                      <span>Chuỗi 7 ngày</span>
                    </span>
                  </div>

                  {/* Active Game Playing Snapshot with Real Poster */}
                  <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-4 flex items-center gap-4">
                    <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
                      <img
                        src={eldenRingPoster}
                        alt="Elden Ring"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[13px] font-bold bg-sky-700 text-white">
                          Đang chơi
                        </span>
                        <div className="flex items-center gap-1 text-[13px] font-bold text-amber-500">
                          <StarIcon />
                          <span>5.0</span>
                        </div>
                      </div>
                      <div className="text-base font-bold text-zinc-900 dark:text-white truncate mt-1">
                        Elden Ring
                      </div>
                      <div className="text-[13px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                        74 giờ chơi • Tiến độ 85%
                      </div>
                    </div>
                  </div>

                  {/* Prestige Avatar Frames Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                        Lộ trình mở khóa khung avatar
                      </span>
                      <span className="text-[13px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        +150 Xu/ngày
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2.5">
                      {SHOWCASE_FRAMES.map((frame) => (
                        <div
                          key={frame.id}
                          className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 flex flex-col items-center text-center gap-1.5"
                        >
                          <AvatarWithFrame
                            frameId={frame.id}
                            previewLevel={frame.milestoneLevel}
                            size="sm"
                            showLevelBadge
                          />
                          <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 truncate w-full">
                            Lv.{frame.milestoneLevel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Previews Section: Real Product UI Mockups */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
              Trải nghiệm thực tế mọi tính năng cốt lõi
            </h2>
            <p className="mt-2 text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Từ kho quản lý tiến độ, trợ lý AI đề xuất game đến hệ thống điểm
              danh nhận khung và mở rương gacha.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1: Library & Playlog Tracker */}
            <div className="rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-transform duration-200">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  Kho game chuẩn hóa & Nhật ký chơi chi tiết
                </h3>
                <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Phân loại Đang chơi, Chờ chơi và Hoàn thành. Cập nhật nhanh số
                  giờ và ghi chú cảm nhận từng màn đấu.
                </p>
              </div>

              {/* UI Mockup Fragment 1 */}
              <div
                data-ui="library-mockup"
                className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-5 space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-18 h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
                    <img
                      src={cyberpunkPoster}
                      alt="Cyberpunk 2077"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                        Cyberpunk 2077
                      </h4>
                      <div className="flex items-center gap-1 text-[13px] font-bold text-amber-500 shrink-0">
                        <StarIcon />
                        <span>4.8</span>
                      </div>
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[13px] font-bold bg-sky-700 text-white">
                      Đang chơi
                    </span>

                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          Thời gian chơi
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          58 giờ
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[75%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-3.5 bg-white dark:bg-zinc-900 text-[13px]">
                  <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Nhật ký gần nhất
                    </span>
                    <span>Hôm qua</span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    Hoàn thành cốt truyện Phantom Liberty. Đoạn kết sâu sắc và
                    nhạc nền đỉnh cao.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[13px]">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    +1h chơi nhanh
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    RAWG Sync • Đã đồng bộ
                  </span>
                </div>
              </div>
            </div>

            {/* Feature 2: AI Advisor Companion */}
            <div className="rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-transform duration-200">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  Trợ lý AI thấu hiểu gu chơi game
                </h3>
                <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Phân tích lịch sử thư viện để gợi ý tựa game tiếp theo. Kèm
                  thẻ tương tác giúp thêm ngay vào danh sách.
                </p>
              </div>

              {/* UI Mockup Fragment 2 */}
              <div
                data-ui="advisor-mockup"
                className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-5 space-y-3.5"
              >
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-emerald-700 text-white px-4 py-2.5 text-[13px] leading-relaxed">
                    Gợi ý 1 game phiêu lưu thế giới mở đẹp như The Witcher 3?
                  </div>
                </div>

                {/* AI Advisor Response */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-sm">
                    AI
                  </div>
                  <div className="flex-1 space-y-2.5">
                    <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-zinc-900 p-3.5 text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      Dựa trên 120h bạn chơi Witcher 3, đề xuất số 1 là{" "}
                      <strong className="text-zinc-900 dark:text-white">
                        Elden Ring
                      </strong>
                      . Khám phá tự do tuyệt đối và bầu không khí huyền bí cuốn
                      hút.
                    </div>

                    {/* Interactive Recommendation Game Pill */}
                    <div className="rounded-xl bg-white dark:bg-zinc-900 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                          <img
                            src={eldenRingPoster}
                            alt="Elden Ring"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                            Elden Ring
                          </div>
                          <div className="text-[13px] text-zinc-500 dark:text-zinc-400">
                            Thế giới mở • RPG
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-[13px] shrink-0 cursor-default">
                        + Backlog
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Daily Streak & Avatar Frames */}
            <div className="rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-transform duration-200">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  Điểm danh thăng hạng, mở khóa 10 khung avatar
                </h3>
                <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Tích lũy kinh nghiệm mỗi ngày để vươn tới Cấp 100. Mỗi mốc mở
                  khóa một khung avatar danh giá.
                </p>
              </div>

              {/* UI Mockup Fragment 3 */}
              <div
                data-ui="ranks-mockup"
                className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-5 space-y-4"
              >
                <div
                  className="flex items-center justify-between pb-3" /* taste-skill-ignore: ranks mockup divider */
                >
                  <div className="flex items-center gap-3">
                    <AvatarWithFrame
                      frameId="frame_lv40"
                      previewLevel={40}
                      size="md"
                      showLevelBadge
                    />
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">
                        Valkyrie_Blade
                      </div>
                      <div className="text-[13px] text-amber-600 dark:text-amber-400 font-semibold">
                        Cấp 40 • Khung Chiến Tướng
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[13px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    +150 Xu/ngày
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Tiến trình lên Cấp 41
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      920 / 1,000 EXP
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[92%]" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900">
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">
                      Cấp 10
                    </div>
                    <div className="text-[13px] text-zinc-500 dark:text-zinc-400">
                      Tân Binh
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 font-bold">
                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      Cấp 40
                    </div>
                    <div className="text-[13px] text-amber-500/90">
                      Chiến Tướng
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900">
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">
                      Cấp 70
                    </div>
                    <div className="text-[13px] text-zinc-500 dark:text-zinc-400">
                      Tinh Anh
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 opacity-60">
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">
                      Cấp 100
                    </div>
                    <div className="text-[13px] text-zinc-500 dark:text-zinc-400">
                      Huyền Thoại
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Visual Stats & Mystery Chests */}
            <div className="rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-transform duration-200">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  Báo cáo thống kê & Rương báu vật phẩm
                </h3>
                <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Theo dõi biểu đồ thời gian chơi và dùng PixelCoins kiếm được
                  từ điểm danh để thử vận may mở rương hiếm.
                </p>
              </div>

              {/* UI Mockup Fragment 4 */}
              <div
                data-ui="stats-mockup"
                className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-5 space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-sm font-semibold mb-2.5">
                    <span className="text-zinc-800 dark:text-zinc-200">
                      Phân bổ thể loại yêu thích
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Tổng 342 giờ
                    </span>
                  </div>
                  <div className="space-y-2.5 text-[13px]">
                    <div>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400 mb-1">
                        <span>Nhập vai (RPG)</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          48% (164h)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[48%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400 mb-1">
                        <span>Hành động (Action)</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          32% (110h)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full w-[32%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gacha Drop Pill */}
                <div className="rounded-xl p-3.5 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-sm">
                      <StarIcon />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">
                        Rương Thần Thoại
                      </div>
                      <div className="text-[13px] text-amber-600 dark:text-amber-400">
                        Đã mở: Kiếm Ánh Sáng (+300 Xu)
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[13px] shrink-0">
                    Hiếm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="py-10 px-6 bg-zinc-100/60 dark:bg-zinc-900/40 text-center text-sm text-zinc-600 dark:text-zinc-400">
        PixelLog GL © 2026. Nền tảng quản lý thư viện game và trợ lý AI thông
        minh.
      </footer>
    </div>
  );
}
