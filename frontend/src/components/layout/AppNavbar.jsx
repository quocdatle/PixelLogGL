import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ThemeToggle from "../common/ThemeToggle";
import AvatarWithFrame from "../common/AvatarWithFrame";
import amiyaLogo from "../../assets/amiya.gif";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 sm:h-[96px] flex items-center justify-between gap-4">
        {/* Brand + Desktop Nav */}
        <div className="flex items-center gap-6 lg:gap-10">
          <Link
            to={user ? "/library" : "/"}
            className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-2xl"
          >
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-emerald-600/10 dark:bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={amiyaLogo}
                alt="PixelLog GL"
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
          <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2.5 rounded-xl text-base lg:text-[17px] font-semibold whitespace-nowrap transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
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

        {/* Right side controls (LoL Profile area scaled ~30% larger) */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          <ThemeToggle />

          {/* User profile link (~30% larger, League of Legends style) */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 pl-1">
            <Link
              to="/profile"
              title="Mở trang hồ sơ & điểm danh"
              className={`group flex items-center gap-4 px-3 sm:px-4 py-1.5 rounded-2xl transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                pathname.startsWith("/profile")
                  ? "bg-zinc-100 dark:bg-zinc-800"
                  : "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70"
              }`}
            >
              <div className="relative">
                <AvatarWithFrame user={user} size="nav" showLevelBadge />
                {user?.canCheckInToday && (
                  <span
                    className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white dark:border-zinc-900 motion-safe:animate-pulse z-20"
                    title="Có thể điểm danh hôm nay!"
                  />
                )}
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-lg sm:text-[21px] font-extrabold text-zinc-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {user?.username || "Gamer"}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400 leading-tight mt-1 flex items-center gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Cấp {userLevel}
                  </span>
                  {user?.canCheckInToday && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60">
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
                className="p-3 text-zinc-500 dark:text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                aria-label="Đăng xuất"
              >
                <svg
                  className="w-7 h-7"
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
              className="md:hidden p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Mở menu điều hướng"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
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
