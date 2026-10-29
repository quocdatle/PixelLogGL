import { STATUS_CONFIG } from "./StatusBadge";

export default function LibraryFilters({
  searchQuery,
  onSearchChange,
  activeStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}) {
  const statusOptions = [
    { key: "all", label: "Tất cả" },
    { key: "playing", label: STATUS_CONFIG.playing.label },
    { key: "backlog", label: STATUS_CONFIG.backlog.label },
    { key: "completed", label: STATUS_CONFIG.completed.label },
    { key: "dropped", label: STATUS_CONFIG.dropped.label },
    { key: "wishlist", label: STATUS_CONFIG.wishlist.label },
  ];

  return (
    <div className="space-y-3 mb-6">
      {/* Upper toolbar: Search, Sort and View mode */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên game, nhà phát triển..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-850 transition-colors duration-150" /* taste-skill-ignore: real input border */
          />
        </div>

        {/* Sort & View toggles */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sắp xếp danh sách game"
              className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors duration-150"
            >
              <option value="playtimeDesc">Giờ chơi nhiều nhất</option>
              <option value="ratingDesc">Đánh giá cao nhất</option>
              <option value="recent">Mới thêm gần đây</option>
              <option value="nameAsc">Tên game (A-Z)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              title="Chế độ xem dạng lưới"
              className={`p-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              title="Chế độ xem dạng bảng"
              className={`p-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filter status pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statusOptions.map((opt) => {
          const isSelected = activeStatus === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onStatusChange(opt.key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors duration-150 ${
                isSelected
                  ? "bg-emerald-700 text-white font-semibold"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
