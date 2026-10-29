import { NavLink } from 'react-router-dom';
import ThemeToggle from '../../../components/common/ThemeToggle';
import useAuth from '../../../hooks/useAuth';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
  }`;

// Thanh điều hướng dùng cho các trang trong feature Library
export default function LibraryHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="mx-auto mb-6 flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Pixel<span className="text-indigo-600 dark:text-indigo-400">Log</span>
        </span>
        <nav className="flex items-center gap-1">
          <NavLink to="/library" end className={linkClass}>
            Thư viện của tôi
          </NavLink>
          <NavLink to="/library/search" className={linkClass}>
            Tìm game
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {user && <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:inline">{user.username}</span>}
        <ThemeToggle />
        <button
          type="button"
          onClick={logout}
          className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
