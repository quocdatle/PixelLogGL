# API Documentation


## Base URL

```
http://localhost:5000/api
```

## Format Response chung

Mọi endpoint đều trả về theo 1 trong 2 dạng sau:

**Thành công:**
```json
{ "success": true, "data": { ... } }
```

**Lỗi:**
```json
{ "success": false, "message": "Mô tả lỗi", "code": "ERROR_CODE" }
```

## Xác thực (Authentication)

Các endpoint cần đăng nhập phải gửi kèm header:

```
Authorization: Bearer <token>
```

`<token>` lấy từ response của `/auth/register` hoặc `/auth/login`.

---

## Module: Auth

### Đăng ký tài khoản
```
POST /api/auth/register
```

**Body:**
```json
{
  "username": "test",
  "email": "test@test.com",
  "password": "123456"
}
```

**Response 201 (thành công):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "650f1a2b3c4d5e6f7890abcd",
      "username": "test",
      "email": "test@test.com",
      "avatarUrl": null
    }
  }
}
```

**Lỗi có thể gặp:**
| Status | code | Trường hợp |
|---|---|---|
| 400 | `MISSING_FIELDS` | Thiếu `username`/`email`/`password` |
| 409 | `ALREADY_EXISTS` | Email hoặc username đã tồn tại |

---

### Đăng nhập
```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "test@test.com",
  "password": "123456"
}
```

**Response 200 (thành công):** giống hệt format của `/auth/register`.

**Lỗi có thể gặp:**
| Status | code | Trường hợp |
|---|---|---|
| 400 | `MISSING_FIELDS` | Thiếu `email`/`password` |
| 401 | `INVALID_CREDENTIALS` | Sai email hoặc mật khẩu |

---

## Module: Users

> Tất cả endpoint dưới đây **bắt buộc** header `Authorization: Bearer <token>`.

### Xem hồ sơ cá nhân
```
GET /api/users/me
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "650f1a2b3c4d5e6f7890abcd",
    "username": "test",
    "email": "test@test.com",
    "avatarUrl": null
  }
}
```

**Lỗi có thể gặp:**
| Status | code | Trường hợp |
|---|---|---|
| 401 | `NO_TOKEN` | Không gửi header Authorization |
| 401 | `INVALID_TOKEN` | Token sai hoặc hết hạn |

---

### Cập nhật hồ sơ (avatar)
```
PATCH /api/users/me
```

**Body:**
```json
{ "avatarUrl": "https://example.com/avatar.png" }
```

**Response 200:** trả về user object đã cập nhật, giống `/users/me`.

---

### Đổi mật khẩu
```
PATCH /api/users/me/password
```

**Body:**
```json
{
  "oldPassword": "123456",
  "newPassword": "matkhaumoi789"
}
```

**Response 200:**
```json
{ "success": true, "data": { "message": "Đổi mật khẩu thành công" } }
```

**Lỗi có thể gặp:**
| Status | code | Trường hợp |
|---|---|---|
| 400 | `MISSING_FIELDS` | Thiếu `oldPassword`/`newPassword` |
| 400 | `WRONG_PASSWORD` | Mật khẩu cũ không đúng |

---

## Health check (không cần auth)

```
GET /api/health
```

Dùng để kiểm tra server có chạy không — trả `{ "success": true, "message": "Server đang chạy OK" }`.

---

## Module: Analytics

> Tất cả endpoint dưới đây **bắt buộc** header `Authorization: Bearer <token>`. Dữ liệu luôn là của người dùng đang đăng nhập.

**Lỗi chung của module (ngoài các mã lỗi dùng chung ở cuối file):**
| Status | code | Trường hợp |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Tham số query không hợp lệ (`range`, `sortBy`) |
| 401 | `NO_TOKEN` | Không gửi header Authorization |
| 401 | `INVALID_TOKEN` | Token sai hoặc hết hạn |

---

### Tổng quan thư viện
```
GET /api/analytics/overview
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalGames": 24,
    "totalHours": 312.5,
    "avgRating": 8.3,
    "byStatus": { "backlog": 8, "playing": 3, "completed": 10, "dropped": 2, "wishlist": 1 }
  }
}
```

- `totalHours` lấy từ `hoursPlayed` của từng game (cùng nguồn với `/user-games/summary`).
- `avgRating` là `null` nếu chưa có game nào được chấm điểm.
- `byStatus` luôn đủ 5 trạng thái, giá trị 0 nếu chưa có.

---

### Phân bổ thể loại
```
GET /api/analytics/genres?sortBy=games
```

| Query | Mặc định | Giá trị |
|---|---|---|
| `sortBy` | `games` | `games` (theo số game) hoặc `hours` (theo giờ chơi) |

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "genre": "Action", "games": 9, "hours": 120.5 },
    { "genre": "RPG", "games": 6, "hours": 98 },
    { "genre": "Khác", "games": 3, "hours": 12.5 }
  ]
}
```

