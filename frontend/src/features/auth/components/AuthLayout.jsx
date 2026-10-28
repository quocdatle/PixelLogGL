import ThemeToggle from "../../../components/common/ThemeToggle";

// Khung dung chung cho Login va Register
export default function AuthLayout({ activeTab, onTabChange, children }) {
  const tabs = [
    { key: "login", label: "Đăng nhập" },
    { key: "register", label: "Tạo tài khoản" },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between transition-colors duration-150">
      {/* Top Header Bar voi ThemeToggle */}
      <header className="max-w-5xl mx-auto w-full mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
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
          <span className="font-extrabold text-2xl tracking-tight text-zinc-900 dark:text-white">
            Pixel
            <span className="text-emerald-500">Log</span>
          </span>
        </div>

        {/* Nut ThemeToggle */}
        <ThemeToggle />
      </header>

      {/* Main Container 2 cot */}
      <main className="max-w-5xl mx-auto w-full my-auto">
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            {/* COT TRAI: Gaming Showcase */}
            <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-zinc-50/70 dark:bg-zinc-900/60">
              <div>
                {/* Badge thong tin */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold mb-5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Kệ game thông minh và cố vấn AI cá nhân
                </div>

                {/* Tieu de va Gioi thieu */}
                <div className="flex items-center gap-3 mb-2.5">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                    Pixel<span className="text-emerald-500">Log</span>
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    GL
                  </span>
                </div>

                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed mb-6">
                  Quản lý thư viện game tập trung, nhận gợi ý trò chơi chuẩn gu từ
                  AI và mở hòm thu thập chiến lợi phẩm độc quyền.
                </p>

                {/* Danh muc Game Cards Showcase */}
                <div className="space-y-3 max-w-lg mb-6">
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    <span className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300">
                      <svg
                        className="w-3.5 h-3.5 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      GẦN ĐÂY TRONG THƯ VIỆN
                    </span>
                    <span>4 / 142 tựa game</span>
                  </div>

                  {/* Game 1: Elden Ring */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/70 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors duration-150">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-600 text-amber-50 flex items-center justify-center font-bold text-xs">
                        ER
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                          Elden Ring
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="text-amber-500 font-semibold flex items-center gap-1">
                            <StarIcon />
                            9.5
                          </span>
                          <span>•</span>
                          <span>84 giờ chơi</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Đang chơi
                    </span>
                  </div>

                  {/* Game 2: Cyberpunk 2077 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/70 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors duration-150">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-sky-600 text-sky-50 flex items-center justify-center font-bold text-xs">
                        CP
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                          Cyberpunk 2077
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="text-amber-500 font-semibold flex items-center gap-1">
                            <StarIcon />
                            9.0
                          </span>
                          <span>•</span>
                          <span>112 giờ chơi</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                      Hoàn thành
                    </span>
                  </div>

                  {/* Game 3: Hollow Knight (AI Recommendation) */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/70 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors duration-150">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-teal-700 text-teal-50 flex items-center justify-center font-bold text-xs">
                        HK
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                            Hollow Knight
                          </h2>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                            Gợi ý từ AI
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <span>Metroidvania</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            98% hợp gu
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                      Chờ chơi
                    </span>
                  </div>
                </div>
              </div>

              {/* Dong tinh nang duoi chan cot */}
              <div className="pt-4 flex items-center justify-between flex-wrap gap-4 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckIcon />
                  Đồng bộ RAWG Games
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckIcon />
                  Trợ lý AI Claude
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckIcon />
                  Chiến lợi phẩm Gacha
                </div>
              </div>
            </div>

            {/* COT PHAI: Form Container */}
            <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white dark:bg-zinc-900">
              {/* Tab Switcher */}
              <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-6 max-w-sm mx-auto w-full">
                {tabs.map((tab) => {
                  const isActive = tab.key === activeTab;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => onTabChange(tab.key)}
                      className={`flex-1 py-2 text-xs rounded-lg font-medium transition-colors duration-150 cursor-pointer ${
                        isActive
                          ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Form noi dung */}
              <div className="max-w-sm mx-auto w-full">{children}</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer nho */}
      <footer className="max-w-5xl mx-auto w-full mt-6 text-center text-xs text-zinc-500">
        PixelLog © 2026. Nền tảng quản lý game và cố vấn AI.
      </footer>
    </div>
  );
}

function StarIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 fill-current text-amber-500"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-emerald-500"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
