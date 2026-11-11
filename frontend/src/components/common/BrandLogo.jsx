import logoBrand from "../../assets/logo-brand.png";

export default function BrandLogo({ className = "", size = "md" }) {
  const heightClass =
    size === "sm"
      ? "h-10 sm:h-12"
      : size === "lg"
      ? "h-12 sm:h-16"
      : "h-10 sm:h-[52px]";

  return (
    <span
      className={`inline-flex items-center rounded-xl overflow-hidden bg-[#0e1e2c] border border-zinc-200/80 dark:border-zinc-800/90 shrink-0 ${className}`}
    >
      <img
        src={logoBrand}
        alt="PixelLog Game Library"
        className={`${heightClass} w-auto object-contain select-none block`}
        loading="eager"
      />
    </span>
  );
}
