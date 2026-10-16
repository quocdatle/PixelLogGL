// Input dùng chung cho mọi form trong module auth — giữ 1 style nhất quán,
// tránh mỗi form tự viết lại class Tailwind khác nhau.
export default function FormField({ label, id, error, ...inputProps }) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block font-mono text-xs text-[#5B6B8C] dark:text-[#8DA0C7] mb-1.5">
        {label}
      </label>
      <input
        id={id}
        className="w-full box-border px-3.5 py-3 bg-[#EEF4FF] dark:bg-[#1A2440] border border-[#D7E3FA] dark:border-[#243356] rounded-sm font-serif text-[15px] text-[#14213D] dark:text-[#EAF0FF] placeholder:text-[#8FA3C8] dark:placeholder:text-[#5B6B8C] focus:outline focus:outline-2 focus:outline-[#2D5FEA] dark:focus:outline-[#3DA9FC] focus:outline-offset-2"
        {...inputProps}
      />
      {error && <p className="mt-1.5 text-[13px] text-[#2D5FEA] dark:text-[#3DA9FC]">{error}</p>}
    </div>
  );
}
