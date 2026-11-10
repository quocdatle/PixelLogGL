import { useState, useEffect } from "react";
import libraryService from "../libraryService";
import StatusBadge from "./StatusBadge";

const STATUS_OPTIONS = [
  { value: "backlog", label: "Chờ chơi" },
  { value: "playing", label: "Đang chơi" },
  { value: "completed", label: "Hoàn thành" },
  { value: "dropped", label: "Tạm dừng" },
  { value: "wishlist", label: "Muốn chơi" },
];

export default function GameDetailModal({
  isOpen,
  onClose,
  rawgId,
  userGame: initialUserGame = null,
  onUserGameUpdated,
  onUserGameRemoved,
  onAddedToLibrary,
}) {
  const [gameDetail, setGameDetail] = useState(null);
  const [userGame, setUserGame] = useState(initialUserGame);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeScreenshot, setActiveScreenshot] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);

  // Form states khi đã có trong kho
  const [sessionMinutes, setSessionMinutes] = useState("60");
  const [sessionNote, setSessionNote] = useState("");
  const [loggingSession, setLoggingSession] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Add to library state khi chưa có trong kho
  const [addStatus, setAddStatus] = useState("backlog");
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const targetRawgId = rawgId || initialUserGame?.rawgId;

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !targetRawgId) return;
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);
      setFeedback(null);
      setDescExpanded(false);

      try {
        const requests = [libraryService.getGameDetail(targetRawgId)];
        if (initialUserGame?.id) {
          requests.push(libraryService.getUserGameById(initialUserGame.id));
        }

        const [detailRes, entryRes] = await Promise.allSettled(requests);
        if (cancelled) return;

        if (detailRes.status === "fulfilled" && detailRes.value) {
          setGameDetail(detailRes.value);
          setActiveScreenshot(
            detailRes.value.backgroundImage ||
              detailRes.value.screenshots?.[0] ||
              null
          );
        } else {
          setError("Không thể tải thông tin chi tiết của tựa game này.");
        }

        if (entryRes && entryRes.status === "fulfilled" && entryRes.value) {
          setUserGame(entryRes.value);
        } else {
          setUserGame(initialUserGame);
        }
      } catch {
        if (!cancelled) {
          setError("Đã có lỗi xảy ra khi tải chi tiết game.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [isOpen, targetRawgId, initialUserGame]);

  if (!isOpen) return null;

  const title = gameDetail?.name || userGame?.title || "Chi tiết trò chơi";
  const coverImg =
    activeScreenshot ||
    gameDetail?.backgroundImage ||
    userGame?.coverUrl ||
    null;
  const screenshots = Array.from(
    new Set(
      [
        gameDetail?.backgroundImage,
        ...(gameDetail?.screenshots || []),
      ].filter(Boolean)
    )
  );

  async function handleStatusChange(newStatus) {
    if (!userGame) return;
    setSavingMeta(true);
    setFeedback(null);
    try {
      const updated = await libraryService.updateGame(userGame.id, {
        status: newStatus,
      });
      setUserGame((prev) => ({ ...updated, playSessions: prev?.playSessions || [] }));
      onUserGameUpdated?.(updated);
      setFeedback({ type: "success", text: "Đã cập nhật trạng thái chơi." });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.response?.data?.message || "Không thể cập nhật trạng thái.",
      });
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleRatingChange(newRating) {
    if (!userGame) return;
    setSavingMeta(true);
    setFeedback(null);
    try {
      const updated = await libraryService.updateGame(userGame.id, {
        rating: newRating,
      });
      setUserGame((prev) => ({ ...updated, playSessions: prev?.playSessions || [] }));
      onUserGameUpdated?.(updated);
      setFeedback({ type: "success", text: `Đã chấm ${newRating}/10 điểm.` });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.response?.data?.message || "Không thể lưu điểm đánh giá.",
      });
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleLogSession(e) {
    e.preventDefault();
    if (!userGame) return;
    const mins = Number(sessionMinutes);
    if (!Number.isFinite(mins) || mins < 1 || mins > 1440) {
      setFeedback({
        type: "error",
        text: "Số phút mỗi phiên chơi phải từ 1 đến 1440 phút.",
      });
      return;
    }

    setLoggingSession(true);
    setFeedback(null);
    try {
      const updated = await libraryService.logPlaySession(userGame.id, {
        minutes: mins,
        note: sessionNote,
      });
      setUserGame(updated);
      setSessionNote("");
      onUserGameUpdated?.(updated);
      setFeedback({
        type: "success",
        text: `Đã ghi nhận +${mins} phút vào nhật ký chơi.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.response?.data?.message || "Không thể ghi nhận phiên chơi.",
      });
    } finally {
      setLoggingSession(false);
    }
  }

  async function handleAddToLibrary() {
    if (!targetRawgId) return;
    setAdding(true);
    setFeedback(null);
    try {
      const created = await libraryService.addGame({
        rawgId: targetRawgId,
        status: addStatus,
      });
      setUserGame(created);
      onAddedToLibrary?.(created);
      setFeedback({ type: "success", text: "Đã thêm game vào thư viện của bạn!" });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.response?.data?.message || "Không thể thêm game vào thư viện.",
      });
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveFromLibrary() {
    if (!userGame) return;
    if (!window.confirm(`Bạn có chắc muốn xóa "${title}" khỏi thư viện?`)) {
      return;
    }
    setRemoving(true);
    try {
      await libraryService.removeGame(userGame.id);
      onUserGameRemoved?.(userGame.id);
      onClose();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.response?.data?.message || "Không thể xóa game khỏi thư viện.",
      });
      setRemoving(false);
    }
  }

  const description = gameDetail?.description || "";
  const isLongDesc = description.length > 420;
  const displayedDesc =
    isLongDesc && !descExpanded
      ? `${description.slice(0, 420).trim()}...`
      : description;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-detail-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Hero Image & Close Button */}
        <div className="relative h-52 sm:h-72 bg-zinc-900 shrink-0 overflow-hidden">
          {coverImg ? (
            <img
              src={coverImg}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold text-xl">
              {title.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div
            className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-black/25"
            aria-hidden="true"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ chi tiết"
            className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-black/55 hover:bg-black/80 text-white border border-white/15 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {userGame && <StatusBadge status={userGame.status} />}
                {gameDetail?.metacritic && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-extrabold tabular-nums ${
                      gameDetail.metacritic >= 75
                        ? "bg-emerald-500 text-white"
                        : gameDetail.metacritic >= 50
                        ? "bg-amber-500 text-white"
                        : "bg-rose-500 text-white"
                    }`}
                  >
                    Metacritic {gameDetail.metacritic}
                  </span>
                )}
                {gameDetail?.rating > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-black/65 text-amber-400 border border-white/10 tabular-nums">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {gameDetail.rating.toFixed(1)}/5
                  </span>
                )}
              </div>

              <h2
                id="game-detail-title"
                className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate"
              >
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 mt-0.5 truncate">
                {(gameDetail?.developers?.length ? gameDetail.developers.join(", ") : userGame?.developer) || "Studio"}
                {gameDetail?.released ? ` • Phát hành ${gameDetail.released}` : ""}
              </p>
            </div>

            {gameDetail?.website && (
              <a
                href={gameDetail.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-colors shrink-0 self-start sm:self-end"
              >
                <span>Trang chính thức</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {feedback && (
            <div
              role="status"
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border ${
                feedback.type === "error"
                  ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900"
                  : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
              }`}
            >
              {feedback.text}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 motion-safe:animate-pulse" />
              <div className="h-32 rounded-xl bg-zinc-100 dark:bg-zinc-800 motion-safe:animate-pulse" />
            </div>
          ) : error && !gameDetail ? (
            <div className="p-6 text-center rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          ) : (
            <>
              {/* Screenshot Thumbnails Strip */}
              {screenshots.length > 1 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
                    Ảnh chụp màn hình ({screenshots.length})
                  </h3>
                  <div className="flex gap-2.5 overflow-x-auto pb-1">
                    {screenshots.map((url, idx) => {
                      const isActive = coverImg === url;
                      return (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setActiveScreenshot(url)}
                          aria-label={`Xem ảnh ${idx + 1}`}
                          aria-pressed={isActive}
                          className={`relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden shrink-0 border-2 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                            isActive
                              ? "border-emerald-500 shadow-sm"
                              : "border-transparent opacity-75 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`${title} screenshot ${idx + 1}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Thể loại
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white mt-0.5 line-clamp-2">
                    {gameDetail?.genres?.length
                      ? gameDetail.genres.join(", ")
                      : userGame?.genre || "Đang cập nhật"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Nhà phát hành
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white mt-0.5 line-clamp-2">
                    {gameDetail?.publishers?.length
                      ? gameDetail.publishers.join(", ")
                      : "Đang cập nhật"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Thời lượng TB (RAWG)
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white mt-0.5 tabular-nums">
                    {gameDetail?.playtimeAvg ? `${gameDetail.playtimeAvg} giờ` : "Chưa có số liệu"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Độ tuổi (ESRB)
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                    {gameDetail?.esrbRating || "Chưa phân loại"}
                  </div>
                </div>
              </div>

              {/* Platforms Pills */}
              {gameDetail?.platforms?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Nền tảng hỗ trợ
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {gameDetail.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/70 dark:border-zinc-700/70"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Game Description */}
              {description && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Giới thiệu cốt truyện & lối chơi
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                    {displayedDesc}
                  </p>
                  {isLongDesc && (
                    <button
                      type="button"
                      onClick={() => setDescExpanded((prev) => !prev)}
                      className="mt-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      {descExpanded ? "Thu gọn" : "Đọc thêm"}
                    </button>
                  )}
                </div>
              )}

              {/* Library Controls & Gaming Journal */}
              {userGame ? (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 p-4 sm:p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                        Tiến độ cá nhân & Nhật ký chơi
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Tổng thời gian đã ghi nhận:{" "}
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {userGame.playtimeHours || 0} giờ
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={userGame.status}
                        disabled={savingMeta}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        aria-label="Trạng thái chơi"
                        className="py-1.5 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleRemoveFromLibrary}
                        disabled={removing}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {removing ? "Đang xóa..." : "Xóa khỏi kho"}
                      </button>
                    </div>
                  </div>

                  {/* Quick Personal Rating (1-10) */}
                  <div>
                    <span className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Đánh giá cá nhân (1–10 điểm)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                        const active = userGame.rating === score;
                        return (
                          <button
                            key={score}
                            type="button"
                            disabled={savingMeta}
                            onClick={() => handleRatingChange(score)}
                            aria-pressed={active}
                            className={`w-8 h-8 rounded-lg text-xs font-bold tabular-nums cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                              active
                                ? "bg-amber-500 text-white shadow-xs"
                                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-amber-400"
                            }`}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Log New Play Session Form */}
                  <form onSubmit={handleLogSession} className="space-y-2.5">
                    <span className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Ghi nhận phiên chơi mới (Gaming Logbook)
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="sm:w-32">
                        <input
                          type="number"
                          min="1"
                          max="1440"
                          value={sessionMinutes}
                          onChange={(e) => setSessionMinutes(e.target.value)}
                          placeholder="Số phút"
                          aria-label="Số phút chơi"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <input
                        type="text"
                        maxLength={300}
                        value={sessionNote}
                        onChange={(e) => setSessionNote(e.target.value)}
                        placeholder="Ghi chú phiên chơi (vd: Vượt qua boss Chương 2, cày rank...)"
                        aria-label="Ghi chú phiên chơi"
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={loggingSession}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold cursor-pointer transition-colors disabled:opacity-50 shrink-0"
                      >
                        {loggingSession ? "Đang lưu..." : "Ghi nhật ký"}
                      </button>
                    </div>
                  </form>

                  {/* Play Sessions History */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      Nhật ký các lần chơi ({userGame.playSessions?.length || 0})
                    </h4>
                    {!userGame.playSessions?.length ? (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 py-2">
                        Chưa có phiên chơi nào được ghi lại. Hãy ghi nhận phiên chơi đầu tiên ở trên!
                      </p>
                    ) : (
                      <ul className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {[...userGame.playSessions]
                          .reverse()
                          .map((session, idx) => (
                            <li
                              key={session._id || idx}
                              className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs"
                            >
                              <div className="min-w-0">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                  +{session.minutes} phút
                                </span>
                                {session.note && (
                                  <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 break-words">
                                    {session.note}
                                  </p>
                                )}
                              </div>
                              <time className="text-[11px] text-zinc-400 shrink-0 tabular-nums">
                                {session.playedAt
                                  ? new Date(session.playedAt).toLocaleDateString("vi-VN", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })
                                  : "Vừa xong"}
                              </time>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                /* Add to Library CTA when opened from Advisor / Search */
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Chưa có trong thư viện của bạn
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Chọn trạng thái và thêm ngay vào kho game cá nhân.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={addStatus}
                      onChange={(e) => setAddStatus(e.target.value)}
                      disabled={adding}
                      aria-label="Chọn trạng thái khi thêm"
                      className="py-2 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddToLibrary}
                      disabled={adding}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {adding ? "Đang thêm..." : "Thêm vào kho"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
