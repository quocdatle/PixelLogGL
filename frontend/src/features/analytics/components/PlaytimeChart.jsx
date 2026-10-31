import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const PAST_COLOR = '#10b981';
const CURRENT_COLOR = '#f59e0b';

function PlaytimeTooltip({ active, payload, range }) {
  if (!active || !payload?.length) return null;
  const { label, hours } = payload[0].payload;
  const prefix = range === 'month' ? 'Tháng' : 'Tuần từ';
  return (
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-md dark:border-zinc-700 dark:bg-zinc-800">
      <p className="text-zinc-600 dark:text-zinc-300">
        {prefix} {label}
      </p>
      <p className="font-medium text-zinc-900 dark:text-zinc-100">{hours} giờ</p>
    </div>
  );
}

/**
 * @param {{ data: Array<{label: string, hours: number}>, range?: 'week'|'month' }} props
 * Cột cuối cùng là kỳ hiện tại và được tô màu khác để dễ so sánh với các kỳ trước.
 */
export default function PlaytimeChart({ data, range = 'week' }) {
  const hasData = data.some((item) => item.hours > 0);

  if (!hasData) {
    return (
      <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Chưa có phiên chơi nào trong khoảng thời gian này.
      </p>
    );
  }

  return (
    // text-* đặt ở wrapper, các thành phần của biểu đồ lấy màu qua currentColor để theo theme sáng/tối.
    <div
      className="h-72 w-full text-zinc-500 dark:text-zinc-400"
      role="img"
      aria-label="Biểu đồ giờ chơi theo thời gian"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
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
            unit="h"
          />
          <Tooltip
            cursor={{ fill: 'currentColor', fillOpacity: 0.1 }}
            content={<PlaytimeTooltip range={range} />}
          />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive={false}>
            {data.map((item, index) => (
              <Cell key={item.periodStart} fill={index === data.length - 1 ? CURRENT_COLOR : PAST_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}