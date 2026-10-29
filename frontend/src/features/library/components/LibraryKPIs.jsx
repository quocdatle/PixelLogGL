// Thống kê nhanh 4 chỉ số thư viện theo chuẩn typography tối giản
export default function LibraryKPIs({ games = [] }) {
  const totalGames = games.length;
  const playingCount = games.filter((g) => g.status === "playing").length;
  const completedCount = games.filter((g) => g.status === "completed").length;
  const totalPlaytimeHours = games.reduce(
    (sum, g) => sum + (g.playtimeHours || 0),
    0
  );

  const completionRate =
    totalGames > 0 ? Math.round((completedCount / totalGames) * 100) : 0;

  const kpis = [
    {
      label: "Tổng tựa game",
      value: totalGames,
      sublabel: "Trong kho cá nhân",
    },
    {
      label: "Đang chơi",
      value: playingCount,
      sublabel: "Tiến độ kích hoạt",
      indicator: "bg-emerald-500",
    },
    {
      label: "Đã hoàn thành",
      value: completedCount,
      sublabel: `${completionRate}% tỷ lệ phá đảo`,
      indicator: "bg-sky-500",
    },
    {
      label: "Thời gian tích lũy",
      value: `${totalPlaytimeHours}h`,
      sublabel: "Tổng thời gian trải nghiệm",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="p-4 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800"
        >
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1">
            {kpi.indicator && (
              <span className={`w-2 h-2 rounded-full ${kpi.indicator}`} />
            )}
            <span>{kpi.label}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums mb-0.5">
            {kpi.value}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {kpi.sublabel}
          </div>
        </div>
      ))}
    </div>
  );
}
