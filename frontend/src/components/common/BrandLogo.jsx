import logoSvg from "../../assets/pixellog-logo.svg";

export default function BrandLogo({ className = "", size = "md" }) {
  const heightClass =
    size === "sm"
      ? "h-9 sm:h-10"
      : size === "lg"
      ? "h-12 sm:h-14"
      : "h-10 sm:h-11";

  return (
    <img
      src={logoSvg}
      alt="PixelLog Game Library"
      className={`${heightClass} w-auto object-contain select-none block shrink-0 ${className}`}
      loading="eager"
    />
  );
}
