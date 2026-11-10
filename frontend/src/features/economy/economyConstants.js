// Cấu hình hiển thị theo độ hiếm
export const RARITY_THEME = {
  common: {
    label: 'Phổ biến',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700',
    bg: 'bg-zinc-50 dark:bg-zinc-900/70',
    badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    glow: '',
    cardHighlight: 'from-zinc-500/10 to-transparent',
  },
  uncommon: {
    label: 'Đặc biệt',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-800/70 hover:border-emerald-500',
    bg: 'bg-emerald-50/40 dark:bg-emerald-950/30',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    glow: 'shadow-emerald-500/10',
    cardHighlight: 'from-emerald-500/15 to-transparent',
  },
  rare: {
    label: 'Hiếm',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-300 dark:border-sky-800/80 hover:border-sky-500',
    bg: 'bg-sky-50/40 dark:bg-sky-950/30',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    glow: 'shadow-sky-500/15',
    cardHighlight: 'from-sky-500/20 to-transparent',
  },
  epic: {
    label: 'Sử thi',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-300 dark:border-purple-800/80 hover:border-purple-500 ring-1 ring-purple-500/20',
    bg: 'bg-purple-50/40 dark:bg-purple-950/30',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    glow: 'shadow-lg shadow-purple-500/20',
    cardHighlight: 'from-purple-500/25 to-transparent',
  },
  legendary: {
    label: 'Thần thoại',
    text: 'text-amber-500 dark:text-amber-400',
    border: 'border-amber-400 dark:border-amber-500/80 hover:border-amber-300 ring-2 ring-amber-400/40',
    bg: 'bg-gradient-to-b from-amber-500/10 to-amber-950/30 dark:from-amber-950/40 dark:to-zinc-900',
    badge: 'bg-amber-100 text-amber-900 dark:bg-amber-950/90 dark:text-amber-300 border-amber-400 dark:border-amber-600 font-bold',
    glow: 'shadow-xl shadow-amber-500/25',
    cardHighlight: 'from-amber-400/35 via-amber-500/10 to-transparent',
  },
};

// Loại vật phẩm
export const TYPE_LABELS = {
  weapon: 'Vũ khí',
  badge: 'Huy hiệu',
  avatar_frame: 'Khung Avatar',
  title: 'Danh hiệu',
  collectible: 'Sưu tầm',
};
