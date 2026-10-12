// Khung dùng chung cho Login/Register — cột trái là "catalog" giới thiệu sản phẩm,
// cột phải là thẻ chứa form. Không chứa logic form, chỉ nhận children là form cần hiển thị.
export default function AuthLayout({ activeTab, onTabChange, children }) {
  const tabs = [
    { key: 'login', label: 'Log in' },
    { key: 'register', label: 'Create account' },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F5F8FF] text-[#14213D] font-serif">
      <div className="mx-auto max-w-[1200px] px-8 py-16 md:py-20 flex flex-wrap gap-16 items-start">

        {/* Cột hero — giới thiệu sản phẩm bằng nội dung thật, không phải trang trí */}
        <div className="flex-[999_1_480px] min-w-0 pt-2">
          <div className="font-mono font-bold text-5xl md:text-[56px] leading-[1.05] tracking-tight">
            PixelLog
          </div>
          <div className="mt-2.5 h-[3px] w-[72px] bg-[#14213D]" />
          <p className="mt-5 text-[17px] leading-relaxed max-w-[460px]">
            Catalog what you play. Find what's next.
          </p>

          <div className="mt-12">
            <div className="font-mono text-[13px] text-[#5B6B8C] mb-3">Recently logged</div>
            <CatalogRow no="0184" title="Hollow Knight" status="Backlog" />
            <CatalogRow no="0912" title="Elden Ring" status="Playing" highlight />
            <CatalogRow no="1140" title="Stardew Valley" status="Completed" />
            <CatalogRow no="0027" title="Celeste" status="Playing" highlight />
          </div>

          <p className="mt-8 italic text-[#5B6B8C] text-[15px] leading-relaxed max-w-[440px]">
            Every game you've played, started, or meant to get back to — in one shelf.
          </p>
        </div>

        {/* Cột thẻ — tab chuyển Login/Register + form */}
        <div className="flex-[1_1_380px] min-w-[320px] max-w-[420px]">
          <div className="flex gap-6">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  className={`bg-transparent border-0 pb-2.5 font-mono text-[15px] cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-[#14213D] font-bold border-[#2D5FEA]'
                      : 'text-[#5B6B8C] font-normal border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="bg-[#FFFFFF] border border-[#D7E3FA] border-t-0 p-8 rounded-sm">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}

function CatalogRow({ no, title, status, highlight }) {
  return (
    <div className="flex gap-5 py-2.5 border-b border-[#D7E3FA] items-baseline">
      <div className="font-mono text-[13px] text-[#5B6B8C] w-14 shrink-0">{no}</div>
      <div className="flex-1 text-[16px]">{title}</div>
      <div
        className={`font-mono text-[13px] w-24 text-right shrink-0 ${
          highlight ? 'text-[#2D5FEA]' : 'text-[#5B6B8C]'
        }`}
      >
        {status}
      </div>
    </div>
  );
}
