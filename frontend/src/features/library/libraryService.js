import api from "../../services/api";

const INITIAL_GAMES = [
  {
    id: "g1",
    title: "Elden Ring",
    developer: "FromSoftware",
    genre: "Action RPG",
    releaseYear: 2022,
    status: "playing",
    rating: 9.5,
    playtimeHours: 84,
    coverUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
    notes: "Đang khám phá vùng đất bóng tối Shadow of the Erdtree.",
  },
  {
    id: "g2",
    title: "Cyberpunk 2077",
    developer: "CD PROJEKT RED",
    genre: "Open World RPG",
    releaseYear: 2020,
    status: "completed",
    rating: 9.0,
    playtimeHours: 112,
    coverUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
    notes: "Đã hoàn thành cốt truyện chính và bản mở rộng Phantom Liberty.",
  },
  {
    id: "g3",
    title: "Hollow Knight",
    developer: "Team Cherry",
    genre: "Metroidvania",
    releaseYear: 2017,
    status: "backlog",
    rating: 9.8,
    playtimeHours: 16,
    coverUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg",
    notes: "AI gợi ý dựa trên sở thích thể loại souls-like và phiêu lưu.",
  },
  {
    id: "g4",
    title: "Hades II",
    developer: "Supergiant Games",
    genre: "Roguelike Action",
    releaseYear: 2024,
    status: "playing",
    rating: 9.3,
    playtimeHours: 35,
    coverUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/header.jpg",
    notes: "Hệ thống combat mượt mà, nhân vật Melinoe cuốn hút.",
  },
  {
    id: "g5",
    title: "Baldur's Gate 3",
    developer: "Larian Studios",
    genre: "CRPG",
    releaseYear: 2023,
    status: "completed",
    rating: 9.9,
    playtimeHours: 145,
    coverUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
    notes: "Game of the Year hoàn hảo về cốt truyện và tính tự do.",
  },
  {
    id: "g6",
    title: "Black Myth: Wukong",
    developer: "Game Science",
    genre: "Action RPG",
    releaseYear: 2024,
    status: "playing",
    rating: 9.1,
    playtimeHours: 42,
    coverUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg",
    notes: "Đồ họa đỉnh cao, cơ chế biến hình linh hoạt.",
  },
  {
    id: "g7",
    title: "The Witcher 3: Wild Hunt",
    developer: "CD PROJEKT RED",
    genre: "Open World RPG",
    releaseYear: 2015,
    status: "completed",
    rating: 9.7,
    playtimeHours: 178,
    coverUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg",
    notes: "Một trong những tựa game cốt truyện hay nhất từng trải nghiệm.",
  },
  {
    id: "g8",
    title: "Persona 5 Royal",
    developer: "ATLUS",
    genre: "JRPG",
    releaseYear: 2020,
    status: "wishlist",
    rating: 9.4,
    playtimeHours: 0,
    coverUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1687950/header.jpg",
    notes: "Kế hoạch chơi vào kỳ nghỉ tới.",
  },
];

const STORAGE_KEY = "pixellog_user_library_v2";

function getLocalGames() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GAMES));
    return INITIAL_GAMES;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_GAMES;
  }
}

function saveLocalGames(games) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export const libraryService = {
  // Lấy danh sách game
  async getGames() {
    try {
      const res = await api.get("/user-games");
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
    } catch {
      // Fallback về local demo data
    }
    return getLocalGames();
  },

  // Cập nhật thông tin game (giờ chơi, status, rating, note)
  async updateGame(id, updateData) {
    try {
      await api.patch(`/user-games/${id}`, updateData);
    } catch {
      // Fallback update
    }
    const current = getLocalGames();
    const updated = current.map((g) =>
      g.id === id ? { ...g, ...updateData } : g
    );
    saveLocalGames(updated);
    return updated.find((g) => g.id === id);
  },

  // Thêm nhanh 1 giờ chơi
  async addPlaytime(id, hours = 1) {
    const current = getLocalGames();
    const target = current.find((g) => g.id === id);
    if (!target) return null;
    const newHours = (target.playtimeHours || 0) + hours;
    return this.updateGame(id, { playtimeHours: newHours });
  },

  // Thêm game mới vào thư viện
  async addGame(gameData) {
    try {
      const res = await api.post("/user-games", gameData);
      if (res.data?.success) return res.data.data;
    } catch {
      // Fallback
    }
    const current = getLocalGames();
    const newGame = {
      id: "g" + Date.now(),
      status: "backlog",
      playtimeHours: 0,
      rating: 8.0,
      ...gameData,
    };
    const updated = [newGame, ...current];
    saveLocalGames(updated);
    return newGame;
  },
};

export default libraryService;
