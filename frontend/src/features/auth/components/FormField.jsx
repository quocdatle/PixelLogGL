// Input dùng chung cho mọi form trong module auth — giữ 1 style nhất quán,
// tránh mỗi form tự viết lại class Tailwind khác nhau.
export default function FormField({ label, id, error, ...inputProps }) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block font-mono text-xs text-[#5B6B8C] mb-1.5">
        {label}
      </label>
      <input
        id={id}
        className="w-full box-border px-3.5 py-3 bg-[#EEF4FF] border border-[#D7E3FA] rounded-sm font-serif text-[15px] text-[#14213D] placeholder:text-[#8FA3C8] focus:outline focus:outline-2 focus:outline-[#2D5FEA] focus:outline-offset-2"
        {...inputProps}
      />
      {error && <p className="mt-1.5 text-[13px] text-[#2D5FEA]">{error}</p>}
    </div>
  );
}
