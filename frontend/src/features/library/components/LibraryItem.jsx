import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { GAME_STATUS_OPTIONS } from '../libraryService';

const RATING_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

const controlClass =
  'rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

// 1 dòng game trong thư viện cá nhân: đổi trạng thái, chấm điểm, ghi giờ chơi, xoá
export default function LibraryItem({ entry, busy, onUpdate, onAddSession, onRemove }) {
  const { game } = entry;
  const [minutes, setMinutes] = useState('');

  function handleSessionSubmit(event) {
    event.preventDefault();
    const value = Number(minutes);
    if (!Number.isFinite(value) || value < 1) return;
    onAddSession(entry._id, value);
    setMinutes('');
  }

  function handleRemove() {
    if (window.confirm(`Xoá "${game.name}" khỏi thư viện?`)) {
      onRemove(entry._id);
    }
  }

  return (
    <article
      className={`flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition dark:border-slate-800 dark:bg-[#0F172A] sm:flex-row ${
        busy ? 'opacity-60' : ''
      }`}
    >
      <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 sm:w-48">
        {game.backgroundImage ? (
          <img src={game.backgroundImage} alt={game.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Chưa có ảnh</div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">{game.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {game.genres.slice(0, 3).join(' • ') || 'Chưa rõ thể loại'}
              {game.released ? ` • ${game.released.slice(0, 4)}` : ''}
            </p>
          </div>
          <StatusBadge status={entry.status} />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            Trạng thái
            <select
              className={controlClass}
              value={entry.status}
              disabled={busy}
              onChange={(e) => onUpdate(entry._id, { status: e.target.value })}
            >
              {GAME_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            Điểm
            <select
              className={controlClass}
              value={entry.rating ?? ''}
              disabled={busy}
              onChange={(e) => onUpdate(entry._id, { rating: e.target.value === '' ? null : Number(e.target.value) })}
            >
              <option value="">Chưa chấm</option>
              {RATING_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}/10
                </option>
              ))}
            </select>
          </label>

          <span className="font-mono text-slate-700 dark:text-slate-200">⏱ {entry.hoursPlayed.toFixed(1)} giờ</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleSessionSubmit} className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="1440"
              value={minutes}
              disabled={busy}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Số phút"
              aria-label="Số phút vừa chơi"
              className={`${controlClass} w-28`}
            />
            <button
              type="submit"
              disabled={busy || !minutes}
              className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ghi giờ chơi
            </button>
          </form>

          <button
            type="button"
            disabled={busy}
            onClick={handleRemove}
            className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            Xoá
          </button>
        </div>
      </div>
    </article>
  );
}
