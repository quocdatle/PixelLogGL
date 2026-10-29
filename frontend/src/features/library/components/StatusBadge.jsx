// Component hiển thị trạng thái của game trong thư viện
export const STATUS_CONFIG = {
  playing: {
    label: "Đang chơi",
    dotClass: "bg-emerald-500",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/60",
    textClass: "text-emerald-700 dark:text-emerald-400",
  },
  backlog: {
    label: "Chờ chơi",
    dotClass: "bg-amber-500",
    bgClass: "bg-amber-50 dark:bg-amber-950/60",
    textClass: "text-amber-700 dark:text-amber-400",
  },
  completed: {
    label: "Hoàn thành",
    dotClass: "bg-sky-500",
    bgClass: "bg-sky-50 dark:bg-sky-950/60",
    textClass: "text-sky-700 dark:text-sky-400",
  },
  dropped: {
    label: "Tạm dừng",
    dotClass: "bg-zinc-400",
    bgClass: "bg-zinc-100 dark:bg-zinc-800",
    textClass: "text-zinc-600 dark:text-zinc-400",
  },
  wishlist: {
    label: "Muốn chơi",
    dotClass: "bg-rose-400",
    bgClass: "bg-rose-50 dark:bg-rose-950/60",
    textClass: "text-rose-700 dark:text-rose-400",
  },
};

export default function StatusBadge({ status = "backlog", className = "" }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.backlog;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
