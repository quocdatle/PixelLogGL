import api from "../../services/api";

// Chuyển đổi dữ liệu từ Backend sang format chuẩn cho Frontend UI
function mapBackendToUi(entry) {
  if (!entry) return null;
  const game = entry.game || {};
  return {
    id: entry._id,
    userGameId: entry._id,
    rawgId: game.rawgId,
    title: game.name || "Không rõ tên",
    developer: (game.platforms && game.platforms[0]) || "Studio",
    genre: (game.genres && game.genres[0]) || "Game",
    genres: game.genres || [],
    releaseYear: game.released ? new Date(game.released).getFullYear() : "2024",
    status: entry.status || "backlog",
    rating: entry.rating ?? null,
    playtimeHours: entry.hoursPlayed || 0,
    coverUrl: game.backgroundImage || "",
    notes: entry.note || "",
    playSessions: entry.playSessions || [],
    updatedAt: entry.updatedAt,
  };
}

export const libraryService = {
  // Tìm kiếm game từ RAWG thông qua backend
  async searchGames(query, options = {}) {
    if (!query || !query.trim()) return [];
    const res = await api.get("/games/search", {
      params: {
        search: query.trim(),
        pageSize: options.pageSize || 10,
        ...options.params,
      },
      signal: options.signal,
    });
    return res.data?.data?.results || [];
  },

  // Lấy danh sách game của người dùng đăng nhập hiện tại từ Backend
  async getGames(params = {}) {
    const res = await api.get("/user-games", { params });
    const items = res.data?.data?.items || [];
    return items.map(mapBackendToUi);
  },

  // Lấy thống kê nhanh từ Backend
  async getSummary() {
    const res = await api.get("/user-games/summary");
    return res.data?.data;
  },

  // Cập nhật thông tin game (status, rating, playtimeHours, notes)
  async updateGame(id, updateData) {
    const payload = {};
    if (updateData.status !== undefined) payload.status = updateData.status;
    if (updateData.rating !== undefined) payload.rating = updateData.rating;
    if (updateData.hoursPlayed !== undefined) {
      payload.hoursPlayed = updateData.hoursPlayed;
    } else if (updateData.playtimeHours !== undefined) {
      payload.hoursPlayed = updateData.playtimeHours;
    }
    if (updateData.note !== undefined) {
      payload.note = updateData.note;
    } else if (updateData.notes !== undefined) {
      payload.note = updateData.notes;
    }

    const res = await api.patch(`/user-games/${id}`, payload);
    return mapBackendToUi(res.data?.data);
  },

  // Thêm nhanh giờ chơi qua endpoint play-sessions của Backend
  async addPlaytime(id, hours = 1) {
    const minutes = Math.round(hours * 60);
    const res = await api.post(`/user-games/${id}/play-sessions`, {
      minutes,
      note: `Chơi ${hours} giờ`,
    });
    return mapBackendToUi(res.data?.data);
  },

  // Thêm game vào thư viện
  // Chấp nhận: { rawgId, status } hoặc { title, status } (sẽ tự tìm kiếm trên RAWG)
  async addGame(gameData) {
    let rawgId = gameData.rawgId;
    if (!rawgId && gameData.title) {
      // Tìm kiếm trên RAWG qua endpoint backend
      const searchRes = await api.get("/games/search", {
        params: { search: gameData.title, pageSize: 1 },
      });
      const topGame = searchRes.data?.data?.results?.[0];
      if (!topGame) {
        throw new Error(`Không tìm thấy game "${gameData.title}" trên RAWG`);
      }
      rawgId = topGame.rawgId;
    }

    if (!rawgId) {
      throw new Error("Vui lòng cung cấp tên game hoặc rawgId");
    }

    const res = await api.post("/user-games", {
      rawgId: Number(rawgId),
      status: gameData.status || "backlog",
    });
    return mapBackendToUi(res.data?.data);
  },

  // Xóa game khỏi thư viện
  async removeGame(id) {
    const res = await api.delete(`/user-games/${id}`);
    return res.data;
  },
};

export default libraryService;
