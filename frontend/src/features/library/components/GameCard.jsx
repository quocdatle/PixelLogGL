// Thẻ game ở trang tra cứu: ảnh bìa, thông tin cơ bản và nút "Thêm vào thư viện"
export default function GameCard({ game, inLibrary, adding, onAdd }) {
  const year = game.released ? game.released.slice(0, 4) : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xs">
      <div className="aspect-video bg-slate-200 dark:bg-slate-800">
        {game.backgroundImage ? (
          <img src={game.backgroundImage} alt={game.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Chưa có ảnh</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-bold leading-snug text-slate-900 dark:text-white line-clamp-2">{game.name}</h3>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          {year && <span>{year}</span>}
          {game.rating ? <span>★ {game.rating.toFixed(1)}/5</span> : null}
          {game.metacritic ? <span>Metacritic {game.metacritic}</span> : null}
        </div>

        {game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {game.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2">
          {inLibrary ? (
            <span className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              ✓ Đã có trong thư viện
            </span>
          ) : (
            <button
              type="button"
              disabled={adding}
              onClick={() => onAdd(game)}
              className="w-full cursor-pointer rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {adding ? 'Đang thêm...' : '+ Thêm vào thư viện'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
