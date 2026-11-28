import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RARITY_THEME, TYPE_LABELS } from '../economyConstants';
import { getItemImageUrl } from '../constants/itemImages';

const CARD_WIDTH = 180; // Chiều rộng mỗi thẻ item trong thanh cuộn
const CARD_GAP = 12; // Khoảng cách giữa các thẻ
const TOTAL_CARD_STEP = CARD_WIDTH + CARD_GAP; // 192px
const SPIN_DURATION_MS = 5600; // Thời gian quay 5.6s chuẩn CS:GO

// Âm thanh click cơ học giòn tan chuẩn CS:GO roulette bằng Web Audio API
function playCsgoTick(ctx) {
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Click cơ học với tần số đanh và decay cực nhanh
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.035);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  } catch {
    // Trình duyệt chặn autoplay thì bỏ qua an toàn
  }
}

// Âm thanh chúc mừng hoành tráng khi trúng thưởng
function playWinFanfare(ctx, rarity) {
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const t = ctx.currentTime;

    // Bass thình đập mạnh
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(45, t + 0.4);
    subGain.gain.setValueAtTime(0.35, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.5);

    // Chuông vang ngân cho cấp độ cao
    const freqs = rarity === 'legendary' ? [523.25, 659.25, 783.99, 1046.50] : [440, 554.37, 659.25];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      gain.gain.setValueAtTime(0.15, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.85);
    });
  } catch {
    // Ignored
  }
}

