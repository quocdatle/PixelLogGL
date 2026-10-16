# 📁 CẤU TRÚC THƯ MỤC DỰ ÁN PIXELLOG (PROJECT STRUCTURE)

> Dự án **PixelLog** được thiết kế theo kiến trúc **Feature-based (Modular)** độc lập cho cả Backend và Frontend, giúp nhóm phát triển song song mà không xung đột mã nguồn.

---

## 🌳 Sơ đồ tổng quan cây thư mục

```text
PixelLogGL/
├── docs/                               # Tài liệu dự án & quy trình Scrum
│   ├── api-documentation.md            # Đặc tả toàn bộ REST API endpoints
│   └── sprint-planning.md              # Kế hoạch phân chia Sprint & Backlog
│
├── backend/                            # Source code máy chủ Backend (Node.js + Express)
│   ├── database/
│   │   └── seeders/
│   │       └── items.seed.js           # Dữ liệu hạt giống cho hệ thống item/mở hòm
│   ├── src/
│   │   ├── config/                     # Cấu hình môi trường & cơ sở dữ liệu
│   │   │   ├── db.js                   # Kết nối MongoDB (Mongoose)
│   │   │   └── env.js                  # Validate biến môi trường .env
│   │   ├── middlewares/                # Các Express middleware dùng chung
│   │   │   ├── auth.middleware.js      # Xác thực JWT (Bearer Token)
│   │   │   ├── errorHandler.js         # Bắt và format lỗi tập trung
│   │   │   └── validate.middleware.js  # Validate các trường bắt buộc trong req.body
│   │   ├── modules/                    # Phân rã tính năng theo module độc lập
│   │   │   ├── _template/              # Module mẫu để tham khảo khi tạo module mới
│   │   │   │   ├── example.controller.js
│   │   │   │   ├── example.model.js
│   │   │   │   └── example.routes.js
│   │   │   ├── advisor/                # Module Chatbot AI gợi ý game
│   │   │   │   ├── advisor.controller.js
│   │   │   │   ├── advisor.routes.js
│   │   │   │   ├── advisorLog.model.js
│   │   │   │   └── claudeApi.service.js
│   │   │   ├── analytics/              # Module Thống kê giờ chơi & sở thích
│   │   │   │   ├── analytics.controller.js
│   │   │   │   ├── analytics.routes.js
│   │   │   │   └── analytics.service.js
│   │   │   ├── auth/                   # Module Đăng ký & Đăng nhập
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   └── auth.service.js
│   │   │   ├── economy/                # Module Minigame mở hòm & Vật phẩm
│   │   │   │   ├── caseOpenLog.model.js
│   │   │   │   ├── economy.controller.js
│   │   │   │   ├── economy.routes.js
│   │   │   │   ├── economy.service.js
│   │   │   │   ├── inventory.model.js
│   │   │   │   ├── item.model.js
│   │   │   │   └── wallet.model.js
│   │   │   ├── games/                  # Module Tra cứu game & tích hợp RAWG
│   │   │   │   ├── game.controller.js
│   │   │   │   ├── game.model.js
│   │   │   │   ├── game.routes.js
│   │   │   │   └── rawgApi.service.js
│   │   │   ├── library/                # Module Thư viện game cá nhân
│   │   │   │   ├── library.controller.js
│   │   │   │   ├── library.routes.js
│   │   │   │   ├── library.service.js
│   │   │   │   └── userGame.model.js
│   │   │   └── users/                  # Module Quản lý người dùng & hồ sơ
│   │   │       ├── user.controller.js
│   │   │       ├── user.model.js
│   │   │       ├── user.routes.js
│   │   │       └── user.service.js
│   │   ├── routes/                     # Điểm tập hợp toàn bộ routes
│   │   │   └── index.js
│   │   ├── utils/                      # Tiện ích bổ trợ dùng chung
│   │   │   ├── jwt.js                  # Ký và xác minh JSON Web Token
│   │   │   └── responseFormatter.js    # Chuẩn hóa format response thành công/lỗi
│   │   └── app.js                      # Thiết lập Express App & gắn middleware
│   ├── .env                            # Biến môi trường Backend (PORT, DB, JWT...)
│   ├── package.json                    # Cấu hình dependency & script Backend
│   └── server.js                       # Điểm kích hoạt chạy server (Entry Point)
│
├── frontend/                           # Giao diện người dùng (React 19 + Vite + Tailwind CSS v4)
│   ├── public/                         # Tài nguyên tĩnh công khai
│   │   ├── favicon.svg
│   │   └── icons.svg                   # SVG Sprite biểu tượng
│   ├── src/
│   │   ├── assets/                     # Hình ảnh, logo của dự án
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components/                 # Component UI tái sử dụng toàn app
│   │   │   └── common/
│   │   │       ├── ProtectedRoute.jsx  # Bảo vệ trang yêu cầu đăng nhập
│   │   │       └── ThemeToggle.jsx     # Nút chuyển đổi Light/Dark theme
│   │   ├── context/                    # React Context quản lý global state
│   │   │   ├── AuthContext.jsx         # Lưu trữ user, token, xử lý login/logout
│   │   │   └── ThemeContext.jsx        # Quản lý giao diện sáng/tối
│   │   ├── features/                   # Tính năng chia theo từng domain nghiệp vụ
│   │   │   ├── _template/              # Template mẫu cho trang & service mới
│   │   │   │   ├── pages/ExamplePage.jsx
│   │   │   │   └── exampleService.js
│   │   │   ├── advisor/                # Tính năng Chatbot tư vấn AI
│   │   │   │   ├── components/
│   │   │   │   │   ├── ChatWindow.jsx
│   │   │   │   │   └── RecommendationCard.jsx
│   │   │   │   ├── pages/AdvisorPage.jsx
│   │   │   │   └── advisorService.js
│   │   │   ├── analytics/              # Tính năng Thống kê & Biểu đồ
│   │   │   │   ├── components/
│   │   │   │   │   ├── GenreChart.jsx
│   │   │   │   │   └── PlaytimeChart.jsx
│   │   │   │   ├── pages/AnalyticsPage.jsx
│   │   │   │   └── analyticsService.js
│   │   │   ├── auth/                   # Tính năng Xác thực
│   │   │   │   ├── components/
│   │   │   │   │   ├── AuthLayout.jsx  # Layout 2 cột cho Auth
│   │   │   │   │   └── FormField.jsx   # Input đồng bộ style Tailwind
│   │   │   │   ├── pages/
│   │   │   │   │   ├── LoginPage.jsx
│   │   │   │   │   └── RegisterPage.jsx
│   │   │   │   └── authService.js
│   │   │   ├── economy/                # Tính năng Gacha/Mở hòm & Bộ sưu tập
│   │   │   │   ├── components/
│   │   │   │   │   ├── CaseAnimation.jsx
│   │   │   │   │   └── ItemGridCard.jsx
│   │   │   │   ├── pages/
│   │   │   │   │   ├── CaseOpeningPage.jsx
│   │   │   │   │   └── CollectionPage.jsx
│   │   │   │   └── economyService.js
│   │   │   └── library/                # Tính năng Quản lý thư viện game
│   │   │       ├── components/
│   │   │       │   ├── GameCard.jsx
│   │   │       │   ├── LibraryItem.jsx
│   │   │       │   └── StatusBadge.jsx
│   │   │       ├── pages/
│   │   │       │   ├── GameSearchPage.jsx
│   │   │       │   └── LibraryPage.jsx
│   │   │       └── libraryService.js
│   │   ├── hooks/                      # Custom React Hooks
│   │   │   ├── useAuth.js              # Hook truy cập nhanh AuthContext
│   │   │   └── useTheme.js             # Hook đọc & đổi theme sáng/tối
│   │   ├── services/                   # Lớp giao tiếp mạng
│   │   │   └── api.js                  # Axios instance tập trung (tự gắn JWT)
│   │   ├── index.css                   # Global CSS & Tailwind imports
│   │   ├── main.jsx                    # Root render của React App
│   │   └── router.jsx                  # Cấu hình routes với React Router v7
│   ├── .env                            # Biến môi trường Vite (VITE_API_URL)
│   ├── .gitignore                      # Gitignore dành riêng cho frontend
│   ├── eslint.config.js                # Cấu hình lint code
│   ├── index.html                      # HTML template gốc
│   ├── package.json                    # Cấu hình thư viện Frontend
│   └── vite.config.js                  # Cấu hình Vite & plugin Tailwind CSS v4
│
├── .gitignore                          # Quy tắc bỏ qua file của toàn repository
├── CLAUDE.md                           # Bộ quy chuẩn code và cam kết của dự án
└── README.md                           # Tài liệu tổng quan dự án
```

