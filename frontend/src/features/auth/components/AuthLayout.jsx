import ThemeToggle from "../../../components/common/ThemeToggle";

// Khung dùng chung cho Login/Register — cột trái là Gaming Showcase, cột phải là Form
export default function AuthLayout({ activeTab, onTabChange, children }) {
  const tabs = [
    { key: "login", label: "Đăng nhập" },
    { key: "register", label: "Tạo tài khoản" },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between transition-colors duration-200">
      {/* Top Header Bar với ThemeToggle */}
      <header className="max-w-5xl mx-auto w-full mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            <span className="text-4xl">Pixel</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-4xl">
              Log
            </span>
          </span>
        </div>

        {/* Nút ThemeToggle chỉ icon Sun/Moon */}
        <ThemeToggle />
      </header>

      {/* Main Container 2 cột */}
      <main className="max-w-5xl mx-auto w-full my-auto">
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_50px_-15px_rgba(79,70,229,0.08)] dark:shadow-2xl">
          {/* Ánh sáng nền tinh tế */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
            {/* CỘT TRÁI: Gaming Showcase & Ecosystem (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-transparent">
              <div>
                {/* Badge thông tin */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-cyan-400 animate-pulse" />
                  All-in-one Gaming Vault & AI Companion
                </div>

                {/* Tiêu đề & Giới thiệu */}
                <div className="flex items-center gap-3 mb-2.5">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Pixel
                    <span className="text-indigo-600 dark:bg-gradient-to-r dark:from-indigo-400 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent">
                      Log
                    </span>
                  </h1>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md font-semibold bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-slate-300 border border-indigo-200 dark:border-slate-700">
                    GL
                  </span>
                </div>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md leading-relaxed mb-6">
                  Kệ game thông minh của bạn. Quản lý thư viện, chatbot AI gợi ý
                  game hợp gu và minigame mở hòm chiến lợi phẩm độc quyền.
                </p>

                {/* Danh mục Game Cards Showcase */}
                <div className="space-y-2.5 max-w-lg mb-6">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <svg
                        className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2.5"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      GẦN ĐÂY TRONG THƯ VIỆN
                    </span>
                    <span>4 / 142 Games</span>
                  </div>

                  {/* Game 1: Elden Ring */}
                  <div className="group flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900/70 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 shadow-xs transition duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 dark:from-amber-600 dark:to-amber-950 flex items-center justify-center font-bold text-white dark:text-amber-200 shadow-sm text-xs font-mono">
                        ER
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">
                          Elden Ring
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="text-amber-500 dark:text-amber-400 font-semibold flex items-center gap-1">
                            ★ 9.5
                          </span>
                          <span>•</span>
                          <span>84 giờ chơi</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                      Đang chơi
                    </span>
                  </div>

                  {/* Game 2: Cyberpunk 2077 */}
                  <div className="group flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900/70 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-cyan-500/40 shadow-xs transition duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 dark:from-cyan-600 dark:to-blue-950 flex items-center justify-center font-bold text-white dark:text-cyan-200 shadow-sm text-xs font-mono">
                        CP
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition">
                          Cyberpunk 2077
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="text-amber-500 dark:text-amber-400 font-semibold flex items-center gap-1">
                            ★ 9.0
                          </span>
                          <span>•</span>
                          <span>112 giờ chơi</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                      Hoàn thành
                    </span>
                  </div>

                  {/* Game 3: Hollow Knight (AI Recommendation) */}
                  <div className="group flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-violet-950/40 dark:via-slate-900/60 dark:to-slate-900/60 hover:bg-violet-50/50 dark:hover:border-violet-500/40 border border-slate-200/90 dark:border-violet-500/20 shadow-xs transition duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 dark:from-violet-600 dark:to-purple-950 flex items-center justify-center font-bold text-white dark:text-violet-200 shadow-sm text-xs font-mono">
                        HK
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Hollow Knight
                          </h3>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                            🤖 AI Pick
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>Metroidvania</span>
                          <span>•</span>
                          <span className="text-violet-700 dark:text-violet-300 font-semibold">
                            98% hợp gu
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Backlog
                    </span>
                  </div>
                </div>
              </div>

              {/* Dòng tính năng dưới chân cột */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    ✓
                  </span>{" "}
                  RAWG Games Sync
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-violet-600 dark:text-cyan-400 font-bold">
                    ✓
                  </span>{" "}
                  Claude AI Advisor
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    ✓
                  </span>{" "}
                  Gacha Economy
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: Form Container (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white dark:bg-slate-950/40">
              {/* Tab Switcher Đăng nhập / Tạo tài khoản */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 max-w-sm mx-auto w-full shadow-inner">
                {tabs.map((tab) => {
                  const isActive = tab.key === activeTab;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => onTabChange(tab.key)}
                      className={`flex-1 py-2 text-xs rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white font-bold shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Form nội dung */}
              <div className="max-w-sm mx-auto w-full">{children}</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer nhỏ */}
      <footer className="max-w-5xl mx-auto w-full mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
        PixelLog © 2026 • Game Library & AI Advisor Platform
      </footer>
    </div>
  );
}
