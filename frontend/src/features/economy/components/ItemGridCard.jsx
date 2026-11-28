import { useState } from 'react';
import { RARITY_THEME, TYPE_LABELS } from '../economyConstants';
import { getItemImageUrl } from '../constants/itemImages';

export default function ItemGridCard({
  entry,
  onSell,
  isSelling = false,
  showActions = true,
}) {
  const [isConfirmingSell, setIsConfirmingSell] = useState(false);
  const [sellCount, setSellCount] = useState(1);

  const item = entry.item || entry;
  const quantity = entry.quantity || 1;
  const rarity = item.rarity || 'common';
  const theme = RARITY_THEME[rarity] || RARITY_THEME.common;
  const imgUrl = getItemImageUrl(item);

  const handleConfirmSell = () => {
    if (onSell) {
      onSell(entry.id || entry._id, sellCount);
      setIsConfirmingSell(false);
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border ${theme.border} bg-white dark:bg-zinc-900/95 p-4 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between overflow-hidden shadow-xs dark:shadow-md`}
    >
      {/* Top ambient highlight gradient */}
      <div
        className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${theme.cardHighlight} pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity`}
      />

      {/* Top Header: Game Name, Rarity & Quantity */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${theme.badge}`}
        >
          {theme.star && <span className="text-amber-500 dark:text-amber-400">{theme.star}</span>}
          {theme.label}
        </span>

        {quantity > 1 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs tracking-wide">
            x{quantity}
          </span>
        )}
      </div>

      {/* Item Image Showcase */}
      <div className="relative z-10 py-3 flex flex-col items-center justify-center">
        <div className="w-28 h-28 rounded-2xl flex items-center justify-center p-2 bg-zinc-100/80 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 shadow-inner group-hover:scale-105 transition-transform duration-200">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={item.name}
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] [image-rendering:pixelated]"
              loading="lazy"
            />
          ) : (
            <span className="text-5xl select-none filter drop-shadow">{item.icon || '🎁'}</span>
          )}
        </div>

        <span className="mt-2 text-[10px] uppercase tracking-widest font-black text-zinc-500 dark:text-zinc-400">
          {item.game || TYPE_LABELS[item.type] || 'Vật phẩm'}
        </span>
      </div>

      {/* Details */}
      <div className="relative z-10 text-center mt-1 mb-3">
        <h3
          className={`font-black text-sm leading-snug line-clamp-1 text-zinc-900 dark:text-white ${theme.groupHoverText} transition-colors`}
          title={item.name}
        >
          {item.name}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed min-h-[32px]">
          {item.description || 'Bảo vật danh giá trong thế giới PixelLog.'}
        </p>
      </div>

      {/* Footer / Selling Action */}
      <div className="relative z-10 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Giá quy đổi:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span>🪙</span>
            <span>+{item.coinValue || 20} Xu</span>
          </span>
        </div>

        {showActions && onSell && (
          <div>
            {!isConfirmingSell ? (
              <button
                type="button"
                onClick={() => setIsConfirmingSell(true)}
                disabled={isSelling}
                className="w-full py-1.5 px-3 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-zinc-700/60"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Quy đổi Xu</span>
              </button>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-800/90 rounded-xl p-2.5 text-xs flex flex-col gap-2 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Bán số lượng:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSellCount((c) => Math.max(1, c - 1))}
                      disabled={sellCount <= 1}
                      className="w-5 h-5 rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:opacity-40 text-zinc-900 dark:text-white flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-black text-amber-600 dark:text-amber-400 px-1">{sellCount}</span>
                    <button
                      type="button"
                      onClick={() => setSellCount((c) => Math.min(quantity, c + 1))}
                      disabled={sellCount >= quantity}
                      className="w-5 h-5 rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:opacity-40 text-zinc-900 dark:text-white flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleConfirmSell}
                    disabled={isSelling}
                    className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-[11px] transition-colors"
                  >
                    {isSelling ? '...' : `Nhận +${(item.coinValue || 20) * sellCount} Xu`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingSell(false)}
                    className="py-1 px-2 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 text-[11px]"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CS:GO Colored Bottom Bar */}
      <div className={`absolute inset-x-0 bottom-0 h-1.5 ${theme.barColor}`} />
    </div>
  );
}