---

## 🔍 Chi tiết vai trò từng thành phần

### 1. Tài liệu (`/docs` & Thư mục gốc)
- **`CLAUDE.md`**: File kim chỉ nam cho AI Assistant và các lập trình viên. Quy định chuẩn đặt tên, chuẩn format REST API, quy ước Mongoose Schema, quy tắc Git commit và checklist tính năng "Done".
- **`docs/api-documentation.md`**: Bản đặc tả toàn bộ endpoint, cấu trúc request body, response mẫu kèm danh sách các mã lỗi HTTP có thể xảy ra.
- **`docs/sprint-planning.md`**: Nơi quản lý phân chia công việc theo từng Sprint của phương pháp Scrum.

---

### 2. Backend (`/backend`)

Toàn bộ backend tuân theo mô hình **Module hóa theo tính năng (Feature-based)**. Mỗi module gói gọn 4 tầng:
1. `*.model.js`: Mongoose Schema định nghĩa bảng và kiểu dữ liệu trong MongoDB.
2. `*.routes.js`: Định nghĩa các đường dẫn URL API bằng Express Router.
3. `*.controller.js`: Tiếp nhận HTTP Request, gọi tầng Service và định dạng dữ liệu trả về client.
4. `*.service.js`: Chứa toàn bộ nghiệp vụ logic tính toán, xử lý dữ liệu và truy vấn DB.

