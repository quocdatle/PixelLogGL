# PixelLogGL 🎮

> **PixelLog** — Website quản lý thư viện game cho người chơi tích hợp Chatbot AI gợi ý game & Minigame mở hòm (Economy).

---

## 📌 Tài liệu dự án

- 📁 [Cấu trúc thư mục dự án (PROJECT_STRUCTURE.md)](./PROJECT_STRUCTURE.md): Mô tả chi tiết toàn bộ cấu trúc file và kiến trúc Frontend/Backend.
- 📋 [Quy chuẩn phát triển (CLAUDE.md)](./CLAUDE.md): Quy ước code, Git flow, format REST API response và checklist hoàn thành tính năng.
- 📖 [Đặc tả REST API (docs/api-documentation.md)](./docs/api-documentation.md): Danh sách các endpoint, request body, response mẫu và mã lỗi.
- 📅 [Kế hoạch Sprint (docs/sprint-planning.md)](./docs/sprint-planning.md): Phân chia công việc theo phương pháp Scrum.

---

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, React Router v7, Tailwind CSS v4, Axios.
- **Backend:** Node.js, Express 4, MongoDB + Mongoose 9, JWT, Bcrypt.
- **Dịch vụ tích hợp:** IGDB API (Twitch Developer, dữ liệu game), Google Gemini API (AI Chatbot gợi ý).

---

## 🚀 Hướng dẫn khởi chạy

### 1. Khởi chạy Backend
```bash
cd backend
npm install
npm run dev
```
*Backend sẽ chạy tại:* `http://localhost:5000`

### 2. Khởi chạy Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend sẽ chạy tại:* `http://localhost:5173`
