import { FLAVORS, type FlavorKey } from "@/lib/flavors";

export function FlavorBadge({ flavor, size = "sm" }: { flavor: string; size?: "sm" | "md" }) {
  const f = FLAVORS[flavor as FlavorKey];
  if (!f) return null;

  const sizeClasses = size === "md"
    ? "px-3 py-1 text-xs"
    : "px-2 py-0.5 text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium tracking-wide uppercase ${sizeClasses}`}
      style={{
        backgroundColor: f.color + "10",
        color: f.color,
        border: `1px solid ${f.color}20`,
      }}
      title={f.hint}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: f.color }} />
      {f.label}
    </span>
  );
}
