import ThemeToggle from '../../../components/common/ThemeToggle';

// Khung dùng chung cho Login/Register — theo mẫu split-screen:
// cột trái là panel thương hiệu (luôn nền tối, không đổi theo theme),
// cột phải là form, đổi sáng/tối qua nút ThemeToggle.
export default function AuthLayout({ activeTab, onTabChange, children }) {
  const tabs = [
    { key: 'login', label: 'Log in' },
    { key: 'register', label: 'Create account' },
  ];

  return (
    <div className="min-h-screen w-full flex font-serif bg-[#F5F8FF] dark:bg-[#180744]">

      {/* Cột hero — cố định nền tối, giữ bản sắc thương hiệu bất kể theme */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col justify-between -bg-linear-60 from-[#0F172A] via-[#312E81] to-[#581C87] px-12 py-16 text-[#F5F8FF]">
        <div>
          <div className="font-mono font-bold text-4xl tracking-tight">PixelLog</div>
        </div>

        <div>
          <p className="font-serif italic text-5xl leading-snug text-[#F5F8FF]/90 max-w-[380px]">
            Catalog what you play.
            <br />
            Find what's next.
          </p>

        </div>

        <p className="font-mono text-xs text-[#f3f4f7]">© 2026 PixelLog</p>
      </div>

      {/* Cột form */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex justify-end px-6 py-5 lg:px-10">
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-[400px]">
            <div className="flex gap-6">
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onTabChange(tab.key)}
                    className={`bg-transparent border-0 pb-2.5 font-mono text-[15px] cursor-pointer border-b-2 transition-colors ${
                      isActive
                        ? 'text-[#14213D] dark:text-[#EAF0FF] font-bold border-[#2D5FEA] dark:border-[#3DA9FC]'
                        : 'text-[#5B6B8C] font-normal border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="bg-[#FFFFFF] dark:bg-[#121A2B] border border-[#888b91] dark:border-[#243356] border-t-0 p-8 rounded-2xl mt-5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogRow({ no, title, status, highlight }) {
  return (
    <div className="flex gap-5 py-2.5 border-b border-[#243356] items-baseline">
      <div className="font-mono text-[13px] text-[#5B6B8C] w-14 shrink-0">{no}</div>
      <div className="flex-1 text-[16px] text-[#F5F8FF]/90">{title}</div>
      <div
        className={`font-mono text-[13px] w-24 text-right shrink-0 ${
          highlight ? 'text-[#3DA9FC]' : 'text-[#5B6B8C]'
        }`}
      >
        {status}
      </div>
    </div>
  );
}
