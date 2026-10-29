import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ThemeToggle from "../common/ThemeToggle";

export default function AppNavbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { to: "/library", label: "Thư viện" },
    { to: "/advisor", label: "Cố vấn AI" },
    { to: "/analytics", label: "Thống kê" },
    { to: "/economy", label: "Mở hòm" },
  ];

  return (
    <header className="w-full bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/library" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
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
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white">
              Pixel<span className="text-emerald-500">Log</span>{" "}
              <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                GL
              </span>
            </span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* User profile info */}
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold text-xs">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : "PL"}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                {user?.username || "Gamer"}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                Cấp độ 12
              </div>
            </div>

            {user && (
              <button
                type="button"
                onClick={logout}
                title="Đăng xuất"
                className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors duration-150 cursor-pointer ml-1"
                aria-label="Đăng xuất"
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
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
