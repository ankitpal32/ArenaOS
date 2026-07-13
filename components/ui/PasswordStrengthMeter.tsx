import clsx from "clsx";

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export function scorePassword(password: string): PasswordStrength {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4) as PasswordStrength;
}

const LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const COLORS = [
  "var(--arena-red)",
  "var(--arena-red)",
  "var(--arena-amber)",
  "var(--arena-blue)",
  "var(--arena-green)",
];

export function PasswordStrengthMeter({ password }: { password: string }) {
  const score = scorePassword(password);
  if (!password) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={clsx("h-1 flex-1 rounded-full transition-colors duration-300")}
            style={{ background: i < score ? COLORS[score] : "var(--arena-line)" }}
          />
        ))}
      </div>
      <p className="font-mono text-[11px]" style={{ color: COLORS[score] }}>
        {LABELS[score]}
      </p>
    </div>
  );
}
