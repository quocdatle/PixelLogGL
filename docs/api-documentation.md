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

## Mã lỗi dùng chung (toàn hệ thống)

| code | Status | Ý nghĩa |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Dữ liệu không hợp lệ theo Mongoose schema |
| `INVALID_ID` | 400 | ID gửi lên không đúng định dạng MongoDB ObjectId |
| `DUPLICATE_KEY` | 409 | Vi phạm ràng buộc unique (email/username trùng) |
| `SERVER_ERROR` | 500 | Lỗi không xác định — xem log server để debug |

---

> **Ghi chú cho các module sau (Library, Advisor, Analytics, Economy):** Khi thêm endpoint mới, thêm 1 mục mới vào file này theo đúng format trên — route, body mẫu, response mẫu, bảng lỗi có thể gặp. Giữ Base URL và format response chung làm chuẩn, không tự đổi cấu trúc response riêng cho module của mình.
