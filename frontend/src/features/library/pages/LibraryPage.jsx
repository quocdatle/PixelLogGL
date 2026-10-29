import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LibraryHeader from '../components/LibraryHeader';
import LibraryItem from '../components/LibraryItem';
import libraryService, { GAME_STATUS_OPTIONS, getErrorMessage } from '../libraryService';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: 'recent', label: 'Cập nhật gần đây' },
  { value: 'name', label: 'Tên A-Z' },
  { value: 'rating', label: 'Điểm cao nhất' },
  { value: 'hours', label: 'Chơi nhiều nhất' },
];

const controlClass =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

// Trang thư viện game cá nhân: lọc theo trạng thái, tìm trong thư viện, chỉnh trạng thái/điểm/giờ chơi
export default function LibraryPage() {
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);

  const [summary, setSummary] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Kết quả gắn với "key" của request; loading = key hiện tại chưa có kết quả tương ứng
  const [response, setResponse] = useState({ key: null, data: null, error: null });
  const requestKey = `${status}|${debouncedQuery}|${sort}|${page}`;
  const loading = response.key !== requestKey;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const loadSummary = useCallback(() => {
    return libraryService
      .getSummary()
      .then(setSummary)
      .catch(() => {}); // thống kê là phần phụ, lỗi thì giữ số cũ
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    let cancelled = false;

    libraryService
      .getLibrary({ status: status || undefined, search: debouncedQuery || undefined, sort, page, limit: PAGE_SIZE })
      .then((data) => !cancelled && setResponse({ key: requestKey, data, error: null }))
      .catch((err) => !cancelled && setResponse({ key: requestKey, data: null, error: getErrorMessage(err) }));

    return () => {
      cancelled = true;
    };
  }, [status, debouncedQuery, sort, page, requestKey]);

  // Cập nhật 1 mục trong danh sách đang hiển thị mà không phải tải lại cả trang
  function patchItem(updated) {
    setResponse((prev) => {
      if (!prev.data) return prev;
      const stillMatches = !status || updated.status === status;
      const items = stillMatches
        ? prev.data.items.map((item) => (item._id === updated._id ? updated : item))
        : prev.data.items.filter((item) => item._id !== updated._id);
      const total = stillMatches ? prev.data.total : prev.data.total - 1;
      return { ...prev, data: { ...prev.data, items, total } };
    });
  }

  async function runAction(id, action) {
    setBusyId(id);
    setActionError(null);
    try {
      await action();
      await loadSummary();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  function handleUpdate(id, patch) {
    return runAction(id, async () => patchItem(await libraryService.updateEntry(id, patch)));
  }

  function handleAddSession(id, minutes) {
    return runAction(id, async () => patchItem(await libraryService.addPlaySession(id, { minutes })));
  }

  function handleRemove(id) {
    return runAction(id, async () => {
      await libraryService.removeEntry(id);
      setResponse((prev) => {
        if (!prev.data) return prev;
        const items = prev.data.items.filter((item) => item._id !== id);
        return { ...prev, data: { ...prev.data, items, total: prev.data.total - 1 } };
      });
    });
  }

  const items = response.data?.items ?? [];
  const total = response.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const isFiltering = Boolean(status || debouncedQuery);

  const tabs = [
    { value: '', label: 'Tất cả', count: summary?.total },
    ...GAME_STATUS_OPTIONS.map((opt) => ({ ...opt, count: summary?.byStatus?.[opt.value] })),
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-800 transition-colors dark:bg-[#0B0F19] dark:text-slate-100 sm:p-6 lg:p-8">
      <LibraryHeader />

      <main className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Thư viện của tôi</h1>
          {summary && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {summary.total} game • tổng {summary.totalHours.toFixed(1)} giờ chơi
            </p>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Lọc theo trạng thái">
          {tabs.map((tab) => {
            const active = status === tab.value;
            return (
              <button
                key={tab.value || 'all'}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={`cursor-pointer rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && <span className="ml-1.5 opacity-70">{tab.count}</span>}
              </button>
            );
          })}
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm trong thư viện của bạn"
            aria-label="Tìm trong thư viện"
            className={`${controlClass} min-w-0 flex-1 basis-64`}
          />
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            aria-label="Sắp xếp"
            className={controlClass}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {actionError && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            {actionError}
          </p>
        )}

        {loading && <p className="py-12 text-center text-slate-500 dark:text-slate-400">Đang tải thư viện...</p>}

        {!loading && response.error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {response.error}
          </p>
        )}

        {!loading && !response.error && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
            <p className="mb-3 text-slate-600 dark:text-slate-300">
              {isFiltering ? 'Không có game nào khớp bộ lọc.' : 'Thư viện của bạn còn trống.'}
            </p>
            {!isFiltering && (
              <Link
                to="/library/search"
                className="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Tìm game để thêm
              </Link>
            )}
          </div>
        )}

        {!loading && items.length > 0 && (
          <>
            <div className="flex flex-col gap-4">
              {items.map((entry) => (
                <LibraryItem
                  key={entry._id}
                  entry={entry}
                  busy={busyId === entry._id}
                  onUpdate={handleUpdate}
                  onAddSession={handleAddSession}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {totalPages > 1 && (
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
            )}
          </>
        )}
      </main>
    </div>
  );
}