- Tối đa 8 mục; thể loại xếp sau được gộp vào `Khác`.
- Một game có nhiều thể loại được tính vào từng thể loại, nên tổng `games` có thể lớn hơn tổng số game.

---

### Giờ chơi theo tuần / tháng
```
GET /api/analytics/playtime?range=week&periods=8
```

| Query | Mặc định | Ghi chú |
|---|---|---|
| `range` | `week` | `week` (tuần bắt đầu thứ Hai) hoặc `month` |
| `periods` | 8 (week) / 6 (month) | Số kỳ gần nhất, tối đa 26 (week) / 24 (month) |

Múi giờ tính theo `Asia/Ho_Chi_Minh`. Dữ liệu lấy từ `playSessions` (`playedAt`, `minutes`). Kỳ không có phiên chơi vẫn được trả về với giá trị 0. Phần tử cuối cùng là kỳ hiện tại.

> Số giờ ở đây chỉ gồm các phiên chơi đã ghi qua `POST .../play-sessions`, nên có thể nhỏ hơn `totalHours` nếu người dùng từng sửa tay `hoursPlayed`.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "range": "week",
    "periods": 8,
    "items": [
      { "periodStart": "2026-09-07", "label": "07/09", "minutes": 270, "hours": 4.5 },
      { "periodStart": "2026-09-14", "label": "14/09", "minutes": 0, "hours": 0 }
    ]
  }
}
```

---

### Game chơi nhiều nhất
```
GET /api/analytics/top-games?limit=5
```

| Query | Mặc định | Ghi chú |
|---|---|---|
| `limit` | 5 | Từ 1 đến 20 |

Chỉ trả về game có `hoursPlayed` lớn hơn 0, sắp xếp giảm dần.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "userGameId": "66f1a2b3c4d5e6f7890abcde",
      "gameId": "66e1a2b3c4d5e6f7890abcdf",
      "name": "The Witcher 3",
      "status": "completed",
      "rating": 10,
      "hours": 142.5
    }
  ]
}
```

---

## Module: Advisor (Trợ lý AI Game)

> Tất cả endpoint dưới đây **bắt buộc** header `Authorization: Bearer <token>`. Dữ liệu chat được cô lập tuyệt đối theo từng tài khoản.

### Gửi tin nhắn tư vấn game
```
POST /api/advisor/chat
```

**Header (bắt buộc):**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "message": "Gợi ý cho mình một số game nhập vai cốt truyện sâu sắc giống The Witcher 3",
  "sessionId": "default"
}
```

*Lưu ý: `message` tối đa 1500 ký tự. Hệ thống tự động kèm theo lịch sử trò chuyện gần nhất và dữ liệu thư viện game của bạn để Gemini đưa ra gợi ý chuẩn gu nhất.*

**Response 200 (thành công):**
```json
{
  "success": true,
  "data": {
    "reply": "Dưới đây là một số tựa game nhập vai thế giới mở với cốt truyện có chiều sâu tương tự The Witcher 3: 1. Cyberpunk 2077... 2. Baldur's Gate 3..."
  }
}
```

**Lỗi có thể gặp:**
| Status | code | Ý nghĩa |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Nội dung tin nhắn rỗng hoặc vượt quá 1500 ký tự |
| 401 | `NO_TOKEN` / `INVALID_TOKEN` | Thiếu token hoặc token không hợp lệ / hết hạn |
| 429 | `RATE_LIMIT_EXCEEDED` | Gửi quá 15 tin nhắn/phút theo tài khoản người dùng |
| 429 | `AI_RATE_LIMITED` | Dịch vụ AI thượng nguồn đang quá tải yêu cầu |
| 502 | `AI_SERVICE_UNAVAILABLE` | Lỗi dịch vụ từ phía máy chủ Google Gemini |
| 502 | `EMPTY_AI_RESPONSE` | Không nhận được phản hồi nội dung hợp lệ từ AI |
| 502 | `GEMINI_UNREACHABLE` | Không thể kết nối mạng tới dịch vụ AI |
| 503 | `AI_NOT_CONFIGURED` | Server chưa cấu hình `GEMINI_API_KEY` |
| 504 | `GEMINI_TIMEOUT` | Yêu cầu tới AI quá thời gian chờ (timeout) |

---

### Lấy lịch sử tư vấn
```
GET /api/advisor/history?sessionId=default&limit=30
```

**Header (bắt buộc):**
```
Authorization: Bearer <token>
```

**Response 200 (thành công):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "672b1234abcd5678ef901234",
      "userId": "650f1a2b3c4d5e6f7890abcd",
      "sessionId": "default",
      "userMessage": "Gợi ý game souls-like",
      "botReply": "Bạn có thể thử Elden Ring, Lies of P hoặc Sekiro...",
      "createdAt": "2026-11-06T04:50:00.000Z",
      "updatedAt": "2026-11-06T04:50:00.000Z"
    }
  ]
}
```

