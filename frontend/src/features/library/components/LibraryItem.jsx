import StatusBadge from "./StatusBadge";

export default function LibraryItem({
  game,
  onEdit,
  onQuickAddPlaytime,
  onStatusChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-white dark:bg-zinc-900 rounded-xl hover:bg-zinc-100/60 dark:hover:bg-zinc-850 transition-colors duration-150 gap-3">
      {/* Left: Thumbnail & Titles */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-14 h-14 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
          {game.coverUrl ? (
            <img
              src={game.coverUrl}
              alt={game.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-zinc-400">
              {game.title?.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
            {game.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{game.genre || "Action"}</span>
            <span>•</span>
            <span>{game.developer || "Studio"}</span>
          </div>
        </div>
      </div>

      {/* Middle & Right: Status, Rating, Hours and Controls */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 shrink-0 pt-2 sm:pt-0">
        {/* Status Badge */}
        <StatusBadge status={game.status} />

        {/* Rating */}
        <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold w-12 text-right">
          <svg
            className="w-3.5 h-3.5 fill-current"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="tabular-nums">{game.rating || "-"}</span>
        </div>

        {/* Playtime */}
        <div className="text-xs text-zinc-600 dark:text-zinc-300 font-medium w-16 text-right tabular-nums">
          <span className="font-bold text-zinc-900 dark:text-white">
            {game.playtimeHours || 0}
          </span>
          h
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onQuickAddPlaytime(game.id)}
            title="Thêm nhanh 1 giờ chơi"
            className="px-2 py-1 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors duration-150"
          >
            +1h
          </button>

          <select
            value={game.status}
            onChange={(e) => onStatusChange(game.id, e.target.value)}
            className="text-xs py-1 px-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-none cursor-pointer focus:outline-none"
          >
            <option value="playing">Đang chơi</option>
            <option value="backlog">Chờ chơi</option>
            <option value="completed">Hoàn thành</option>
            <option value="dropped">Tạm dừng</option>
            <option value="wishlist">Muốn chơi</option>
          </select>

          <button
            type="button"
            onClick={() => onEdit(game)}
            title="Chỉnh sửa chi tiết"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer transition-colors duration-150"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
