import { useEffect, useState } from 'react';
import AppNavbar from '../../../components/layout/AppNavbar';
import GenreChart from '../components/GenreChart';
import LibraryBreakdownChart from '../components/LibraryBreakdownChart';
import { getDistributionStats, getGenreStats, getOverview, getTopGames } from '../analyticsService';

const STATUS_META = [
  { key: 'playing', label: 'Đang chơi', color: 'bg-sky-500' },
  { key: 'completed', label: 'Đã xong', color: 'bg-emerald-500' },
  { key: 'backlog', label: 'Chờ chơi', color: 'bg-amber-500' },
  { key: 'wishlist', label: 'Muốn chơi', color: 'bg-teal-500' },
  { key: 'dropped', label: 'Bỏ dở', color: 'bg-zinc-400' },
];

const DEFAULT_ERROR = 'Không tải được dữ liệu. Kiểm tra kết nối rồi thử lại.';
const NOT_LOADED = Symbol('not-loaded');
const TOP_GAMES_LIMIT = 5;

function useApiData(fetcher, arg) {
  const [state, setState] = useState({ data: null, error: null, loadedArg: NOT_LOADED });

  useEffect(() => {
    let cancelled = false;

    fetcher(arg)
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loadedArg: arg });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ data: null, error: err?.response?.data?.message || DEFAULT_ERROR, loadedArg: arg });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, arg]);

  const loading = state.loadedArg !== arg;
  return { data: state.data, error: loading ? null : state.error, loading };
}

function StarIcon({ className = 'w-4 h-4 text-amber-400 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function TrophyIcon({ className = 'w-5 h-5 text-amber-500 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 4h-2V3a1 1 0 00-1-1H8a1 1 0 00-1 1v1H5a2 2 0 00-2 2v2a5 5 0 004 4.9V14a3 3 0 002.8 3H11v3H8a1 1 0 000 2h8a1 1 0 000-2h-3v-3h1.2A3 3 0 0017 14v-1.1A5 5 0 0021 8V6a2 2 0 00-2-2zM5 8V6h2v4.7A3 3 0 015 8zm14 0a3 3 0 01-2 2.7V6h2v2z" />
    </svg>
  );
}

