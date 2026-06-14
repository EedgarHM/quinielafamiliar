/* Bandera de una selección, servida desde flagcdn.com */

const SIZES = {
  sm: "w-6 h-4",
  md: "w-8 h-[22px]",
  lg: "w-10 h-7",
} as const;

export default function Flag({
  iso,
  name,
  size = "md",
  className = "",
}: {
  iso: string;
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${iso}.svg`}
      alt={name}
      title={name}
      loading="lazy"
      className={`${SIZES[size]} rounded-[3px] object-cover ring-1 ring-white/15 shadow-sm shrink-0 ${className}`}
    />
  );
}
