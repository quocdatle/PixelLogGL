import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

// Bảng màu phân biệt rõ trên cả nền sáng và nền tối.
const GENRE_COLORS = [
  '#10b981', // emerald (màu nhấn của dự án)
  '#f59e0b', // amber
  '#6366f1', // indigo
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#8b5cf6', // violet
  '#a1a1aa', // zinc (dành cho "Khác")
];

function GenreTooltip({ active, payload, valueKey, unit }) {
  if (!active || !payload?.length) return null;
  const { genre, ...rest } = payload[0].payload;
  return (
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-md dark:border-zinc-700 dark:bg-zinc-800">
      <p className="font-medium text-zinc-900 dark:text-zinc-100">{genre}</p>
      <p className="text-zinc-600 dark:text-zinc-300">
        {rest[valueKey]} {unit}
      </p>
    </div>
  );
}

/**
 * @param {{ data: Array<{genre: string, games: number, hours: number}>, metric?: 'games'|'hours' }} props
 */
export default function GenreChart({ data, metric = 'games' }) {
  const valueKey = metric === 'hours' ? 'hours' : 'games';
  const unit = metric === 'hours' ? 'giờ' : 'game';
  const total = data.reduce((sum, item) => sum + item[valueKey], 0);

  if (!data.length || total === 0) {
    return (
      <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Chưa có dữ liệu thể loại cho tiêu chí này.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="h-52 w-52 shrink-0" role="img" aria-label="Biểu đồ phân bổ thể loại game">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey="genre"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((item, index) => (
                <Cell key={item.genre} fill={GENRE_COLORS[index % GENRE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<GenreTooltip valueKey={valueKey} unit={unit} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2">
        {data.map((item, index) => {
          const percent = Math.round((item[valueKey] / total) * 100);
          return (
            <li key={item.genre} className="flex items-center gap-3 text-sm">
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: GENRE_COLORS[index % GENRE_COLORS.length] }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-200">{item.genre}</span>
              <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                {item[valueKey]} {unit}
              </span>
              <span className="w-10 text-right tabular-nums font-medium text-zinc-900 dark:text-zinc-100">
                {percent}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}