function TargetIcon({ className = 'w-5 h-5 text-emerald-500 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-2a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CompassIcon({ className = 'w-5 h-5 text-sky-500 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}

function Toggle({ options, value, onChange, label }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-xl bg-zinc-100 p-1 text-sm dark:bg-zinc-800"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-3 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer text-xs font-semibold ${
            value === option.value
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <section className="rounded-2xl bg-white p-6 dark:bg-zinc-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function PanelState({ loading, error, height = 'h-48', children }) {
  if (error) {
    return (
      <p role="alert" className="py-8 text-center text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  }
  if (loading) {
    return (
      <div
        className={`${height} w-full rounded-xl bg-zinc-100 dark:bg-zinc-800`}
        aria-busy="true"
        aria-label="Đang tải dữ liệu"
      />
    );
  }
  return children;
}

// 4 Honors / Highlights Cards
function HonorHighlights({ overview, topGames, genres }) {
  const { totalGames, totalHours, avgRating, byStatus } = overview;
  const completed = byStatus?.completed || 0;
  const completionRate = totalGames > 0 ? Math.round((completed / totalGames) * 100) : 0;

  const topGame = topGames?.[0];
  const topGenre = genres?.[0];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Time Champion */}
      <div className="p-5 rounded-2xl bg-zinc-900 text-white flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-zinc-400">
            <span>Kỷ lục giờ chơi</span>
            <TrophyIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-black text-amber-400 truncate">
            {topGame ? topGame.name : 'Chưa ghi nhận'}
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-400">
          {topGame ? `${topGame.hours} giờ chinh phục` : 'Ghi phiên chơi đầu tiên'}
        </div>
      </div>

      {/* 2. Completion Mastery */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>Tỷ lệ phá đảo</span>
            <TargetIcon className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-3xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
            {completionRate}%
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {completed} / {totalGames} tựa game hoàn thành
        </div>
      </div>

      {/* 3. Signature Genre */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>Gu game chủ đạo</span>
            <CompassIcon className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 text-xl font-black text-zinc-900 dark:text-white truncate">
            {topGenre ? topGenre.genre : 'Đa dạng'}
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {topGenre ? `${topGenre.games} tựa game trong kho` : 'Thêm game để nhận diện'}
        </div>
      </div>

      {/* 4. Critic Taste */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>Đánh giá trung bình</span>
            <StarIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-black tabular-nums text-zinc-900 dark:text-white">
            {avgRating !== null ? `${avgRating}` : '–'} <span className="text-base font-normal text-zinc-400">/ 5.0</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {totalHours} giờ chơi tích lũy
        </div>
      </div>
    </section>
  );
}

// Hall of Fame Showcase for Top Games
function TopGamesShowcase({ games }) {
  if (!games || !games.length) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Chưa có game nào được ghi nhận giờ chơi.
      </p>
    );
  }

  const maxHours = Math.max(...games.map((g) => g.hours)) || 1;

  const RANK_BADGES = [
    { label: 'Hạng 1', bg: 'bg-amber-400 text-zinc-950 font-bold' },
    { label: 'Hạng 2', bg: 'bg-zinc-300 text-zinc-900 font-bold' },
    { label: 'Hạng 3', bg: 'bg-amber-700 text-white font-bold' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {games.map((game, index) => {
        const badge = RANK_BADGES[index] || {
          label: `Hạng ${index + 1}`,
          bg: 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold',
        };
        const percent = Math.round((game.hours / maxHours) * 100);

        return (
          <div
            key={game.userGameId}
            className={`rounded-2xl p-4 flex flex-col justify-between transition-colors ${
              index === 0
                ? 'bg-zinc-900 text-white sm:col-span-2 lg:col-span-1'
                : 'bg-zinc-50 dark:bg-zinc-800/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs ${badge.bg}`}>
                  {badge.label}
                </span>

                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  game.status === 'completed'
                    ? 'bg-emerald-950 text-emerald-300'
                    : 'bg-sky-950 text-sky-300'
                }`}>
                  {game.status === 'completed' ? 'Đã xong' : 'Đang chơi'}
                </span>
              </div>

              {/* Game Cover Art if available */}
              {game.backgroundImage && (
                <div className="w-full h-28 rounded-xl overflow-hidden mb-3 bg-zinc-800">
                  <img
                    src={game.backgroundImage}
                    alt={game.name}
                    className="w-full h-full object-cover filter contrast-105"
                    loading="lazy"
                  />
                </div>
              )}

              <h3 className="text-base font-extrabold truncate text-zinc-900 dark:text-white">
                {game.name}
              </h3>

              <div className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Thời gian đã cày:</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {game.hours} giờ
                </span>
              </div>
            </div>

            {/* Relative Progress Bar */}
            <div className="mt-4 pt-3 space-y-1">
              <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="text-[11px] text-right text-zinc-500 dark:text-zinc-400">
                {percent}% so với kỷ lục
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Gamer Persona Assessment
function GamerPersonaSummary({ overview, genres }) {
  const { totalGames, totalHours, byStatus } = overview;
  const completed = byStatus?.completed || 0;
  const completionRate = totalGames > 0 ? Math.round((completed / totalGames) * 100) : 0;
  const topGenre = genres?.[0]?.genre || 'Đa dạng';

  let title = 'Nhà thám hiểm thế giới ảo';
  let description =
    'Bạn thích tự do khám phá nhiều vũ trụ khác nhau, cân bằng giữa các thể loại và không ngừng mở rộng kho game.';

  if (completionRate >= 50) {
    title = 'Người chinh phục cốt truyện kiên định';
    description =
      'Bạn luôn ưu tiên hoàn thành trọn vẹn kết thúc của mỗi trò chơi đã bắt đầu. Một game thủ có chiều sâu và sự kiên trì đáng nể.';
  } else if (totalHours >= 60) {
    title = 'Chiến binh cày cuốc chuyên tâm';
    description =
      'Bạn dành nhiều tâm huyết và thời gian vào những tựa game tâm đắc, làm chủ mọi cơ chế chiến đấu và bản đồ.';
  } else if (totalGames >= 10) {
    title = 'Nhà sưu tầm thư viện đam mê';
    description =
      'Thư viện của bạn là một kho báu đích thực với vô số tựa game chờ đón những chuyến phiêu lưu tiếp theo.';
  }

  return (
    <section className="rounded-2xl bg-zinc-900 text-white p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-emerald-400">
            Nhận định phong cách game thủ
          </div>
          <h3 className="text-xl font-black text-white">
            {title}
          </h3>
          <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed pt-1">
            {description} Thể loại ghi dấu ấn đậm nét nhất trong hồ sơ của bạn là <strong className="text-amber-400">{topGenre}</strong>.
          </p>
        </div>

        <div className="shrink-0 p-3 rounded-xl bg-zinc-800 text-center">
          <div className="text-xs text-zinc-400">Tổng thời lượng</div>
          <div className="text-2xl font-black text-amber-400 tabular-nums">
            {totalHours}h
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AnalyticsPage() {
  const [groupBy, setGroupBy] = useState('status');
  const [genreMetric, setGenreMetric] = useState('games');

  const overview = useApiData(getOverview);
  const topGames = useApiData(getTopGames, TOP_GAMES_LIMIT);
  const genres = useApiData(getGenreStats, genreMetric);
  const distribution = useApiData(getDistributionStats, groupBy);

  const isEmptyLibrary = overview.data && overview.data.totalGames === 0;

  return (
    <div className="min-h-[100dvh] w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-150">
      <div>
        <AppNavbar />

        <main className="mx-auto w-full max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8 py-8">
          <header>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Niên giám và đại sảnh danh vọng
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Tổng kết thành tích và dấu ấn game thủ
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Khám phá thói quen chinh phục thế giới ảo, những cột mốc kỷ lục và tựa game tâm đắc nhất của bạn.
            </p>
          </header>

          {overview.error && (
            <p role="alert" className="rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200">
              {overview.error}
            </p>
          )}

          {overview.loading && !overview.data && (
            <div className="h-44 rounded-2xl bg-zinc-200 dark:bg-zinc-900" />
          )}

          {isEmptyLibrary && (
            <div className="rounded-2xl bg-white dark:bg-zinc-900 p-8 sm:p-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
                <CompassIcon className="w-6 h-6 text-zinc-500" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Thư viện của bạn chưa có game nào</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                Thêm game vào thư viện và ghi nhận giờ chơi để hệ thống tự động thiết lập bản tổng kết thành tích tại đây.
              </p>
            </div>
          )}

          {overview.data && !isEmptyLibrary && (
            <>
              {/* 1. 4 Honor Highlights Cards */}
              <HonorHighlights
                overview={overview.data}
                topGames={topGames.data}
                genres={genres.data}
              />

              {/* 2. Gamer Persona Dossier */}
              <GamerPersonaSummary
                overview={overview.data}
                genres={genres.data}
              />

              {/* 3. Top Games Hall of Fame */}
              <section className="rounded-2xl bg-white dark:bg-zinc-900 p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                      Đại sảnh danh vọng (Top game cày nhiều nhất)
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Những tựa game chiếm trọn thời gian và đam mê của bạn.
                    </p>
                  </div>
                </div>

                <PanelState loading={topGames.loading && !topGames.data} error={topGames.error}>
                  {topGames.data && <TopGamesShowcase games={topGames.data} />}
                </PanelState>
              </section>

              {/* 4. Deep-dive Analytics Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Genre Breakdown */}
                <Panel
                  title="Phân bổ thể loại yêu thích"
                  action={
                    <Toggle
                      label="Tiêu chí thể loại"
                      value={genreMetric}
                      onChange={setGenreMetric}
                      options={[
                        { value: 'games', label: 'Số game' },
                        { value: 'hours', label: 'Giờ chơi' },
                      ]}
                    />
                  }
                >
                  <PanelState loading={genres.loading && !genres.data} error={genres.error}>
                    {genres.data && <GenreChart data={genres.data} metric={genreMetric} />}
                  </PanelState>
                </Panel>

                {/* Library Status & Platform Distribution */}
                <Panel
                  title="Phân bổ thư viện chi tiết"
                  action={
                    <Toggle
                      label="Nhóm thống kê"
                      value={groupBy}
                      onChange={setGroupBy}
                      options={[
                        { value: 'status', label: 'Trạng thái' },
                        { value: 'platform', label: 'Nền tảng' },
                        { value: 'rating', label: 'Đánh giá' },
                      ]}
                    />
                  }
                >
                  <PanelState loading={distribution.loading && !distribution.data} error={distribution.error} height="h-72">
                    {distribution.data && (
                      <LibraryBreakdownChart data={distribution.data.items} groupBy={groupBy} />
                    )}
                  </PanelState>
                </Panel>
              </div>

              {/* 5. Library Status Horizontal Bar Breakdown */}
              <section className="rounded-2xl bg-white dark:bg-zinc-900 p-6">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">
                  Tỷ lệ phân bổ trạng thái thư viện ({overview.data.totalGames} game)
                </h3>
                <div
                  className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                  role="img"
                  aria-label="Tỷ lệ game theo trạng thái"
                >
                  {STATUS_META.map(({ key, color }) =>
                    overview.data.byStatus[key] > 0 ? (
                      <div
                        key={key}
                        className={color}
                        style={{ width: `${(overview.data.byStatus[key] / overview.data.totalGames) * 100}%` }}
                      />
                    ) : null
                  )}
                </div>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                  {STATUS_META.map(({ key, label, color }) => (
                    <li key={key} className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${color}`} aria-hidden="true" />
                      <span>{label}</span>
                      <span className="tabular-nums font-bold text-zinc-900 dark:text-zinc-100">
                        {overview.data.byStatus[key]}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        PixelLog GL © 2026. Nền tảng quản lý game và trợ lý AI thông minh.
      </footer>
    </div>
  );
}
