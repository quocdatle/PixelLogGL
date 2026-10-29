import StatusBadge from "./StatusBadge";

export default function GameCard({
  game,
  onEdit,
  onQuickAddPlaytime,
  onStatusChange,
}) {
  return (
    <div className="group rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex flex-col justify-between overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-150">
      {/* Cover Image */}
      <div className="relative aspect-video w-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        {game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-lg">
            {game.title?.slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* Top-right Status Badge */}
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={game.status} />
        </div>

        {/* Bottom Platform/Genre Pill */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-900/90 text-zinc-200">
            {game.genre || "Action"}
          </span>
        </div>
      </div>

      {/* Content info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 mb-1 group-hover:text-emerald-500 transition-colors duration-150">
            {game.title}
          </h2>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-3">
            {game.developer || "Studio"} • Ra mắt {game.releaseYear || "2024"}
          </div>
        </div>

        {/* Stats Row: Rating & Playtime */}
        <div className="pt-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-amber-500 font-semibold">
            <svg
              className="w-3.5 h-3.5 fill-current"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="tabular-nums">{game.rating || "Chưa chấm"}</span>
          </div>

          <div className="text-zinc-600 dark:text-zinc-300 font-medium">
            <span className="tabular-nums font-bold text-zinc-900 dark:text-white">
              {game.playtimeHours || 0}
            </span>{" "}
            giờ chơi
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-850/60 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onQuickAddPlaytime(game.id)}
          title="Thêm nhanh 1 giờ chơi"
          className="px-2 py-1 text-xs font-semibold rounded-lg bg-zinc-200/70 hover:bg-zinc-300/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors duration-150"
        >
          +1h chơi
        </button>

        <div className="flex items-center gap-1.5">
          <select
            value={game.status}
            onChange={(e) => onStatusChange(game.id, e.target.value)}
            className="text-[11px] py-1 px-2 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-none cursor-pointer focus:outline-none"
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
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 cursor-pointer transition-colors duration-150"
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
