import { useState } from "react";

export default function QuickEditModal({ game, isOpen, onClose, onSave }) {
  const [playtimeHours, setPlaytimeHours] = useState(
    game?.playtimeHours ?? 0
  );
  const [rating, setRating] = useState(game?.rating ?? 8.5);
  const [status, setStatus] = useState(game?.status ?? "playing");
  const [notes, setNotes] = useState(game?.notes ?? "");

  if (!isOpen || !game) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSave(game.id, {
      playtimeHours: Number(playtimeHours),
      rating: Number(rating),
      status,
      notes,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl" /* taste-skill-ignore: modal dialog overlay */>
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Cập nhật tiến độ
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {game.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Trạng thái */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Trạng thái chơi
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="playing">Đang chơi</option>
              <option value="backlog">Chờ chơi</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="dropped">Tạm dừng</option>
              <option value="wishlist">Muốn chơi</option>
            </select>
          </div>

          {/* Giờ chơi & Đánh giá */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Thời gian (giờ)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={playtimeHours}
                onChange={(e) => setPlaytimeHours(e.target.value)}
                /* taste-skill-ignore: real form field input border */
                className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Điểm đánh giá (1-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                /* taste-skill-ignore: real form field input border */
                className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Ghi chú cá nhân */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Ghi chú cá nhân
            </label>
            <textarea
              rows="3"
              placeholder="Cảm nhận, kế hoạch chơi tiếp..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              /* taste-skill-ignore: real form field input border */
              className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors duration-150"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors duration-150"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