---

### Xóa lịch sử trò chuyện
```
DELETE /api/advisor/history?sessionId=default
```

**Header (bắt buộc):**
```
Authorization: Bearer <token>
```

**Response 200 (thành công):**
```json
{
  "success": true,
  "data": {
    "message": "Đã làm mới cuộc trò chuyện"
  }
}
```

---

---

## Module: Economy (Minigame Mở Hòm & Vật Phẩm)

> Tất cả thuật toán xác suất rơi vật phẩm, trừ xu ví và sinh dải roulette được tính toán 100% tại Backend để chống gian lận.

### Lấy danh sách rương mở hòm (công khai)
```
GET /api/economy/cases
```

**Response 200 (thành công):**
```json
{
  "success": true,
  "data": [
    {
      "id": "standard",
      "name": "Rương Tân Thủ",
      "englishName": "Standard Case",
      "description": "Rương nhập môn dành cho mọi game thủ. Chi phí vừa phải, cơ hội mở được nhiều bảo bối kinh điển.",
      "cost": 100,
      "icon": "📦",
      "themeColor": "emerald",
      "displayChances": {
        "common": "60%",
        "uncommon": "30%",
        "rare": "8.5%",
        "epic": "1.4%",
        "legendary": "0.1%"
      },
      "itemCount": 24
    }
  ]
}
```

---

### Lấy thông tin ví và trạng thái điểm danh
```
GET /api/economy/wallet
```

**Header (bắt buộc):**
```
Authorization: Bearer <token>
```

**Response 200 (thành công):**
```json
{
  "success": true,
  "data": {
    "balance": 500,
    "totalEarned": 500,
    "totalSpent": 0,
    "canClaimDaily": true,
    "nextDailyAt": null,
    "dailyRewardAmount": 150
  }
}
```

---

### Điểm danh nhận Xu hàng ngày
```
POST /api/economy/daily-reward
```

**Header (bắt buộc):**
```
Authorization: Bearer <token>
```

**Response 200 (thành công):**
```json
{
  "success": true,
  "data": {
    "balance": 650,
    "claimedAmount": 150,
    "nextDailyAt": "2026-11-11T18:00:00.000Z",
    "message": "Điểm danh thành công! Bạn nhận được +150 Xu."
  }
}
```

**Lỗi có thể gặp:**
| Status | code | Trường hợp |
|---|---|---|
| 400 | `ALREADY_CLAIMED` | Chưa đủ thời gian chờ 24h giữa 2 lần điểm danh |
| 401 | `NO_TOKEN` / `INVALID_TOKEN` | Thiếu hoặc token không hợp lệ |

---

### Mở hòm gacha (Case Opening)
```
POST /api/economy/open
```

