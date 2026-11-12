import { useState, useEffect, useMemo } from 'react';
import { RARITY_THEME, TYPE_LABELS } from '../economyConstants';

const RARITY_ORDER = ['legendary', 'epic', 'rare', 'uncommon', 'common'];

function formatDropChance(pct) {
  if (typeof pct !== 'number' || Number.isNaN(pct)) return '0%';
  if (pct >= 1) return `${Number(pct.toFixed(2))}%`;
  return `${Number(pct.toFixed(3))}%`;
}

export default function CasePoolModal({
  caseInfo,
  isOpen,
  onClose,
  onOpenCase,
  onBuyKey,
  keyCount = 0,
  canOpen = false,
  canBuyKey = false,
  isBuyingKey = false,
  isOpening = false,
}) {
  const [selectedRarity, setSelectedRarity] = useState('all');

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const pool = useMemo(() => {
    if (!caseInfo) return [];
    if (Array.isArray(caseInfo.pool) && caseInfo.pool.length > 0) {
      return caseInfo.pool;
    }
    return caseInfo.poolPreview || [];
  }, [caseInfo]);

  const raritySummary = useMemo(() => {
    const counts = {};
    pool.forEach((item) => {
      counts[item.rarity] = (counts[item.rarity] || 0) + 1;
    });
    return RARITY_ORDER.filter(
      (r) => (caseInfo?.chances?.[r] || 0) > 0 || (counts[r] || 0) > 0
    ).map((r) => ({
      key: r,
      label: RARITY_THEME[r]?.label || r,
      chanceDisplay: caseInfo?.displayChances?.[r] || `${((caseInfo?.chances?.[r] || 0) * 100).toFixed(1)}%`,
      count: counts[r] || 0,
    }));
  }, [pool, caseInfo]);

  const filteredItems = useMemo(() => {
    if (selectedRarity === 'all') return pool;
    return pool.filter((item) => item.rarity === selectedRarity);
  }, [pool, selectedRarity]);

  if (!isOpen || !caseInfo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-pool-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[88vh] rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/90 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-3xl shrink-0">
              <span aria-hidden="true">{caseInfo.icon}</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="case-pool-title"
                  className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white truncate"
                >
                  Vật phẩm trong {caseInfo.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 tabular-nums">
                  {caseInfo.cost} Xu / lượt
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Tổng cộng {pool.length} vật phẩm có thể mở ra • Tỷ lệ hiển thị chính xác theo từng món
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ vật phẩm"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Rarity Filter Chips */}
        <div className="px-4 sm:px-6 py-3 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedRarity('all')}
            aria-pressed={selectedRarity === 'all'}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              selectedRarity === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Tất cả ({pool.length})
          </button>

          {raritySummary.map((tier) => {
            const theme = RARITY_THEME[tier.key] || RARITY_THEME.common;
            const active = selectedRarity === tier.key;
            return (
              <button
                key={tier.key}
                type="button"
                onClick={() => setSelectedRarity(tier.key)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  active
                    ? `${theme.badge} ring-2 ring-offset-1 ring-emerald-500 dark:ring-offset-zinc-900`
                    : 'bg-zinc-50 dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{tier.label}</span>{' '}
                <span className="tabular-nums opacity-85">
                  ({tier.chanceDisplay} • {tier.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Pool Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredItems.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Không có vật phẩm nào thuộc bậc độ hiếm này trong rương.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredItems.map((item) => {
                const theme = RARITY_THEME[item.rarity] || RARITY_THEME.common;
                const typeLabel = TYPE_LABELS[item.type] || 'Vật phẩm';

                return (
                  <div
                    key={item._id || item.name}
                    className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 ${theme.bg} ${theme.border}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="w-11 h-11 rounded-xl bg-white/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-2xl shrink-0">
                          <span aria-hidden="true">{item.icon || '🎁'}</span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${theme.badge}`}
                          >
                            {theme.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 tabular-nums">
                            Tỷ lệ: {formatDropChance(item.exactChancePct)}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-500 dark:text-zinc-400">
                        {typeLabel}
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                        Giá trị: {item.coinValue} Xu
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Tỷ lệ từng món = (Tỷ lệ bậc độ hiếm) × (Trọng số rơi nội bộ)
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-200/70 hover:bg-zinc-300/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer transition-colors"
            >
              Đóng
            </button>
            {onBuyKey && (
              <button
                type="button"
                disabled={!canBuyKey || isBuyingKey}
                onClick={() => onBuyKey(caseInfo.id, 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <span>{caseInfo.keyIcon || '🔑'}</span>
                <span>
                  {isBuyingKey ? 'Đang mua...' : `+1 Chìa (${caseInfo.cost} Xu)`}
                </span>
              </button>
            )}
            {onOpenCase && (
              <button
                type="button"
                disabled={!canOpen || isOpening}
                onClick={() => {
                  onClose();
                  onOpenCase(caseInfo.id);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canOpen
                  ? `Mở ngay (-1 ${caseInfo.keyIcon || '🔑'} • còn ${keyCount})`
                  : `Cần ${caseInfo.keyName || 'Chìa khóa'}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
