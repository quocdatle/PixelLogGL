import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ThemeToggle from "../common/ThemeToggle";
import amiyaLogo from "../../assets/amiya.gif";

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
    <header className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200/60 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-[82px] flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-10">
          <Link to="/library" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-emerald-600/10 dark:bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={amiyaLogo}
                alt="Amiya Logo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="eager"
              />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-zinc-900 dark:text-white">
              Pixel<span className="text-emerald-500">Log</span>{" "}
              <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 align-middle">
                GL
              </span>
            </span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 ${
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
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* User profile info */}
          <div className="flex items-center gap-3 pl-2">
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold text-sm shadow-xs">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : "PL"}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                {user?.username || "Gamer"}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                Cấp độ 12
              </div>
            </div>

            {user && (
              <button
                type="button"
                onClick={logout}
                title="Đăng xuất"
                className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors duration-150 cursor-pointer ml-1"
                aria-label="Đăng xuất"
              >
                <svg
                  className="w-5 h-5"
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
