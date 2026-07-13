import { DashboardShell } from "@/components/layout/DashboardShell";
import { Chat } from "@/components/assistant/Chat";

export default function AssistantPage() {
  return (
    <DashboardShell title="AI Assistant">
      <div className="mx-auto max-w-2xl">
        <Chat />
        <p className="mt-3 text-center text-xs text-[var(--arena-fog)]">
          Requires <code className="font-mono">ANTHROPIC_API_KEY</code> in{" "}
          <code className="font-mono">.env.local</code> — grounded in live gate
          and route data from Supabase. See{" "}
          <code className="font-mono">app/api/assistant/route.ts</code>.
        </p>
      </div>
    </DashboardShell>
  );
}
