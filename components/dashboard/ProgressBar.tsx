import clsx from "clsx";

export function ProgressBar({
  pct,
  tone = "amber",
}: {
  pct: number;
  tone?: "amber" | "green" | "red" | "blue";
}) {
  const colorMap: Record<string, string> = {
    amber: "var(--arena-amber)",
    green: "var(--arena-green)",
    red: "var(--arena-red)",
    blue: "var(--arena-blue)",
  };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--arena-navy)]">
      <div
        className={clsx("h-full rounded-full transition-all")}
        style={{ width: `${Math.min(100, pct)}%`, background: colorMap[tone] }}
      />
    </div>
  );
}
