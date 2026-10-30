import { useState, useEffect, useRef, useMemo } from "react";
import libraryService from "../libraryService";
import StatusBadge from "./StatusBadge";

const POPULAR_SUGGESTIONS = [
  "Elden Ring",
  "Cyberpunk 2077",
  "Grand Theft Auto V",
  "The Witcher 3",
  "Black Myth: Wukong",
  "God of War",
  "Hollow Knight",
  "Hades",
  "Baldur's Gate 3",
  "Red Dead Redemption 2",
];

const STATUS_OPTIONS = [
  { value: "backlog", label: "Chờ chơi" },
  { value: "playing", label: "Đang chơi" },
  { value: "completed", label: "Hoàn thành" },
  { value: "wishlist", label: "Muốn chơi" },
];

export default function AddGameModal({
  isOpen,
  onClose,
  existingGames = [],
  onGameAdded,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [addingId, setAddingId] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [justAddedIds, setJustAddedIds] = useState(() => new Set());

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Map existing games by rawgId and title for quick check
  const existingMap = useMemo(() => {
    const map = new Map();
    existingGames.forEach((g) => {
      if (g.rawgId) {
        map.set(Number(g.rawgId), g.status || "backlog");
      }
      if (g.title) {
        map.set(g.title.toLowerCase().trim(), g.status || "backlog");
      }
    });
    return map;
  }, [existingGames]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced live search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const abortController = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await libraryService.searchGames(trimmed, {
          pageSize: 10,
          signal: abortController.signal,
        });
        setResults(data);
        setSelectedIndex(-1);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Lỗi khi tìm kiếm game:", err);
          setError("Không thể tìm kiếm game lúc này. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

  function handleQueryChange(val) {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setError(null);
      setSelectedIndex(-1);
    }
  }

  function handlePickSuggestion(item) {
    handleQueryChange(item);
    inputRef.current?.focus();
  }

  // Keyboard navigation (Arrow Up, Arrow Down, Enter, Escape)
  function handleKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev < results.length - 1 ? prev + 1 : 0;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : results.length - 1;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const targetGame = results[selectedIndex];
      if (targetGame && !isAlreadyInLibrary(targetGame)) {
        handleAdd(targetGame);
      }
    }
  }

  function scrollIntoView(index) {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-suggestion-item]");
    if (items[index]) {
      items[index].scrollIntoView({ block: "nearest" });
    }
  }

  function isAlreadyInLibrary(game) {
    if (justAddedIds.has(game.rawgId)) return true;
    if (game.rawgId && existingMap.has(Number(game.rawgId))) {
      return true;
    }
    if (game.name && existingMap.has(game.name.toLowerCase().trim())) {
      return true;
    }
    return false;
  }

  function getExistingStatus(game) {
    if (justAddedIds.has(game.rawgId)) {
      return selectedStatuses[game.rawgId] || "backlog";
    }
    if (game.rawgId && existingMap.has(Number(game.rawgId))) {
      return existingMap.get(Number(game.rawgId));
    }
    if (game.name && existingMap.has(game.name.toLowerCase().trim())) {
      return existingMap.get(game.name.toLowerCase().trim());
    }
    return null;
  }

  async function handleAdd(game) {
    const status = selectedStatuses[game.rawgId] || "backlog";
    setAddingId(game.rawgId);
    setError(null);

    try {
      const addedGame = await libraryService.addGame({
        rawgId: game.rawgId,
        status,
      });

      setJustAddedIds((prev) => new Set(prev).add(game.rawgId));
      if (onGameAdded) {
        onGameAdded(addedGame);
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Không thể thêm game vào kho";
      setError(message);
    } finally {
      setAddingId(null);
    }
  }

  function handleStatusChange(rawgId, status) {
    setSelectedStatuses((prev) => ({
      ...prev,
      [rawgId]: status,
    }));
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-10 sm:pt-16 bg-black/60 backdrop-blur-xs transition-opacity duration-150 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Header (Google-like bar) */}
        <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/90">
          <div className="flex items-center gap-3">
            {/* Search Input Container */}
            <div className="relative flex-1 flex items-center">
              <span className="absolute left-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none">
                {loading ? (
                  <svg
                    className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                ) : (
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </span>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm kiếm game (ví dụ: Elden Ring, The Witcher 3, GTA V...)"
                className="w-full pl-11 pr-24 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 dark:focus:border-emerald-500 transition-all shadow-xs"
              />

              <div className="absolute right-3 flex items-center gap-1.5">
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      handleQueryChange("");
                      inputRef.current?.focus();
                    }}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                    title="Xóa tìm kiếm"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-700/60 border border-zinc-200 dark:border-zinc-600 rounded">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              title="Đóng cửa sổ"
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

          {error && (
            <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div ref={listRef} className="overflow-y-auto flex-1 p-2 sm:p-3">
          {/* State 1: Query is empty -> Popular suggestions / Guidance */}
          {!query.trim() && (
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h3 className="text-xs font-bold tracking-wide uppercase text-zinc-500 dark:text-zinc-400">
                  Gợi ý tìm kiếm phổ biến
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {POPULAR_SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handlePickSuggestion(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-3 h-3 text-zinc-400 dark:text-zinc-500"
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
                    <span>{item}</span>
                  </button>
                ))}
              </div>

              <div className="rounded-xl p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-2.5">
                <svg
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-0.5">
                    Mẹo tìm kiếm:
                  </p>
                  <p>
                    Hệ thống sẽ tự động tìm kiếm trực tiếp trên cơ sở dữ liệu quốc
                    tế RAWG khi bạn gõ. Dùng phím{" "}
                    <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[10px]">
                      ↑
                    </kbd>{" "}
                    <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[10px]">
                      ↓
                    </kbd>{" "}
                    để chọn nhanh và{" "}
                    <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[10px]">
                      Enter
                    </kbd>{" "}
                    để thêm vào kho.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* State 2: Loading Skeletons */}
          {loading && query.trim() && results.length === 0 && (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/40 animate-pulse flex items-center gap-3.5"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-zinc-200 dark:bg-zinc-700 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-44 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                    <div className="w-28 h-3 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  </div>
                  <div className="w-24 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* State 3: Empty Results */}
          {!loading && query.trim() && results.length === 0 && (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                Không tìm thấy tựa game nào
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
                Không có kết quả nào khớp với &quot;{query}&quot;. Thử kiểm tra lại
                chính tả hoặc tìm tên tiếng Anh phổ biến của game.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleQueryChange("");
                  inputRef.current?.focus();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
              >
                Xóa tìm kiếm
              </button>
            </div>
          )}

          {/* State 4: Autocomplete Suggestions List */}
          {results.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Gợi ý ({results.length})</span>
                <span className="hidden sm:inline text-zinc-400">
                  Dùng ↑ ↓ để duyệt, Enter để thêm
                </span>
              </div>

              {results.map((game, index) => {
                const inLibrary = isAlreadyInLibrary(game);
                const isAdding = addingId === game.rawgId;
                const isSelected = selectedIndex === index;
                const chosenStatus = selectedStatuses[game.rawgId] || "backlog";
                const existingStatus = inLibrary ? getExistingStatus(game) : null;

                const releaseYear = game.released
                  ? new Date(game.released).getFullYear()
                  : null;

                return (
                  <div
                    key={game.rawgId}
                    data-suggestion-item
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-xs"
                        : "bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200/70 dark:border-zinc-800"
                    }`}
                  >
                    {/* Game Info Left */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Thumbnail Cover */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700 relative">
                        {game.backgroundImage ? (
                          <img
                            src={game.backgroundImage}
                            alt={game.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Title & Metadata */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                            {game.name}
                          </h4>
                          {releaseYear && (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                              ({releaseYear})
                            </span>
                          )}
                        </div>

                        {/* Genres & Scores */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                          {game.genres && game.genres.length > 0 && (
                            <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[180px] sm:max-w-xs">
                              {game.genres.slice(0, 3).join(", ")}
                            </span>
                          )}

                          {game.metacritic && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] font-bold tabular-nums ${
                                game.metacritic >= 75
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : game.metacritic >= 50
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              }`}
                              title={`Điểm Metacritic: ${game.metacritic}`}
                            >
                              {game.metacritic}
                            </span>
                          )}

                          {game.rating && game.rating > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-amber-500 font-semibold tabular-nums text-xs">
                              <span>★</span>
                              <span>{game.rating.toFixed(1)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Right */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {inLibrary ? (
                        <div className="flex items-center gap-1.5">
                          {existingStatus ? (
                            <StatusBadge status={existingStatus} />
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.5"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Đã có trong kho
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {/* Quick Status Select */}
                          <select
                            value={chosenStatus}
                            onChange={(e) =>
                              handleStatusChange(game.rawgId, e.target.value)
                            }
                            disabled={isAdding}
                            className="py-1.5 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          {/* Add Button */}
                          <button
                            type="button"
                            onClick={() => handleAdd(game)}
                            disabled={isAdding}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            {isAdding ? (
                              <>
                                <svg
                                  className="w-3.5 h-3.5 animate-spin"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                  />
                                </svg>
                                <span>Đang thêm...</span>
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                                <span>Thêm vào kho</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <span>Dữ liệu trò chơi từ RAWG Database</span>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}