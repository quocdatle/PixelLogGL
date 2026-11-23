import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const STATUS_COLORS = {
  playing: '#0ea5e9',
  completed: '#10b981',
  dropped: '#a1a1aa',
};

const DAILY_COLOR = '#10b981';
const PLATFORM_COLOR = '#10b981';
const RATING_COLOR = '#f59e0b';
const UNRATED_COLOR = '#94a3b8';

function BreakdownTooltip({ active, payload, groupBy }) {
  if (!active || !payload?.length) return null;
  const { label, hours, games, minutes } = payload[0].payload;
  const mins = minutes ?? Math.round((hours || 0) * 60);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-md dark:border-zinc-700 dark:bg-zinc-800">
      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{label}</p>
      {groupBy === 'daily' ? (
        <div className="text-zinc-600 dark:text-zinc-300 tabular-nums text-xs mt-0.5 space-y-0.5">
          <p>
            Giờ chơi: <span className="font-bold text-emerald-600 dark:text-emerald-400">{hours} giờ</span> ({mins} phút)
          </p>
          <p>Số tựa game chơi: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{games || 0}</span></p>
        </div>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-300 tabular-nums">
          {hours} giờ • {games} game
        </p>
      )}
    </div>
  );
}

function getBarColor(groupBy, item) {
  if (groupBy === 'daily') {
    return DAILY_COLOR;
  }
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

  if (groupBy === 'daily') {
    if (!hasAnyHours) {
      return (
        <div className="py-12 px-4 text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Chưa có phiên chơi nào trong 7 ngày gần nhất
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
            Bấm nút &quot;Tính giờ&quot; ở trang Thư viện khi chơi game để hệ thống tự động ghi lại giờ chơi theo từng ngày.
          </p>
        </div>
      );
    }
  } else if (!hasAnyGames) {
    return (
      <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {groupBy === 'status'
          ? 'Chưa có game nào ở trạng thái Đang chơi, Đã xong hoặc Bỏ dở.'
          : 'Chưa có dữ liệu trong thư viện để thống kê.'}
      </p>
    );
  }

  const useHoursMetric = (groupBy === 'status' && hasAnyHours) || groupBy === 'daily';
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
            allowDecimals={true}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            unit={yUnit}
          />
          <Tooltip
            cursor={{ fill: 'currentColor', fillOpacity: 0.1 }}
            content={<BreakdownTooltip groupBy={groupBy} />}
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
