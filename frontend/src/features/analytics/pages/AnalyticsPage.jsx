import { useEffect, useState } from 'react';
import ThemeToggle from '../../../components/common/ThemeToggle';
import GenreChart from '../components/GenreChart';
import PlaytimeChart from '../components/PlaytimeChart';
import { getGenreStats, getOverview, getPlaytimeStats, getTopGames } from '../analyticsService';

const STATUS_META = [
  { key: 'playing', label: 'Đang chơi', color: 'bg-sky-500' },
  { key: 'completed', label: 'Đã xong', color: 'bg-emerald-500' },
  { key: 'backlog', label: 'Chờ chơi', color: 'bg-amber-500' },
  { key: 'wishlist', label: 'Muốn chơi', color: 'bg-violet-500' },
  { key: 'dropped', label: 'Bỏ dở', color: 'bg-zinc-400' },
];

const DEFAULT_ERROR = 'Không tải được dữ liệu. Kiểm tra kết nối rồi thử lại.';

const NOT_LOADED = Symbol('not-loaded');
const TOP_GAMES_LIMIT = 5;

// Hook nhỏ: gọi fetcher(arg) mỗi khi arg đổi.
// - fetcher phải là hàm cố định (khai báo ngoài component) để effect không chạy lặp.
// - setState chỉ được gọi trong callback bất đồng bộ, không gọi đồng bộ trong effect.
// - Khi arg đổi, dữ liệu cũ vẫn hiển thị trong lúc tải lại; request cũ bị bỏ qua nếu đã bị thay thế.
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

function Toggle({ options, value, onChange, label }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-lg border border-zinc-200 p-0.5 text-sm dark:border-zinc-700"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            value === option.value
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white'
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
    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
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
        className={`${height} w-full rounded-lg bg-zinc-100 motion-safe:animate-pulse dark:bg-zinc-800`}
        aria-busy="true"
        aria-label="Đang tải"
      />
    );
  }
  return children;
}

function OverviewStrip({ overview }) {
  const { totalGames, totalHours, avgRating, byStatus } = overview;

  const figures = [
    { label: 'Game trong thư viện', value: totalGames },
    { label: 'Tổng giờ chơi', value: totalHours },
    { label: 'Điểm đánh giá trung bình', value: avgRating ?? '–' },
  ];

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:divide-x sm:divide-zinc-200 dark:sm:divide-zinc-700">
        {figures.map((figure, index) => (
          <div key={figure.label} className={index > 0 ? 'sm:pl-6' : ''}>
            <dt className="text-sm text-zinc-500 dark:text-zinc-400">{figure.label}</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {figure.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <div
          className="flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
          role="img"
          aria-label="Tỷ lệ game theo trạng thái"
        >
          {STATUS_META.map(({ key, color }) =>
            byStatus[key] > 0 ? (
              <div key={key} className={color} style={{ width: `${(byStatus[key] / totalGames) * 100}%` }} />
            ) : null
          )}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-600 dark:text-zinc-300">
          {STATUS_META.map(({ key, label, color }) => (
            <li key={key} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-sm ${color}`} aria-hidden="true" />
              {label}
              <span className="tabular-nums font-medium text-zinc-900 dark:text-zinc-100">{byStatus[key]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TopGamesList({ games }) {
  if (!games.length) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Chưa có game nào được ghi nhận giờ chơi.
      </p>
    );
  }
  const maxHours = Math.max(...games.map((game) => game.hours));

  return (
    <ol className="space-y-3">
      {games.map((game, index) => (
        <li key={game.userGameId}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-zinc-800 dark:text-zinc-200">
              <span className="mr-2 tabular-nums text-zinc-400">{index + 1}.</span>
              {game.name}
            </span>
            <span className="shrink-0 tabular-nums font-medium text-zinc-900 dark:text-zinc-100">
              {game.hours} giờ
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${(game.hours / maxHours) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('week');
  const [genreMetric, setGenreMetric] = useState('games');

  const overview = useApiData(getOverview);
  const topGames = useApiData(getTopGames, TOP_GAMES_LIMIT);
  const genres = useApiData(getGenreStats, genreMetric);
  const playtime = useApiData(getPlaytimeStats, range);

  const isEmptyLibrary = overview.data && overview.data.totalGames === 0;

  return (
    <div className="min-h-[100dvh] w-full bg-zinc-100 dark:bg-zinc-950">
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Thống kê</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Thói quen chơi game của bạn, tính từ thư viện cá nhân.
        </p>
        </div>
        <ThemeToggle />
      </header>

      {overview.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {overview.error}
        </p>
      )}

      {overview.loading && !overview.data && (
        <div className="h-36 rounded-xl bg-zinc-100 motion-safe:animate-pulse dark:bg-zinc-800" aria-busy="true" />
      )}

      {isEmptyLibrary && (
        <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">Thư viện của bạn chưa có game nào</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Thêm game vào thư viện và ghi lại giờ chơi để xem thống kê tại đây.
          </p>
        </div>
      )}

      {overview.data && !isEmptyLibrary && (
        <>
          <OverviewStrip overview={overview.data} />

          <Panel
            title="Giờ chơi theo thời gian"
            action={
              <Toggle
                label="Khoảng thời gian"
                value={range}
                onChange={setRange}
                options={[
                  { value: 'week', label: 'Theo tuần' },
                  { value: 'month', label: 'Theo tháng' },
                ]}
              />
            }
          >
            <PanelState loading={playtime.loading && !playtime.data} error={playtime.error} height="h-72">
              {playtime.data && <PlaytimeChart data={playtime.data.items} range={range} />}
            </PanelState>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel
              title="Thể loại yêu thích"
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

            <Panel title="Game chơi nhiều nhất">
              <PanelState loading={topGames.loading && !topGames.data} error={topGames.error}>
                {topGames.data && <TopGamesList games={topGames.data} />}
              </PanelState>
            </Panel>
          </div>
        </>
      )}
    </main>
    </div>
  );
}