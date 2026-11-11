import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ThemeToggle from "../common/ThemeToggle";
import AvatarWithFrame from "../common/AvatarWithFrame";
import BrandLogo from "../common/BrandLogo";

export default function AppNavbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/library", label: "Thư viện" },
    { to: "/advisor", label: "Cố vấn AI" },
    { to: "/analytics", label: "Thống kê" },
    { to: "/economy", label: "Mở hòm" },
    { to: "/profile", label: "Hồ sơ" },
  ];

  const userLevel = user?.level || 1;

  return (
    <header className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-3">
        {/* Brand + Desktop Nav */}
        <div className="flex items-center gap-4 lg:gap-7 min-w-0">
          <Link
            to={user ? "/library" : "/"}
            className="inline-flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
          >
            <BrandLogo size="sm" />
          </Link>

          {/* Navigation links */}
          <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <ThemeToggle />

          {/* User profile link */}
          <div className="flex items-center gap-1.5 sm:gap-2 pl-1">
            <Link
              to="/profile"
              title="Mở trang hồ sơ & điểm danh"
              className={`group flex items-center gap-2.5 px-2 py-1 rounded-xl transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                pathname.startsWith("/profile")
                  ? "bg-zinc-100 dark:bg-zinc-800"
                  : "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70"
              }`}
            >
              <div className="relative">
                <AvatarWithFrame user={user} size="nav" showLevelBadge />
                {user?.canCheckInToday && (
                  <span
                    className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white dark:border-zinc-900 z-20"
                    title="Có thể điểm danh hôm nay!"
                  />
                )}
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-sm font-bold text-zinc-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors max-w-[140px] truncate">
                  {user?.username || "Gamer"}
                </div>
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5 flex items-center gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                    Cấp {userLevel}
                  </span>
                  {user?.canCheckInToday && (
                    <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                      Điểm danh
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {user && (
              <button
                type="button"
                onClick={logout}
                title="Đăng xuất"
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                aria-label="Đăng xuất"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
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

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Mở menu điều hướng"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Điều hướng di động"
          className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 space-y-1"
        >
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
