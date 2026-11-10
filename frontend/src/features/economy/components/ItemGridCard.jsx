import { useState } from 'react';
import { RARITY_THEME, TYPE_LABELS } from '../economyConstants';

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

  const handleConfirmSell = () => {
    if (onSell) {
      onSell(entry.id || entry._id, sellCount);
      setIsConfirmingSell(false);
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border ${theme.border} ${theme.bg} ${theme.glow} p-4 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between overflow-hidden shadow-sm`}
    >
      {/* Top ambient highlight gradient */}
      <div
        className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${theme.cardHighlight} pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity`}
      />

      {/* Top Header: Rarity & Quantity */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${theme.badge}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {theme.label}
        </span>

        {quantity > 1 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm tracking-wide">
            x{quantity}
          </span>
        )}
      </div>

      {/* Item Icon Showcase */}
      <div className="relative z-10 py-4 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl bg-white/70 dark:bg-zinc-800/80 backdrop-blur-xs border border-zinc-200/60 dark:border-zinc-700/60 shadow-inner group-hover:scale-110 transition-transform duration-200">
          <span className="select-none filter drop-shadow">{item.icon || '🎁'}</span>
        </div>

        <span className="mt-2.5 text-[11px] uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500">
          {TYPE_LABELS[item.type] || item.type || 'Vật phẩm'}
        </span>
      </div>

      {/* Details */}
      <div className="relative z-10 text-center mt-1 mb-3">
        <h3
          className={`font-bold text-sm leading-snug line-clamp-1 text-zinc-900 dark:text-white group-hover:${theme.text} transition-colors`}
          title={item.name}
        >
          {item.name}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed min-h-[32px]">
          {item.description || 'Vật phẩm đặc quyền trong thế giới PixelLog.'}
        </p>
      </div>

      {/* Footer / Selling Action */}
      <div className="relative z-10 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 dark:text-zinc-500">Giá quy đổi:</span>
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
                className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Quy đổi Xu</span>
              </button>
            ) : (
              <div className="bg-zinc-100 dark:bg-zinc-800/90 rounded-xl p-2 text-xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-300">Bán:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max={quantity}
                      value={sellCount}
                      onChange={(e) =>
                        setSellCount(Math.min(quantity, Math.max(1, Number(e.target.value) || 1)))
                      }
                      className="w-12 text-center rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 py-0.5 text-xs font-bold"
                    />
                    <span className="text-zinc-400">/ {quantity}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleConfirmSell}
                    disabled={isSelling}
                    className="flex-1 py-1 rounded-lg text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-white transition cursor-pointer"
                  >
                    Bán (+{(item.coinValue || 20) * sellCount} Xu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingSell(false)}
                    className="px-2 py-1 rounded-lg text-[11px] bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
