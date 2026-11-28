import { useState, useEffect, useMemo } from 'react';
import { RARITY_THEME, TYPE_LABELS } from '../economyConstants';
import { getItemImageUrl } from '../constants/itemImages';

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
      star: RARITY_THEME[r]?.star || '',
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-pool-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col text-zinc-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header CS:GO Style */}
        <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              <span aria-hidden="true">{caseInfo.icon || '📦'}</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  CONTAINER SERIES
                </span>
                <h2
                  id="case-pool-title"
                  className="text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white truncate"
                >
                  {caseInfo.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 tabular-nums">
                  {caseInfo.cost} Xu / lượt
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Gồm {pool.length} vật phẩm kinh điển từ các tựa game nổi tiếng • Tỷ lệ minh bạch 100%
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ vật phẩm"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Rarity Filter Chips CS:GO */}
        <div className="px-4 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/95 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedRarity('all')}
            aria-pressed={selectedRarity === 'all'}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none ${
              selectedRarity === 'all'
                ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none flex items-center gap-1.5 ${
                  active
                    ? `${theme.badge} ring-2 ring-amber-400/50 shadow-md`
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-850'
                }`}
              >
                {theme.star && <span className="text-amber-500 dark:text-amber-400">{theme.star}</span>}
                <span>{tier.label}</span>
                <span className="tabular-nums text-[11px] opacity-75">
                  ({tier.chanceDisplay} • {tier.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Pool Items Grid CS:GO Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-50/50 dark:bg-zinc-950/80">
          {filteredItems.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Không có vật phẩm nào thuộc phẩm cấp này trong rương.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredItems.map((item) => {
                const theme = RARITY_THEME[item.rarity] || RARITY_THEME.common;
                const typeLabel = TYPE_LABELS[item.type] || 'Vũ khí';
                const imgUrl = getItemImageUrl(item);

                return (
                  <div
                    key={item._id || item.name}
                    className={`group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-gradient-to-b dark:from-zinc-900/90 dark:to-zinc-950 p-3 flex flex-col justify-between overflow-hidden shadow-xs dark:shadow-md hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-150 hover:-translate-y-0.5`}
                  >
                    {/* Top Rarity Highlight */}
                    <div
                      className={`absolute inset-x-0 top-0 h-12 bg-gradient-to-b ${theme.cardHighlight} pointer-events-none opacity-60`}
                    />

                    {/* Game badge & Chance */}
                    <div className="relative z-10 flex items-center justify-between gap-1 mb-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate max-w-[85px]">
                        {item.game || 'PIXEL'}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 tabular-nums">
                        {formatDropChance(item.exactChancePct)}
                      </span>
                    </div>

                    {/* Weapon Image Preview */}
                    <div className="relative z-10 w-full h-28 my-1 flex items-center justify-center p-1">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.name}
                          className="h-full w-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] [image-rendering:pixelated] group-hover:scale-110 transition-transform duration-200"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-4xl select-none filter drop-shadow">
                          {item.icon || '🎁'}
                        </span>
                      )}
                    </div>

                    {/* Name & Type */}
                    <div className="relative z-10 mt-2 text-center">
                      <h3
                        className="text-xs font-black text-zinc-900 dark:text-white truncate w-full"
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.text}`}>
                          {theme.label}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-600">•</span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          {item.coinValue} Xu
                        </span>
                      </div>
                    </div>

                    {/* CS:GO Colored Bottom Bar */}
                    <div className={`absolute inset-x-0 bottom-0 h-1.5 ${theme.barColor}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Tỷ lệ rơi được tính toán theo thuật toán RNG an toàn phía máy chủ.
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              Đóng
            </button>
            {onBuyKey && (
              <button
                type="button"
                disabled={!canBuyKey || isBuyingKey}
                onClick={() => onBuyKey(caseInfo.id, 1)}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-zinc-950 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-amber-500/20"
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
                className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20"
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
