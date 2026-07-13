import clsx from "clsx";

type Tone = "green" | "amber" | "red" | "blue" | "purple" | "cyan" | "neutral";

const TONE_MAP: Record<Tone, string> = {
  green: "bg-[rgba(47,174,102,0.14)] text-[var(--arena-green)] border-[rgba(47,174,102,0.35)]",
  amber: "bg-[rgba(245,166,35,0.14)] text-[var(--arena-amber)] border-[rgba(245,166,35,0.35)]",
  red: "bg-[rgba(229,72,77,0.14)] text-[var(--arena-red)] border-[rgba(229,72,77,0.35)]",
  blue: "bg-[rgba(76,141,255,0.14)] text-[var(--arena-blue)] border-[rgba(76,141,255,0.35)]",
  purple: "bg-[rgba(185,128,240,0.14)] text-[var(--arena-purple)] border-[rgba(185,128,240,0.35)]",
  cyan: "bg-[rgba(55,198,208,0.14)] text-[var(--arena-cyan)] border-[rgba(55,198,208,0.35)]",
  neutral: "bg-[rgba(147,161,192,0.12)] text-[var(--arena-fog)] border-[rgba(147,161,192,0.3)]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide",
        TONE_MAP[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  const map: Record<string, Tone> = {
    clear: "green",
    moderate: "amber",
    congested: "red",
    open: "red",
    "in-progress": "amber",
    resolved: "green",
    low: "green",
    medium: "amber",
    high: "red",
    critical: "red",
  };
  return map[status] ?? "neutral";
}
