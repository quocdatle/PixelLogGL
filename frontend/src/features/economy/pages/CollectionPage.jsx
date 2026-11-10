import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppNavbar from '../../../components/layout/AppNavbar';
import ItemGridCard from '../components/ItemGridCard';
import economyService from '../economyService';

const RARITY_OPTIONS = [
  { value: 'all', label: 'Tất cả độ hiếm' },
  { value: 'common', label: 'Phổ biến (Xám)' },
  { value: 'uncommon', label: 'Đặc biệt (Lục)' },
  { value: 'rare', label: 'Hiếm (Lam)' },
  { value: 'epic', label: 'Sử thi (Tím)' },
  { value: 'legendary', label: 'Thần thoại (Vàng)' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả chủng loại' },
  { value: 'weapon', label: 'Vũ khí' },
  { value: 'badge', label: 'Huy hiệu' },
  { value: 'avatar_frame', label: 'Khung Avatar' },
  { value: 'title', label: 'Danh hiệu' },
  { value: 'collectible', label: 'Vật phẩm sưu tầm' },
];

export default function CollectionPage() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sellingId, setSellingId] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [rarity, setRarity] = useState('all');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('recent');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCollection = useCallback(async (ignoreCheck = () => false) => {
    try {
      setLoading(true);
      const [invData, walletData] = await Promise.all([
        economyService.getInventory({ rarity, type, search: debouncedSearch, sort }),
        economyService.getWallet().catch(() => null),
      ]);

      if (!ignoreCheck()) {
        if (invData) {
          setItems(invData.items || []);
          setSummary(invData.summary || null);
        }
        if (walletData) {
          setWallet(walletData);
        }
      }
    } catch (err) {
      if (!ignoreCheck()) {
        console.error('Lỗi tải túi đồ:', err);
      }
    } finally {
      if (!ignoreCheck()) {
        setLoading(false);
      }
    }
  }, [rarity, type, debouncedSearch, sort]);

  useEffect(() => {
    let ignore = false;
    fetchCollection(() => ignore);
    return () => {
      ignore = true;
    };
  }, [fetchCollection]);

  // Bán vật phẩm
  const handleSell = async (inventoryId, quantity) => {
    try {
      setSellingId(inventoryId);
      const result = await economyService.sellItem(inventoryId, quantity);

      setAlertMsg({ type: 'success', text: result.message });
      setTimeout(() => setAlertMsg(null), 4000);

      // Cập nhật số dư ví và danh sách
      if (wallet) {
        setWallet((prev) => ({ ...prev, balance: result.remainingBalance }));
      }
      fetchCollection();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể bán vật phẩm';
      setAlertMsg({ type: 'error', text: msg });
      setTimeout(() => setAlertMsg(null), 4000);
    } finally {
      setSellingId(null);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-150">
      <div>
        <AppNavbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header & Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  to="/economy"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>←</span>
                  <span>Quay lại Mở Hòm</span>
                </Link>
                <span className="text-zinc-400">•</span>
                <span className="text-xs text-zinc-500">Kho đồ cá nhân</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
                <span>🎒</span> Bộ Sưu Tập & Kho Đồ
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Quản lý các danh hiệu, vũ khí và vật phẩm quý giá bạn đã mở được.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Wallet Pill */}
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <span className="text-lg">🪙</span>
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Số dư hiện có</div>
                  <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                    {wallet ? `${wallet.balance.toLocaleString()} Xu` : '...'}
                  </div>
                </div>
              </div>

              {/* Nút Đến trang mở hòm */}
              <Link
                to="/economy"
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-900/20"
              >
                <span>Mở thêm hòm</span>
                <span>🎁</span>
              </Link>
            </div>
          </div>

          {/* Toast Message */}
          {alertMsg && (
            <div
              className={`mb-6 p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2.5 animate-in fade-in duration-200 ${
                alertMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{alertMsg.text}</span>
            </div>
          )}

          {/* SUMMARY KPIS */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="text-xs font-semibold text-zinc-400">Tổng vật phẩm sở hữu</div>
                <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                  {summary.totalQuantity} <span className="text-xs font-normal text-zinc-400">món</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="text-xs font-semibold text-zinc-400">Đã mở khóa</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {summary.uniqueOwned} / {summary.totalCatalog}{' '}
                  <span className="text-xs font-normal text-zinc-400">loại</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="text-xs font-semibold text-zinc-400">Độ hoàn thành bộ sưu tập</div>
                <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
                  {summary.completionRate}%
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="text-xs font-semibold text-zinc-400">Tổng giá trị quy đổi</div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <span>🪙</span>
                  <span>{(summary.totalValue || 0).toLocaleString()} Xu</span>
                </div>
              </div>
            </div>
          )}

          {/* FILTERS & SEARCH */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 mb-8 shadow-xs flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <svg
                className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm vật phẩm theo tên hoặc mô tả..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Rarity filter */}
            <select
              value={rarity}
              onChange={(e) => setRarity(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {RARITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Type filter */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Sort order */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="recent">Mới nhận gần đây</option>
              <option value="rarityDesc">Độ hiếm & Giá trị cao nhất</option>
              <option value="nameAsc">Tên (A-Z)</option>
              <option value="quantityDesc">Số lượng nhiều nhất</option>
            </select>
          </div>

          {/* ITEM GRID DISPLAY */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="h-64 rounded-2xl bg-zinc-200/60 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-3xl flex items-center justify-center">
                📦
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                {search || rarity !== 'all' || type !== 'all'
                  ? 'Không tìm thấy vật phẩm phù hợp'
                  : 'Túi đồ của bạn hiện đang trống'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto mb-5">
                {search || rarity !== 'all' || type !== 'all'
                  ? 'Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.'
                  : 'Hãy ghé qua mục Mở Hòm để quay các rương báu và bắt đầu làm đầy bộ sưu tập của bạn!'}
              </p>
              {search || rarity !== 'all' || type !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setRarity('all');
                    setType('all');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              ) : (
                <Link
                  to="/economy"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
                >
                  <span>Đến phòng Mở Hòm ngay</span>
                  <span>🎲</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {items.map((entry) => (
                <ItemGridCard
                  key={entry.id || entry._id}
                  entry={entry}
                  onSell={handleSell}
                  isSelling={sellingId === (entry.id || entry._id)}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-xs text-zinc-500 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-900">
        PixelLog GL Minigame Engine © 2026. Bộ sưu tập và túi đồ game thủ.
      </footer>
    </div>
  );
}
