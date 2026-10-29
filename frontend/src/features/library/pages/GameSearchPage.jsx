import { useEffect, useState } from 'react';
import GameCard from '../components/GameCard';
import LibraryHeader from '../components/LibraryHeader';
import libraryService, { getErrorCode, getErrorMessage } from '../libraryService';

const ORDERING_OPTIONS = [
  { value: '', label: 'Phù hợp nhất' },
  { value: '-rating', label: 'Đánh giá cao' },
  { value: '-released', label: 'Mới phát hành' },
  { value: '-metacritic', label: 'Metacritic cao' },
];

const controlClass =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

// Trang tra cứu game qua RAWG (đi qua backend) và thêm vào thư viện cá nhân
export default function GameSearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [ordering, setOrdering] = useState('');
  const [page, setPage] = useState(1);

  const [genres, setGenres] = useState([]);
  const [ownedIds, setOwnedIds] = useState(() => new Set());
  const [addingId, setAddingId] = useState(null);
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', text }

  // Kết quả gắn với "key" của request; loading = key hiện tại chưa có kết quả tương ứng
  const [response, setResponse] = useState({ key: null, data: null, error: null });
  const requestKey = `${debouncedQuery}|${genre}|${ordering}|${page}`;
  const loading = response.key !== requestKey;

  // Debounce ô tìm kiếm để không gọi RAWG sau mỗi phím gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Danh sách thể loại + các game user đã có (để hiện "Đã có trong thư viện")
  useEffect(() => {
    let cancelled = false;

    libraryService
      .getGenres()
      .then((data) => !cancelled && setGenres(data))
      .catch(() => {}); // lọc thể loại là phần phụ, lỗi thì bỏ qua

    libraryService
      .getLibrary({ limit: 100 })
      .then((data) => {
        if (!cancelled) setOwnedIds(new Set(data.items.map((item) => item.game.rawgId)));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    libraryService
      .searchGames({
        search: debouncedQuery || undefined,
        genres: genre || undefined,
        ordering: ordering || undefined,
        page,
        pageSize: 20,
      })
      .then((data) => !cancelled && setResponse({ key: requestKey, data, error: null }))
      .catch((err) => !cancelled && setResponse({ key: requestKey, data: null, error: getErrorMessage(err) }));

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, genre, ordering, page, requestKey]);

  async function handleAdd(game) {
    setAddingId(game.rawgId);
    setNotice(null);
    try {
      await libraryService.addToLibrary({ rawgId: game.rawgId });
      setOwnedIds((prev) => new Set(prev).add(game.rawgId));
      setNotice({ type: 'success', text: `Đã thêm "${game.name}" vào thư viện` });
    } catch (err) {
      if (getErrorCode(err) === 'ALREADY_IN_LIBRARY') {
        setOwnedIds((prev) => new Set(prev).add(game.rawgId));
      }
      setNotice({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setAddingId(null);
    }
  }

  const results = response.data?.results ?? [];
  const totalPages = response.data ? Math.max(1, Math.ceil(response.data.count / 20)) : 1;

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-800 transition-colors dark:bg-[#0B0F19] dark:text-slate-100 sm:p-6 lg:p-8">
      <LibraryHeader />

      <main className="mx-auto w-full max-w-6xl">
        <h1 className="mb-4 text-2xl font-extrabold text-slate-900 dark:text-white">Tìm game</h1>

        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập tên game, ví dụ: Elden Ring"
            aria-label="Tìm game theo tên"
            className={`${controlClass} min-w-0 flex-1 basis-64`}
          />
          <select
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setPage(1);
            }}
            aria-label="Lọc theo thể loại"
            className={controlClass}
          >
            <option value="">Mọi thể loại</option>
            {genres.map((g) => (
              <option key={g.id} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
          <select
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value);
              setPage(1);
            }}
            aria-label="Sắp xếp"
            className={controlClass}
          >
            {ORDERING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {notice && (
          <div
            role="status"
            className={`mb-4 rounded-xl border px-4 py-2 text-sm font-medium ${
              notice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
            }`}
          >
            {notice.text}
          </div>
        )}

        {loading && <p className="py-12 text-center text-slate-500 dark:text-slate-400">Đang tải danh sách game...</p>}

        {!loading && response.error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {response.error}
          </p>
        )}

        {!loading && !response.error && results.length === 0 && (
          <p className="py-12 text-center text-slate-500 dark:text-slate-400">Không tìm thấy game nào phù hợp.</p>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((game) => (
                <GameCard
                  key={game.rawgId}
                  game={game}
                  inLibrary={ownedIds.has(game.rawgId)}
                  adding={addingId === game.rawgId}
                  onAdd={handleAdd}
                />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 font-semibold transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                ← Trước
              </button>
              <span className="text-slate-600 dark:text-slate-300">
                Trang {page}/{totalPages}
              </span>
              <button
                type="button"
                disabled={!response.data?.hasNext}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 font-semibold transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Sau →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
