import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const STATUS_COLORS = {
  playing: '#0ea5e9',
  completed: '#10b981',
  backlog: '#f59e0b',
  wishlist: '#8b5cf6',
  dropped: '#a1a1aa',
};

const PLATFORM_COLOR = '#10b981';
const RATING_COLOR = '#f59e0b';
const UNRATED_COLOR = '#94a3b8';

function BreakdownTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { label, hours, games } = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-md dark:border-zinc-700 dark:bg-zinc-800">
      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{label}</p>
      <p className="text-zinc-600 dark:text-zinc-300 tabular-nums">
        {hours} giờ • {games} game
      </p>
    </div>
  );
}

function getBarColor(groupBy, item) {
  if (groupBy === 'status') {
    return STATUS_COLORS[item.key] || PLATFORM_COLOR;
  }
  if (groupBy === 'rating') {
    return item.key === 'unrated' ? UNRATED_COLOR : RATING_COLOR;
  }
  return PLATFORM_COLOR;
}

export default function LibraryBreakdownChart({ data = [], groupBy = 'status' }) {
  const hasAnyGames = data.some((item) => item.games > 0);
  const hasAnyHours = data.some((item) => item.hours > 0);

  if (!hasAnyGames) {
    return (
      <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Chưa có dữ liệu trong thư viện để thống kê.
      </p>
    );
  }

  const useHoursMetric = groupBy === 'status' && hasAnyHours;
  const dataKey = useHoursMetric ? 'hours' : 'games';
  const yUnit = useHoursMetric ? 'h' : '';

  return (
    <div
      className="h-72 w-full text-zinc-500 dark:text-zinc-400"
      role="img"
      aria-label="Biểu đồ phân bổ thư viện game"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.2} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'currentColor', fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            unit={yUnit}
          />
          <Tooltip
            cursor={{ fill: 'currentColor', fillOpacity: 0.1 }}
            content={<BreakdownTooltip />}
          />
          <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} maxBarSize={52} isAnimationActive={false}>
            {data.map((item) => (
              <Cell key={item.key} fill={getBarColor(groupBy, item)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
