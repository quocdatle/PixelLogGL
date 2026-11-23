import { useState, useEffect } from "react";
import libraryService from "../libraryService";

const TIMER_STORAGE_KEY = "pixellog_general_play_timer";

function formatTimerDigits(totalSeconds = 0) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const p = (n) => String(n).padStart(2, "0");
  return `${p(hrs)}:${p(mins)}:${p(secs)}`;
}

function formatTimeDisplay(totalSeconds = 0) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export default function PlaytimeTracker({ games = [], onSessionSaved, toast, confirm }) {
  // Tìm game mặc định: ưu tiên game đang ở trạng thái 'playing', nếu không thì lấy game đầu tiên
  const defaultGame = games.find((g) => g.status === "playing") || games[0];

  const [selectedGameId, setSelectedGameId] = useState(() => defaultGame?.id || "");
  const [timerState, setTimerState] = useState(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.startTime) {
          return parsed;
        }
      }
    } catch {
      // Bỏ qua lỗi parse
    }
    return null;
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (timerState?.startTime) {
      return Math.max(0, Math.floor((Date.now() - timerState.startTime) / 1000));
    }
    return 0;
  });

  const [isSaving, setIsSaving] = useState(false);

  // Cập nhật selectedGameId khi danh sách game thay đổi nếu chưa chọn
  useEffect(() => {
    if (!selectedGameId && defaultGame?.id) {
      setSelectedGameId(defaultGame.id);
    }
  }, [games, selectedGameId, defaultGame?.id]);

  // Bộ đếm thời gian thực khi timer đang chạy
  useEffect(() => {
    if (!timerState?.startTime) {
      setElapsedSeconds(0);
      return;
    }

    // Cập nhật ngay lập tức
    setElapsedSeconds(Math.max(0, Math.floor((Date.now() - timerState.startTime) / 1000)));

    const interval = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - timerState.startTime) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState?.startTime]);

  // Bắt đầu tính giờ chơi
  function handleStartTimer() {
    if (games.length === 0) {
      toast("Vui lòng thêm ít nhất 1 tựa game vào thư viện để tính giờ chơi.", "warning");
      return;
    }

    const targetGameId = selectedGameId || defaultGame?.id;
    const newTimer = {
      startTime: Date.now(),
      gameId: targetGameId,
    };

    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(newTimer));
    } catch {
      // LocalStorage error fallback
    }

    setTimerState(newTimer);
    setElapsedSeconds(0);

    const targetGame = games.find((g) => g.id === targetGameId);
    toast(
      targetGame
        ? `⏱️ Bắt đầu tính giờ chơi cho "${targetGame.title}".`
        : "⏱️ Bắt đầu tính giờ chơi.",
      "info"
    );
  }

  // Dừng & lưu giờ chơi
  async function handleStopTimer() {
    if (!timerState?.startTime) return;

    const currentElapsed = Math.max(1, Math.floor((Date.now() - timerState.startTime) / 1000));
    // Tối thiểu 1 phút để hợp lệ backend validation
    const minutes = Math.max(1, Math.round(currentElapsed / 60));

    const targetGameId = timerState.gameId || selectedGameId || defaultGame?.id;
    if (!targetGameId) {
      toast("Không xác định được game để ghi nhận giờ chơi.", "error");
      return;
    }

    const targetGame = games.find((g) => g.id === targetGameId);

    setIsSaving(true);
    try {
      const updated = await libraryService.logPlaySession(targetGameId, {
        minutes,
        note: `Tính giờ chơi (${formatTimeDisplay(currentElapsed)})`,
      });

      if (updated && onSessionSaved) {
        onSessionSaved(updated);
      }

      toast(
        `🎮 Đã lưu phiên chơi cho "${targetGame?.title || 'game'}": +${minutes} phút (${formatTimeDisplay(currentElapsed)})!`,
        "success"
      );
    } catch (err) {
      toast(err.response?.data?.message || "Không thể lưu phiên chơi", "error");
    } finally {
      localStorage.removeItem(TIMER_STORAGE_KEY);
      setTimerState(null);
      setElapsedSeconds(0);
      setIsSaving(false);
    }
  }

  // Hủy phiên tính giờ không lưu
  async function handleCancelTimer() {
    if (!timerState?.startTime) return;

    const accepted = await confirm({
      title: "Hủy phiên tính giờ",
      message: "Bạn có chắc muốn hủy phiên tính giờ mà không lưu lại thời gian trải nghiệm?",
      confirmLabel: "Hủy bỏ",
      cancelLabel: "Tiếp tục tính giờ",
      danger: true,
    });
    if (!accepted) return;

    localStorage.removeItem(TIMER_STORAGE_KEY);
    setTimerState(null);
    setElapsedSeconds(0);
    toast("Đã hủy phiên tính giờ chơi.", "info");
  }

  // Đổi game ghi nhận
  function handleSelectGame(gameId) {
    setSelectedGameId(gameId);
    if (timerState) {
      const updated = { ...timerState, gameId };
      setTimerState(updated);
      try {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
    }
  }

  const isRunning = Boolean(timerState?.startTime);
  const activeGame = games.find((g) => g.id === (timerState?.gameId || selectedGameId));

  return (
    <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 transition-colors duration-150">
      {/* Khối bên trái: Nút tính giờ và Div đồng hồ tính giờ kế bên */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Nút tính giờ */}
        {isRunning ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleStopTimer}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm cursor-pointer transition-colors duration-150 disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-white" viewBox="0 0 20 20">
                <rect x="5" y="5" width="10" height="10" rx="1.5" />
              </svg>
              <span>{isSaving ? "Đang lưu..." : "Dừng & Lưu giờ chơi"}</span>
            </button>

            <button
              type="button"
              onClick={handleCancelTimer}
              disabled={isSaving}
              title="Hủy phiên chơi (không lưu)"
              className="p-2 sm:p-2.5 rounded-xl bg-zinc-200/70 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartTimer}
            disabled={games.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-white" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            <span>Bắt đầu tính giờ</span>
          </button>
        )}

        {/* Div đồng hồ tính giờ kế bên */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-xl border transition-all duration-150 ${
            isRunning
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600/50 text-emerald-700 dark:text-emerald-300 shadow-sm"
              : "bg-white dark:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          {isRunning ? (
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          ) : (
            <svg
              className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}

          <span className="font-mono text-base sm:text-lg font-black tabular-nums tracking-wider">
            {formatTimerDigits(elapsedSeconds)}
          </span>

          <span
            className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline px-1.5 py-0.5 rounded ${
              isRunning
                ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {isRunning ? "Đang tính giờ" : "Sẵn sàng"}
          </span>
        </div>
      </div>

      {/* Khối bên phải: Chọn tựa game ghi nhận thời gian */}
      {games.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <label
            htmlFor="playtime-game-select"
            className="text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap shrink-0"
          >
            {isRunning ? "Đang chơi:" : "Ghi nhận cho:"}
          </label>

          <select
            id="playtime-game-select"
            value={selectedGameId || defaultGame?.id || ""}
            onChange={(e) => handleSelectGame(e.target.value)}
            className="w-full sm:w-auto max-w-[240px] text-xs font-semibold py-1.5 px-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 truncate cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title} {g.status === "playing" ? "(Đang chơi)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