**Header (bắt buộc):**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "caseId": "standard"
}
```

**Response 200 (thành công):**
```json
{
  "success": true,
  "data": {
    "wonItem": {
      "_id": "67301a2b3c4d5e6f7890abc1",
      "name": "Kiếm Bạc Thợ Săn Quái Vật",
      "description": "Lưỡi kiếm rèn từ bạc nguyên chất, khắc cổ ngữ Rune chuyên trị ma thú bóng đêm.",
      "rarity": "rare",
      "type": "weapon",
      "icon": "⚔️",
      "coinValue": 180
    },
    "isNew": true,
    "caseId": "standard",
    "cost": 100,
    "remainingBalance": 400,
    "targetIndex": 36,
    "reelItems": [ ... ]
  }
}
```

**Lỗi có thể gặp:**
| Status | code | Trường hợp |
|---|---|---|
| 400 | `INVALID_CASE` | Mã rương `caseId` không tồn tại |
| 400 | `INSUFFICIENT_FUNDS` | Số dư Xu không đủ để mở hòm |
| 401 | `NO_TOKEN` / `INVALID_TOKEN` | Chưa đăng nhập hoặc token hết hạn |

---

### Xem túi đồ / bộ sưu tập
```
GET /api/economy/inventory?rarity=all&type=all&sort=recent&page=1&limit=24
```

**Header (bắt buộc):**
```
Authorization: Bearer <token>
```

**Query params:**
| Param | Mặc định | Ý nghĩa |
|---|---|---|
| `rarity` | `all` | `all`, `common`, `uncommon`, `rare`, `epic`, `legendary` |
| `type` | `all` | `all`, `weapon`, `badge`, `avatar_frame`, `title`, `collectible` |
| `search` | `""` | Từ khóa tìm kiếm theo tên hoặc mô tả |
| `sort` | `recent` | `recent`, `rarityDesc`, `nameAsc`, `quantityDesc` |
| `page` | `1` | Số trang |
| `limit` | `24` | Số mục mỗi trang |

**Response 200 (thành công):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "67302a2b3c4d5e6f7890abcd",
        "quantity": 2,
        "isEquipped": false,
        "acquiredAt": "2026-11-10T11:00:00.000Z",
        "item": {
          "_id": "67301a2b3c4d5e6f7890abc1",
          "name": "Kiếm Bạc Thợ Săn Quái Vật",
          "rarity": "rare",
          "type": "weapon",
          "icon": "⚔️",
          "coinValue": 180
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 24,
      "totalPages": 1,
      "hasNext": false
    },
    "summary": {
      "uniqueOwned": 1,
      "totalCatalog": 24,
      "completionRate": 4,
      "totalQuantity": 2,
      "totalValue": 360
    }
  }
}
```

---

### Bán vật phẩm trong túi đồ đổi lấy Xu
```
POST /api/economy/sell
```

**Header (bắt buộc):**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "inventoryId": "67302a2b3c4d5e6f7890abcd",
  "quantity": 1
}
```

**Response 200 (thành công):**
```json
{
  "success": true,
  "data": {
    "soldItem": {
      "name": "Kiếm Bạc Thợ Săn Quái Vật",
      "rarity": "rare",
      "icon": "⚔️",
      "soldQuantity": 1
    },
    "refundedCoins": 180,
    "remainingBalance": 580,
    "remainingQuantity": 1,
    "message": "Đã bán thành công x1 Kiếm Bạc Thợ Săn Quái Vật và nhận lại +180 Xu!"
  }
}
```

---

### Lịch sử mở hòm cá nhân
```
GET /api/economy/history?limit=20
```

**Header (bắt buộc):**
```
Authorization: Bearer <token>
```

**Response 200:** danh sách các lượt mở hòm đã ghi nhận của người dùng.

---

### Bảng tin trúng thưởng gần nhất (toàn server)
```
GET /api/economy/recent-drops?limit=10
```

**Response 200:** danh sách 10 vật phẩm mở được mới nhất trên toàn hệ thống kèm tên người chơi đã ẩn danh một phần (`Gam***`).

---

## Mã lỗi dùng chung (toàn hệ thống)

| code | Status | Ý nghĩa |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Dữ liệu không hợp lệ theo Mongoose schema |
| `INVALID_ID` | 400 | ID gửi lên không đúng định dạng MongoDB ObjectId |
| `DUPLICATE_KEY` | 409 | Vi phạm ràng buộc unique (email/username trùng) |
| `SERVER_ERROR` | 500 | Lỗi không xác định — xem log server để debug |

---

> **Ghi chú cho các module sau (Library, Advisor, Analytics, Economy):** Khi thêm endpoint mới, thêm 1 mục mới vào file này theo đúng format trên — route, body mẫu, response mẫu, bảng lỗi có thể gặp. Giữ Base URL và format response chung làm chuẩn, không tự đổi cấu trúc response riêng cho module của mình.