#### Các module chính:
- **`modules/auth`**: 
  - `auth.routes.js`: Định tuyến `/api/auth/register`, `/api/auth/login`.
  - `auth.service.js`: Hash mật khẩu bằng `bcrypt` (10 rounds), kiểm tra trùng username/email, sinh token JWT qua `jwt.js`.
  - `auth.controller.js`: Xử lý HTTP request cho đăng ký/đăng nhập.
- **`modules/users`**:
  - `user.model.js`: Schema chứa thông tin tài khoản (`username`, `email`, `passwordHash`, `avatarUrl`, `timestamps`).
  - `user.routes.js`: Định tuyến lấy thông tin (`GET /me`), cập nhật ảnh đại diện (`PATCH /me`), đổi mật khẩu (`PATCH /me/password`).
  - `user.service.js`: Thao tác dữ liệu người dùng trên MongoDB.
- **`modules/games`**: Chịu trách nhiệm quản lý thông tin game và kết nối tới dịch vụ RAWG API để tìm kiếm game quốc tế.
- **`modules/library`**: Lưu trữ danh sách game của từng người dùng (`userGame.model.js`), trạng thái hoàn thành (Backlog, Playing, Completed, Dropped), đánh giá điểm và số giờ chơi.
- **`modules/advisor`**: Tích hợp với Claude API (`claudeApi.service.js`) để đóng vai trò AI Chatbot phân tích sở thích và gợi ý game phù hợp cho người chơi.
- **`modules/analytics`**: Tính toán và tổng hợp dữ liệu thống kê từ thư viện game: phân bổ thể loại, tổng số giờ chơi theo tuần/tháng.
- **`modules/economy`**: Xử lý minigame gacha mở hòm: bảng vật phẩm (`item.model.js`), tỷ lệ mở hòm (`caseOpenLog.model.js`), túi đồ người chơi (`inventory.model.js`) và số dư xu ảo (`wallet.model.js`).
- **`modules/_template`**: Cấu trúc mẫu chuẩn giúp thành viên nhóm clone nhanh khi bắt đầu module mới.

#### Cấu hình & Tiện ích chung:
- **`src/config/db.js`**: Hàm `connectDB()` kết nối trực tiếp đến cụm MongoDB Atlas qua biến `MONGO_URI`.
- **`src/config/env.js`**: Trình nạp biến môi trường tự động kiểm tra xem các biến bắt buộc có bị thiếu không trước khi server chạy.
- **`src/middlewares/auth.middleware.js`**: Middleware `requireAuth` đọc Header `Authorization: Bearer <token>`, giải mã và trích xuất `req.userId`.
- **`src/middlewares/errorHandler.js`**: Nơi hứng mọi lỗi phát sinh từ controller, tự động phân loại lỗi `ValidationError`, `CastError`, `DUPLICATE_KEY` (mã 11000) và trả về response chuẩn.
- **`src/middlewares/validate.middleware.js`**: Hàm `validateBody([...fields])` kiểm tra nhanh sự tồn tại của các trường cần thiết trong request body.
- **`src/utils/responseFormatter.js`**: Đảm bảo toàn bộ hệ thống trả về thống nhất 2 dạng:
  - Thành công: `{ success: true, data: ... }`
  - Thất bại: `{ success: false, message: ..., code: ... }`
