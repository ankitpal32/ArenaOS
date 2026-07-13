import { DatabaseZap, Inbox } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function LoadingBlock({ label = "Loading live data…" }: { label?: string }) {
  return (
    <Card className="flex items-center justify-center gap-3 py-10 text-sm text-[var(--arena-fog)]">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--arena-amber)]" />
      {label}
    </Card>
  );
}

export function EmptyBlock({ label = "Nothing here yet." }: { label?: string }) {
  return (
    <Card className="flex flex-col items-center gap-2 py-10 text-center">
      <Inbox size={20} className="text-[var(--arena-fog)]" />
      <p className="text-sm text-[var(--arena-fog)]">{label}</p>
    </Card>
  );
}

export function NotConfiguredBlock({
  what = "this data",
}: {
  what?: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-2 border-[var(--arena-amber)]/25 bg-[var(--arena-amber)]/5 py-10 text-center">
      <DatabaseZap size={20} className="text-[var(--arena-amber)]" />
      <p className="text-sm text-[var(--arena-white)]">
        Database not connected
      </p>
      <p className="max-w-sm text-xs text-[var(--arena-fog)]">
        Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{" "}
        (or <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) in{" "}
        <code className="font-mono">.env.local</code> to load {what} from Supabase.
      </p>
    </Card>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <Card className="flex flex-col items-center gap-2 border-[var(--arena-red)]/25 bg-[var(--arena-red)]/5 py-10 text-center">
      <p className="text-sm text-[var(--arena-red)]">Couldn&apos;t load this data</p>
      <p className="max-w-sm text-xs text-[var(--arena-fog)]">{message}</p>
    </Card>
  );
}
