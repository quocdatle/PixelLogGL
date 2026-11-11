import { useState, useEffect, useRef } from 'react';
import { RARITY_THEME, TYPE_LABELS } from '../economyConstants';

const CARD_WIDTH = 140; // Chiều rộng mỗi thẻ item trong thanh cuộn
const CARD_GAP = 12; // Khoảng cách giữa các thẻ
const TOTAL_CARD_STEP = CARD_WIDTH + CARD_GAP; // 152px
const SPIN_DURATION_MS = 5500; // Thời gian quay 5.5s

// Hàm phát tiếng click nhẹ mô phỏng roulette bằng Web Audio API tái sử dụng 1 AudioContext
function playTickSound(ctx) {
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Trình duyệt chặn autoplay âm thanh thì bỏ qua an toàn
  }
}

export default function CaseAnimation({
  caseInfo,
  reelItems = [],
  targetIndex = 36,
  wonItem,
  isNew = false,
  onFinish,
  onReset,
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelOffset, setReelOffset] = useState(0);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const containerRef = useRef(null);
  const tickIntervalRef = useRef(null);

  // Bắt đầu quay khi component được mount
  useEffect(() => {
    if (!reelItems || reelItems.length === 0) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    try {
      if (AudioCtx) audioCtx = new AudioCtx();
    } catch {
      audioCtx = null;
    }

    // Tính toán vị trí dừng chính xác: căn giữa mục targetIndex vào giữa container
    const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 700;
    const centerPoint = containerWidth / 2;

    // Vị trí của target item tính từ đầu reel
    const targetItemCenter = targetIndex * TOTAL_CARD_STEP + CARD_WIDTH / 2;

    // Thêm một độ lệch ngẫu nhiên nhẹ (-30px đến +30px) để roulette tự nhiên hơn
    const jitter = (Math.random() - 0.5) * 50;
    const finalOffset = -(targetItemCenter - centerPoint + jitter);

    // Kích hoạt animation sau một frame
    const timerStart = setTimeout(() => {
      setIsSpinning(true);
      setReelOffset(finalOffset);

      // Mô phỏng tiếng tick chậm dần theo thời gian
      let currentInterval = 50;
      const startTime = Date.now();

      const runTicks = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < SPIN_DURATION_MS - 400) {
          playTickSound(audioCtx);
          currentInterval = Math.min(350, 50 + (elapsed / SPIN_DURATION_MS) * 300);
          tickIntervalRef.current = setTimeout(runTicks, currentInterval);
        }
      };
      runTicks();
    }, 100);

    // Khi kết thúc quay
    const timerEnd = setTimeout(() => {
      setIsSpinning(false);
      clearTimeout(tickIntervalRef.current);
      setShowRevealModal(true);
      if (onFinish) onFinish();
    }, SPIN_DURATION_MS + 250);

    return () => {
      clearTimeout(timerStart);
      clearTimeout(timerEnd);
      clearTimeout(tickIntervalRef.current);
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };
  }, [reelItems, targetIndex, onFinish]);

  const handleSkip = () => {
    clearTimeout(tickIntervalRef.current);
    setIsSpinning(false);
    setShowRevealModal(true);
    if (onFinish) onFinish();
  };

  const wonRarity = wonItem?.rarity || 'common';
  const wonTheme = RARITY_THEME[wonRarity] || RARITY_THEME.common;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-4 sm:p-6 shadow-2xl">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl shadow-inner">
            {caseInfo?.icon || '📦'}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              Đang mở: {caseInfo?.name || 'Rương báu'}
            </h2>
            <p className="text-xs text-zinc-400">Vòng quay roulette gacha đang xác định vật phẩm...</p>
          </div>
        </div>

        {/* Nút bỏ qua animation nếu người dùng muốn xem kết quả ngay */}
        {!showRevealModal && (
          <button
            type="button"
            onClick={handleSkip}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
          >
            Bỏ qua ⏩
          </button>
        )}
      </div>

      {/* Main Roulette Box */}
      <div className="relative w-full py-6 select-none">
        {/* Kim chỉ vị trí trúng thưởng (Center needle pointer) */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center justify-between">
          {/* Mũi tên trên */}
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-amber-400 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)]" />

          {/* Đường laser định tâm */}
          <div className="w-[2px] h-full bg-gradient-to-b from-amber-400 via-amber-300 to-amber-400 opacity-90 shadow-[0_0_12px_#fbbf24]" />

          {/* Mũi tên dưới */}
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[14px] border-b-amber-400 filter drop-shadow-[0_-2px_8px_rgba(251,191,36,0.8)]" />
        </div>

        {/* Gradient mờ 2 bên mép thanh roulette */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-zinc-950 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-zinc-950 to-transparent z-20 pointer-events-none" />

        {/* Khung chứa các thẻ item di chuyển */}
        <div
          ref={containerRef}
          className="relative w-full h-[180px] overflow-hidden rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-inner flex items-center"
        >
          <div
            className="flex items-center absolute left-0"
            style={{
              gap: `${CARD_GAP}px`,
              transform: `translate3d(${reelOffset}px, 0, 0)`,
              transition: isSpinning
                ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.8, 0.33, 1)`
                : 'none',
              willChange: 'transform',
            }}
          >
            {reelItems.map((item, idx) => {
              const itemTheme = RARITY_THEME[item.rarity] || RARITY_THEME.common;
              return (
                <div
                  key={`${item._id || item.id || idx}-${idx}`}
                  style={{ width: `${CARD_WIDTH}px` }}
                  className={`h-[156px] shrink-0 rounded-xl border ${itemTheme.border} ${itemTheme.bg} p-2.5 flex flex-col justify-between items-center relative overflow-hidden transition-all`}
                >
                  {/* Highlight theo độ hiếm */}
                  <div
                    className={`absolute inset-x-0 top-0 h-10 bg-gradient-to-b ${itemTheme.cardHighlight} pointer-events-none`}
                  />

                  {/* Độ hiếm badge nhỏ */}
                  <span
                    className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${itemTheme.badge}`}
                  >
                    {itemTheme.label}
                  </span>

                  {/* Icon */}
                  <div className="text-4xl my-auto filter drop-shadow hover:scale-110 transition-transform">
                    {item.icon || '🎁'}
                  </div>

                  {/* Tên item */}
                  <span className="text-[11px] font-bold text-center text-zinc-200 line-clamp-1 w-full px-1">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* REVEAL POPUP MODAL (KHI QUAY XONG) */}
      {showRevealModal && wonItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className={`relative max-w-md w-full rounded-3xl border-2 ${wonTheme.border} bg-zinc-950 p-6 sm:p-8 text-center text-white shadow-2xl ${wonTheme.glow} animate-in zoom-in-95 duration-300 overflow-hidden`}
          >
            {/* Background radiant aura */}
            <div
              className={`absolute inset-0 bg-gradient-to-b ${wonTheme.cardHighlight} opacity-40 pointer-events-none`}
            />

            {/* Sparkle banner */}
            <div className="relative z-10 mb-2">
              <span className="text-xs uppercase tracking-widest font-black text-amber-400">
                ✨ KẾT QUẢ MỞ HÒM ✨
              </span>
            </div>

            {/* Main Title */}
            <h2 className="relative z-10 text-xl sm:text-2xl font-black tracking-tight mb-4">
              Chúc mừng bạn đã mở được!
            </h2>

            {/* Item Showcase Card */}
            <div
              className={`relative z-10 my-4 mx-auto max-w-[260px] rounded-2xl border-2 ${wonTheme.border} ${wonTheme.bg} p-6 flex flex-col items-center shadow-lg relative overflow-hidden`}
            >
              {isNew && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-white shadow-xs">
                  MỚI!
                </div>
              )}

              <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-6xl shadow-inner mb-3">
                <span className="select-none filter drop-shadow-md animate-bounce">{wonItem.icon || '🎁'}</span>
              </div>

              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border mb-2 ${wonTheme.badge}`}
              >
                {wonTheme.label}
              </span>

              <h4 className="font-extrabold text-base text-white">{wonItem.name}</h4>

              <span className="text-[11px] text-zinc-400 mt-0.5 uppercase tracking-wide">
                {TYPE_LABELS[wonItem.type] || wonItem.type || 'Vật phẩm'}
              </span>

              <p className="text-xs text-zinc-300 mt-2 line-clamp-3 leading-relaxed">
                {wonItem.description}
              </p>

              <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-between text-xs text-zinc-300">
                <span>Giá trị quy đổi:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <span>🪙</span>
                  <span>+{wonItem.coinValue || 20} Xu</span>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="relative z-10 mt-6 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={onReset}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white transition cursor-pointer shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
              >
                <span>Mở tiếp hòm này</span>
                <span>📦</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRevealModal(false)}
                className="w-full sm:w-auto py-3 px-5 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
