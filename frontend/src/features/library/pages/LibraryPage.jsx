import { useState, useEffect, useMemo } from "react";
import AppNavbar from "../../../components/layout/AppNavbar";
import LibraryKPIs from "../components/LibraryKPIs";
import LibraryFilters from "../components/LibraryFilters";
import GameCard from "../components/GameCard";
import LibraryItem from "../components/LibraryItem";
import QuickEditModal from "../components/QuickEditModal";
import libraryService from "../libraryService";

export default function LibraryPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [sortBy, setSortBy] = useState("playtimeDesc");
  const [viewMode, setViewMode] = useState("grid");
  const [editingGame, setEditingGame] = useState(null);

  useEffect(() => {
    loadGames();
  }, []);

  async function loadGames() {
    setLoading(true);
    try {
      const data = await libraryService.getGames();
      setGames(data);
    } catch (err) {
      console.error("Lỗi tải danh sách game:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickAddPlaytime(id) {
    try {
      const updated = await libraryService.addPlaytime(id, 1);
      if (updated) {
        setGames((prev) => prev.map((g) => (g.id === id ? updated : g)));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Không thể cập nhật giờ chơi");
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      const updated = await libraryService.updateGame(id, { status: newStatus });
      if (updated) {
        setGames((prev) => prev.map((g) => (g.id === id ? updated : g)));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Không thể thay đổi trạng thái");
    }
  }

  async function handleSaveEdit(id, updatedFields) {
    try {
      const updated = await libraryService.updateGame(id, updatedFields);
      if (updated) {
        setGames((prev) => prev.map((g) => (g.id === id ? updated : g)));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Không thể lưu cập nhật");
    }
  }

  async function handleAddSampleGame() {
    const title = window.prompt(
      "Nhập tên game muốn thêm vào thư viện (ví dụ: Elden Ring, Cyberpunk 2077, GTA V, Hades...):"
    );
    if (!title?.trim()) return;

    setLoading(true);
    try {
      const isRawgId = /^\d+$/.test(title.trim());
      const payload = isRawgId
        ? { rawgId: Number(title.trim()), status: "backlog" }
        : { title: title.trim(), status: "backlog" };
      const newGame = await libraryService.addGame(payload);
      if (newGame) {
        setGames((prev) => [newGame, ...prev]);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Thêm game thất bại");
    } finally {
      setLoading(false);
    }
  }

  // Filter & Sort calculation
  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        const matchesStatus =
          activeStatus === "all" || game.status === activeStatus;
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          game.title?.toLowerCase().includes(q) ||
          game.developer?.toLowerCase().includes(q) ||
          game.genre?.toLowerCase().includes(q);

        return matchesStatus && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === "playtimeDesc") {
          return (b.playtimeHours || 0) - (a.playtimeHours || 0);
        }
        if (sortBy === "ratingDesc") {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === "nameAsc") {
          return (a.title || "").localeCompare(b.title || "");
        }
        return 0; // recent
      });
  }, [games, searchQuery, activeStatus, sortBy]);

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-150">
      {/* Top Application Navbar */}
      <div>
        <AppNavbar />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Title & CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Thư viện game cá nhân
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Quản lý kho game, tiến độ hoàn thành và thời gian trải nghiệm.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSampleGame}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold text-sm cursor-pointer transition-colors duration-150"
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
                  strokeWidth="2.5"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Thêm game vào kho</span>
            </button>
          </div>

          {/* Quick Statistics (KPIs) */}
          <LibraryKPIs games={games} />

          {/* Filter & View Mode Controls */}
          <LibraryFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Content View Area */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl bg-zinc-200/60 dark:bg-zinc-900 h-64 border border-zinc-200 dark:border-zinc-800"
                />
              ))}
            </div>
          ) : filteredGames.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                Không tìm thấy tựa game nào
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
                {searchQuery
                  ? `Không có game nào khớp với từ khóa "${searchQuery}".`
                  : "Danh mục này hiện chưa có tựa game nào trong thư viện."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveStatus("all");
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors duration-150"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onEdit={setEditingGame}
                  onQuickAddPlaytime={handleQuickAddPlaytime}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            /* List / Table View */
            <div className="space-y-2">
              {filteredGames.map((game) => (
                <LibraryItem
                  key={game.id}
                  game={game}
                  onEdit={setEditingGame}
                  onQuickAddPlaytime={handleQuickAddPlaytime}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        PixelLog GL © 2026. Nền tảng quản lý game và trợ lý AI thông minh.
      </footer>

      {/* Quick Edit Modal */}
      <QuickEditModal
        game={editingGame}
        isOpen={!!editingGame}
        onClose={() => setEditingGame(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
