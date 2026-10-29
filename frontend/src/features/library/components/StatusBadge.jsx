const STATUS_STYLES = {
  backlog: {
    label: 'Chưa chơi',
    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  playing: {
    label: 'Đang chơi',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30',
  },
  completed: {
    label: 'Đã hoàn thành',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  dropped: {
    label: 'Bỏ dở',
    className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  },
};

// Nhãn màu hiển thị trạng thái game trong thư viện
export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.backlog;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold ${style.className}`}>
      {style.label}
    </span>
  );
}
