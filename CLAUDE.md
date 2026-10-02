# CLAUDE.md — Quy chuẩn dự án

> File này giúp Claude Code (và mọi thành viên) hiểu đúng ngữ cảnh dự án, tuân thủ đúng quy ước khi code — tránh mỗi module một kiểu khi 5 người cùng code song song.

## 1. Tổng quan dự án

- **Tên đề tài:** Xây dựng website quản lý thư viện game cho người chơi tích hợp chatbot AI
- **Phương pháp:** Scrum, 3-4 sprint (2 tuần/sprint)
- **Tính năng chính:** Quản lý thư viện game cá nhân, Chatbot AI gợi ý game, Theo dõi giờ chơi, Thống kê (Analytics), Minigame mở hòm (Economy)

## 2. Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose (ODM) |
| Auth | JWT |
| API ngoài | RAWG API (dữ liệu game), Claude API (chatbot AI) |

**Không tự ý đổi sang công nghệ khác** (vd: đổi MongoDB sang MySQL, đổi Express sang NestJS) dù có vẻ "tốt hơn" — mọi thay đổi tech stack phải được cả nhóm thống nhất trước.

## 3. Cấu trúc thư mục (bắt buộc tuân theo)

Dự án chia theo **module độc lập** (feature-based), không chia theo layer Backend/Frontend chung chung. Mỗi module tự chứa route + controller + service + model riêng.

```
backend/src/modules/<ten-module>/
  ├── <ten>.model.js
  ├── <ten>.routes.js
  ├── <ten>.controller.js
  └── <ten>.service.js

frontend/src/features/<ten-feature>/
  ├── pages/
  ├── components/
  └── <ten>Service.js
```

Các module hiện có: `auth`, `users`, `games`, `library`, `advisor`, `analytics`, `economy`.

**Quy tắc vàng:** Khi thêm tính năng mới ở Sprint sau, chỉ tạo module/feature mới + đăng ký 1 dòng vào `routes/index.js` (backend) hoặc `router.jsx` (frontend). **Không sửa code trong module của người khác** trừ khi đã bàn trước — tránh conflict Git và tránh phá vỡ phần người khác đang làm.

## 4. Quy ước đặt tên

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| File | camelCase, hậu tố theo vai trò | `userGame.model.js`, `advisor.controller.js` |
| Biến, hàm | camelCase | `getUserLibrary`, `isGameExisted` |
| Class / Schema | PascalCase | `UserGame`, `AdvisorLog` |
| Hằng số | UPPER_SNAKE_CASE | `MAX_COIN_PER_DAY` |
| MongoDB collection | camelCase số nhiều | `userGames`, `caseOpenLogs` |
| Route (URL) | kebab-case, số nhiều | `/api/user-games`, `/api/case-logs` |
| Biến môi trường | UPPER_SNAKE_CASE | `JWT_SECRET`, `RAWG_API_KEY` |
| Nhánh Git | `<module>/<mo-ta-ngan>` | `library/add-search-filter`, `economy/case-open-api` |

## 5. Quy ước API (REST)

- Mọi response trả về theo format thống nhất (dùng chung `utils/responseFormatter.js`):

```json
// Thành công
{ "success": true, "data": { ... } }

// Lỗi
{ "success": false, "message": "Mô tả lỗi ngắn gọn", "code": "ERROR_CODE" }
```

- HTTP method đúng chuẩn REST: `GET` (đọc), `POST` (tạo mới), `PUT`/`PATCH` (cập nhật), `DELETE` (xoá). Không dùng `POST` cho mọi thứ.
- Route có xác thực phải đi qua `middlewares/auth.middleware.js` — không tự viết logic verify JWT riêng trong từng controller.
- Mọi lỗi phải được bắt bằng `try/catch` và chuyển qua `middlewares/errorHandler.js`, không để lỗi "nuốt mất" không log.

## 6. Quy ước Mongoose Schema

- Mỗi model định nghĩa rõ `timestamps: true` (tự có `createdAt`/`updatedAt`), không tự thêm field ngày giờ thủ công.
- Field tham chiếu dùng `mongoose.Schema.Types.ObjectId` kèm `ref:` rõ ràng:

```js
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
```

- Dữ liệu chỉ dùng chung trong 1 document (vd: `playSessions` trong `UserGame`) thì **embed**, dữ liệu được nhiều nơi tham chiếu (vd: `User`, `Game`) thì **reference** — không embed tùy tiện gây trùng lặp dữ liệu.

## 7. Quy ước Frontend (React)

- Gọi API chỉ qua lớp `services/` (dùng chung `services/api.js` đã gắn sẵn JWT interceptor) — **không gọi `fetch`/`axios` trực tiếp trong component**.
- Component chia nhỏ theo nguyên tắc: `pages/` chứa trang hoàn chỉnh (ghép nhiều component), `components/` chứa phần tái sử dụng được.
- State dùng chung toàn app (vd: thông tin user đăng nhập) để trong `context/`, state cục bộ của 1 trang dùng `useState` tại chỗ — không lạm dụng Context cho mọi thứ.
- Style dùng Tailwind utility class, hạn chế viết CSS riêng trừ khi Tailwind không đáp ứng được.

## 8. Git & Commit

- Commit message ngắn gọn, có tiền tố module: `[library] thêm filter theo thể loại`, `[economy] fix tỷ lệ rơi item sai`
- Mỗi người làm trên nhánh riêng theo module, tạo Pull Request để người khác review trước khi merge vào `main`/`develop` — không push thẳng lên `main`.
- Không commit file `.env`, `node_modules/` (đã có `.gitignore` sẵn trong cấu trúc thư mục dự án).

## 9. Biến môi trường cần có (`.env`)

```
# Backend
PORT=5000
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
RAWG_API_KEY=
CLAUDE_API_KEY=

# Frontend
VITE_API_URL=
```

## 10. Checklist trước khi coi 1 tính năng là "Done"

- [ ] API đã test bằng Postman/Thunder Client, trả đúng format chuẩn ở mục 5
- [ ] Có xử lý lỗi (input sai, không tìm thấy dữ liệu, lỗi server)
- [ ] Frontend hiển thị đúng trạng thái loading/error, không chỉ test trường hợp thành công
- [ ] Không hardcode giá trị nhạy cảm (API key, secret) trực tiếp trong code
- [ ] Đã cập nhật `docs/api-documentation.md` nếu thêm/sửa endpoint
- [ ] Code đã được 1 thành viên khác review trước khi merge

## 11. Những điều cần tránh

- Không tự ý thêm tính năng ngoài phạm vi đã chốt trong Project Charter (vd: thêm chat realtime, social feed) — ý tưởng mới ghi vào "Backlog cho tương lai", không chèn giữa sprint.
- Không gọi trực tiếp Claude API / RAWG API từ Frontend — luôn đi qua Backend để giữ an toàn API key.
- Không để logic tính toán quan trọng (tỷ lệ mở hòm, random) chạy ở Frontend — phải tính ở Backend để tránh gian lận.