export default function CaseAnimation({
  caseInfo,
  reelItems = [],
  targetIndex = 36,
  wonItem,
  isNew = false,
  remainingKeys = 0,
  onFinish,
  onReset,
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelOffset, setReelOffset] = useState(0);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const containerRef = useRef(null);
  const tickIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Bắt đầu vòng quay roulette khi component được mount
  useEffect(() => {
    if (!reelItems || reelItems.length === 0) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      try {
        audioCtxRef.current = new AudioCtx();
      } catch {
        audioCtxRef.current = null;
      }
    }

    // Tính toán vị trí dừng chính xác: căn giữa mục targetIndex vào giữa vạch laser
    const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 760;
    const centerPoint = containerWidth / 2;

    // Vị trí tâm của thẻ trúng thưởng
    const targetItemCenter = targetIndex * TOTAL_CARD_STEP + CARD_WIDTH / 2;

    // Jitter nhẹ ngẫu nhiên (-35px đến +35px) để mũi tên không dừng cố định một vị trí
    const jitter = (Math.random() - 0.5) * 70;
    const finalOffset = -(targetItemCenter - centerPoint + jitter);

    // Kích hoạt animation sau một frame
    const timerStart = setTimeout(() => {
      setIsSpinning(true);
      setReelOffset(finalOffset);

      // Mô phỏng tiếng tick chậm dần theo đường cong hãm phanh CS:GO
      const startTime = Date.now();
      let lastTick = startTime;

      const runTicks = () => {
        const now = Date.now();
        const elapsed = now - startTime;

        if (elapsed < SPIN_DURATION_MS - 250) {
          // Tính tốc độ hiện tại dựa trên tiến trình
          const progress = elapsed / SPIN_DURATION_MS;
          // Tốc độ tick giãn dần từ 35ms ở đầu đến 380ms ở cuối
          const currentInterval = Math.max(35, Math.pow(progress, 2.8) * 380 + 35);

          if (now - lastTick >= currentInterval) {
            playCsgoTick(audioCtxRef.current);
            lastTick = now;
          }

          tickIntervalRef.current = setTimeout(runTicks, 15);
        }
      };
      runTicks();
    }, 80);

    // Khi dừng vòng quay
    const timerEnd = setTimeout(() => {
      setIsSpinning(false);
      clearTimeout(tickIntervalRef.current);

      if (audioCtxRef.current && wonItem) {
        playWinFanfare(audioCtxRef.current, wonItem.rarity);
      }

      // Trì hoãn 500ms để người chơi kịp nhìn thấy thẻ dưới vạch laser trước khi mở popup
      setTimeout(() => {
        setShowRevealModal(true);
        if (onFinish) onFinish();
      }, 550);
    }, SPIN_DURATION_MS + 100);

    return () => {
      clearTimeout(timerStart);
      clearTimeout(timerEnd);
      clearTimeout(tickIntervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [reelItems, targetIndex, onFinish, wonItem]);

  const handleSkip = () => {
    clearTimeout(tickIntervalRef.current);
    setIsSpinning(false);
    setShowRevealModal(true);
    if (audioCtxRef.current && wonItem) {
      playWinFanfare(audioCtxRef.current, wonItem.rarity);
    }
    if (onFinish) onFinish();
  };

  const wonRarity = wonItem?.rarity || 'common';
  const wonTheme = RARITY_THEME[wonRarity] || RARITY_THEME.common;
  const wonImageUrl = getItemImageUrl(wonItem);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 p-4 sm:p-7 shadow-2xl">
      {/* Background CS:GO tactical dark texture (only active in dark) */}
      <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-zinc-800/20 dark:via-zinc-950 dark:to-zinc-950 pointer-events-none" />

      {/* Header bar CS:GO container header */}
      <div className="relative z-10 flex items-center justify-between pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center text-3xl shadow-inner">
            {caseInfo?.icon || '📦'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                CONTAINER
              </span>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                {caseInfo?.name || 'Rương vật phẩm'}
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Đang quay roulette... Chúc bạn mở ra bảo vật <span className="text-amber-600 dark:text-amber-400 font-bold">Thần Thoại ★</span>!
            </p>
          </div>
        </div>

        {/* Nút bỏ qua animation nếu muốn xem kết quả ngay */}
        {!showRevealModal && (
          <button
            type="button"
            onClick={handleSkip}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>Bỏ qua</span>
            <span>⏩</span>
          </button>
        )}
      </div>

      {/* Main Roulette Box CS:GO Style */}
      <div className="relative w-full py-4 select-none">
        {/* Vạch định tâm laser vàng kim chính giữa (Center Needle) */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center justify-between">
          {/* Mũi tên trên */}
          <div className="w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-t-[18px] border-t-amber-400 filter drop-shadow-[0_2px_10px_rgba(251,191,36,0.9)]" />

          {/* Tia laser định tâm */}
          <div className="w-[3px] h-full bg-gradient-to-b from-amber-400 via-yellow-200 to-amber-400 shadow-[0_0_14px_#fbbf24,0_0_28px_#f59e0b]" />

          {/* Mũi tên dưới */}
          <div className="w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-b-[18px] border-b-amber-400 filter drop-shadow-[0_-2px_10px_rgba(251,191,36,0.9)]" />
        </div>

        {/* Gradient mờ 2 bên mép thanh roulette */}
        <div className="absolute inset-y-0 left-0 w-20 sm:w-36 bg-gradient-to-r from-zinc-100 via-zinc-100/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/90 z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 sm:w-36 bg-gradient-to-l from-zinc-100 via-zinc-100/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/90 z-20 pointer-events-none" />

        {/* Khung chứa các thẻ item cuộn ngang */}
        <div
          ref={containerRef}
          className="relative w-full h-[225px] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 shadow-[inset_0_4px_15px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_4px_25px_rgba(0,0,0,0.8)] flex items-center"
        >
          <div
            className="flex items-center absolute left-0"
            style={{
              gap: `${CARD_GAP}px`,
              transform: `translate3d(${reelOffset}px, 0, 0)`,
              transition: isSpinning
                ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.08, 0.82, 0.17, 1)`
                : 'none',
              willChange: 'transform',
            }}
          >
            {reelItems.map((item, idx) => {
              const itemTheme = RARITY_THEME[item.rarity] || RARITY_THEME.common;
              const imgUrl = getItemImageUrl(item);
              const isTargetCard = idx === targetIndex;

              return (
                <div
                  key={`${item._id || item.id || idx}-${idx}`}
                  style={{ width: `${CARD_WIDTH}px` }}
                  className={`h-[205px] shrink-0 rounded-xl border ${
                    isTargetCard && !isSpinning
                      ? 'border-amber-400 shadow-xl shadow-amber-400/25 ring-2 ring-amber-400/50'
                      : 'border-zinc-200 dark:border-zinc-800/90'
                  } bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900/95 dark:to-zinc-950 p-2.5 flex flex-col justify-between items-center relative overflow-hidden transition-all shadow-xs`}
                >
                  {/* Highlight theo độ hiếm phía trên */}
                  <div
                    className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${itemTheme.cardHighlight} pointer-events-none opacity-80`}
                  />

                  {/* Header thẻ: Tên Game & Star nếu là Thần Thoại */}
                  <div className="relative z-10 w-full flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]">
                      {item.game || 'PIXEL'}
                    </span>
                    {item.rarity === 'legendary' && (
                      <span className="text-amber-500 dark:text-amber-400 text-xs font-black animate-pulse">★</span>
                    )}
                  </div>

                  {/* Ảnh PNG vật phẩm phóng to rõ nét */}
                  <div className="relative z-10 my-auto w-full h-32 flex items-center justify-center p-1">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.name}
                        className="h-full w-full object-contain filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.85)] [image-rendering:pixelated] select-none pointer-events-none transition-transform hover:scale-105"
                        loading="eager"
                      />
                    ) : (
                      <span className="text-5xl select-none filter drop-shadow-md">{item.icon || '🎁'}</span>
                    )}
                  </div>

                  {/* Tên vật phẩm & cấp bậc */}
                  <div className="relative z-10 w-full text-center px-1">
                    <div
                      className="text-xs font-black text-zinc-900 dark:text-white truncate w-full"
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 truncate ${itemTheme.text}`}>
                      {itemTheme.label}
                    </div>
                  </div>

                  {/* CS:GO Colored Bottom Bar */}
                  <div className={`absolute inset-x-0 bottom-0 h-1.5 ${itemTheme.barColor}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* REVEAL POPUP MODAL (KHI QUAY XONG - CHUẨN CS:GO UNBOXED POPUP) */}
      {showRevealModal && wonItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className={`relative max-w-lg w-full rounded-3xl border-2 ${wonTheme.border} bg-white dark:bg-zinc-950 p-6 sm:p-8 text-center text-zinc-900 dark:text-white shadow-2xl ${wonTheme.glow} animate-in zoom-in-95 duration-300 overflow-hidden`}
          >
            {/* Background radiant aura tỏa sáng theo phẩm cấp */}
            <div
              className={`absolute inset-0 bg-gradient-to-b ${wonTheme.cardHighlight} opacity-50 pointer-events-none`}
            />

            {/* Tia sáng tỏa tròn phía sau vũ khí */}
            <div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: wonTheme.hex || '#fbbf24' }}
            />

            {/* Sparkle banner CS:GO */}
            <div className="relative z-10 mb-2">
              <span className="text-xs uppercase tracking-widest font-black text-amber-500 dark:text-amber-400 flex items-center justify-center gap-1.5">
                <span>★</span>
                <span>CHÚC MỪNG BẠN ĐÃ MỞ ĐƯỢC</span>
                <span>★</span>
              </span>
            </div>

            {/* Item Showcase Card */}
            <div
              className={`relative z-10 my-4 mx-auto w-full max-w-[340px] rounded-2xl border-2 ${wonTheme.border} bg-zinc-50 dark:bg-zinc-900/90 p-6 flex flex-col items-center shadow-lg dark:shadow-2xl relative overflow-hidden`}
            >
              {/* CS:GO Colored Top & Bottom Bar */}
              <div className={`absolute inset-x-0 top-0 h-1.5 ${wonTheme.barColor}`} />
              <div className={`absolute inset-x-0 bottom-0 h-1.5 ${wonTheme.barColor}`} />

              {/* Tag Mới */}
              {isNew && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-white shadow-md">
                  MỚI!
                </div>
              )}

              {/* Tag Nguồn Game */}
              <div className="text-[11px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
                {wonItem.game || 'PixelLog Universe'}
              </div>

              {/* Item Image Showcase */}
              <div className="w-full h-48 flex items-center justify-center my-3 relative p-2">
                {wonImageUrl ? (
                  <img
                    src={wonImageUrl}
                    alt={wonItem.name}
                    className="max-h-48 max-w-full w-auto h-full object-contain filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.9)] [image-rendering:pixelated] animate-in zoom-in-75 duration-300"
                  />
                ) : (
                  <span className="text-7xl select-none filter drop-shadow animate-bounce">
                    {wonItem.icon || '🎁'}
                  </span>
                )}
              </div>

              {/* Rarity Badge CS:GO */}
              <div className="mt-3">
                <span
                  className={`inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${wonTheme.badge}`}
                >
                  {wonTheme.star ? `${wonTheme.star} ` : ''}
                  {wonTheme.csgoGrade || wonTheme.label}
                </span>
              </div>

              {/* Tên vật phẩm */}
              <h3 className="font-black text-xl text-zinc-900 dark:text-white mt-2 tracking-tight">
                {wonItem.name}
              </h3>

              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 uppercase tracking-wide">
                {TYPE_LABELS[wonItem.type] || wonItem.type || 'Vũ khí'}
              </span>

              {/* Mô tả vật phẩm */}
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2.5 px-2 line-clamp-3 leading-relaxed">
                {wonItem.description}
              </p>

              {/* Giá trị quy đổi Xu */}
              <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 w-full flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
                <span>Giá trị quy đổi:</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-sm">
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
                disabled={remainingKeys < 1}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl text-sm font-black uppercase tracking-wide bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-950 transition cursor-pointer shadow-lg shadow-amber-500/20 disabled:shadow-none flex items-center justify-center gap-2"
              >
                <span>
                  {remainingKeys >= 1
                    ? `Mở tiếp (còn ${remainingKeys} ${caseInfo?.keyIcon || '🔑'})`
                    : `Hết ${caseInfo?.keyName || 'chìa khóa'}`}
                </span>
                <span>{remainingKeys >= 1 ? '📦' : '🔒'}</span>
              </button>

              <Link
                to="/economy/collection"
                className="w-full sm:w-auto py-3 px-5 rounded-xl text-sm font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-zinc-700"
              >
                <span>🎒</span>
                <span>Xem kho đồ</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowRevealModal(false)}
                className="w-full sm:w-auto py-3 px-4 rounded-xl text-sm font-semibold bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer border border-zinc-300 dark:border-zinc-800"
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
