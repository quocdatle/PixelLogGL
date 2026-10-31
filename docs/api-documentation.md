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
## Mã lỗi dùng chung (toàn hệ thống)

| code | Status | Ý nghĩa |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Dữ liệu không hợp lệ theo Mongoose schema |
| `INVALID_ID` | 400 | ID gửi lên không đúng định dạng MongoDB ObjectId |
| `DUPLICATE_KEY` | 409 | Vi phạm ràng buộc unique (email/username trùng) |
| `SERVER_ERROR` | 500 | Lỗi không xác định — xem log server để debug |

---

> **Ghi chú cho các module sau (Library, Advisor, Analytics, Economy):** Khi thêm endpoint mới, thêm 1 mục mới vào file này theo đúng format trên — route, body mẫu, response mẫu, bảng lỗi có thể gặp. Giữ Base URL và format response chung làm chuẩn, không tự đổi cấu trúc response riêng cho module của mình.