- **`src/routes/index.js`**: Điểm gom tất cả router của các module lại thành 1 nhánh duy nhất `/api/*`.

---

### 3. Frontend (`/frontend`)

Frontend được xây dựng bằng React 19 và Vite, tổ chức tương ứng theo từng **Feature**:

#### Các tính năng chính (`src/features`):
- **`features/auth/`**:
  - `pages/LoginPage.jsx` & `pages/RegisterPage.jsx`: Màn hình đăng nhập và đăng ký tài khoản.
  - `components/AuthLayout.jsx`: Giao diện 2 cột với bảng danh mục catalog hiển thị danh sách game mẫu ở cột trái và khung form ở cột phải.
  - `components/FormField.jsx`: Form field đồng bộ với label, input và thông báo lỗi.
  - `authService.js`: Chịu trách nhiệm gửi request tới backend qua `api.js`.
- **`features/library/`**: Màn hình xem kệ game cá nhân (`LibraryPage.jsx`), tìm kiếm game (`GameSearchPage.jsx`), component thẻ game (`GameCard.jsx`, `LibraryItem.jsx`) và nhãn trạng thái (`StatusBadge.jsx`).
- **`features/advisor/`**: Màn hình chat trực tiếp với AI (`AdvisorPage.jsx`), khung hội thoại (`ChatWindow.jsx`) và thẻ hiển thị game được AI đề xuất (`RecommendationCard.jsx`).
- **`features/analytics/`**: Bảng điều khiển phân tích số liệu (`AnalyticsPage.jsx`), biểu đồ phân bố thể loại (`GenreChart.jsx`) và biểu đồ giờ chơi (`PlaytimeChart.jsx`).
- **`features/economy/`**: Giao diện vòng quay mở hòm gacha (`CaseOpeningPage.jsx`, `CaseAnimation.jsx`) và kho trưng bày vật phẩm đã mở (`CollectionPage.jsx`, `ItemGridCard.jsx`).

#### Quản lý trạng thái & Tiện ích chung:
- **`src/context/AuthContext.jsx`**: Cung cấp trạng thái đăng nhập toàn cục (`user`, `token`, `isAuthenticated`, `loading`), hỗ trợ tự động xác thực lại qua token lưu ở `localStorage` khi reload trang.
- **`src/context/ThemeContext.jsx`**: Quản lý chủ đề giao diện Sáng / Tối (Light / Dark mode), đồng bộ với class `dark` của Tailwind CSS và `localStorage`.
- **`src/hooks/useAuth.js`** & **`src/hooks/useTheme.js`**: Các hook giúp gọi nhanh các hàm context mà không cần gọi `useContext` thủ công.
- **`src/components/common/ProtectedRoute.jsx`**: Component bọc quanh các trang riêng tư (Library, Advisor, Economy...), tự động chuyển hướng về `/login` nếu chưa đăng nhập.
- **`src/components/common/ThemeToggle.jsx`**: Nút chuyển đổi nhanh theme giao diện.
- **`src/services/api.js`**: Axios instance cấu hình sẵn `baseURL: import.meta.env.VITE_API_URL`, tích hợp request interceptor tự động chèn token JWT vào header mỗi khi gửi request.
- **`src/router.jsx`**: Bộ định tuyến trung tâm sử dụng `createBrowserRouter` từ React Router v7.

---

## ⚡ Quy tắc làm việc & Mở rộng tính năng mới

1. **Thêm tính năng mới (Sprint tiếp theo):**
   - Chỉ tạo thư mục mới trong `backend/src/modules/<ten-module>` và `frontend/src/features/<ten-feature>`.
   - Backend: Đăng ký router mới bằng **duy nhất 1 dòng** trong `backend/src/routes/index.js`.
   - Frontend: Khai báo route mới bằng **duy nhất 1 dòng** trong `frontend/src/router.jsx`.
   - **Tuyệt đối không sửa mã nguồn trong module của thành viên khác** để phòng ngừa xung đột merge trên Git.
2. **Quy tắc an toàn dữ liệu:**
   - Không gọi API Claude hoặc RAWG trực tiếp từ Frontend để bảo mật API key.
   - Các thuật toán tính xác suất, mở hòm, cộng trừ xu phải chạy 100% tại Backend.
