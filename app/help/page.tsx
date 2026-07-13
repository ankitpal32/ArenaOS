import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LifeBuoy, Mail, MessageCircle, BookOpen } from "lucide-react";

const TOPICS = [
  {
    icon: BookOpen,
    title: "Getting started",
    body: "Sign up, pick your role, and your dashboard adapts automatically — fans see seats and navigation, organizers see the control center.",
  },
  {
    icon: MessageCircle,
    title: "Using the AI assistant",
    body: "Ask about gates, restrooms, or the best route out — the assistant answers using live venue data.",
  },
  {
    icon: LifeBuoy,
    title: "Reporting an incident",
    body: "Volunteers, staff, security, and medical roles can report and resolve incidents from the Emergency Response module.",
  },
];

export default function HelpPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--arena-amber)]">
            Support
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[var(--arena-white)] sm:text-5xl">
            Help & Support
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--arena-fog)]">
            Answers to common questions, or reach out directly if you&apos;re stuck.
          </p>

          <div className="mt-12 flex flex-col gap-4">
            {TOPICS.map((topic) => (
              <div
                key={topic.title}
                className="flex gap-4 rounded-xl border border-[var(--arena-line)] bg-[var(--arena-panel)] p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--arena-amber)]/15 text-[var(--arena-amber)]">
                  <topic.icon size={18} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-[var(--arena-white)]">
                    {topic.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--arena-fog)]">{topic.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-[var(--arena-line)] bg-[var(--arena-navy-light)] p-6">
            <Mail size={18} className="text-[var(--arena-fog)]" />
            <p className="text-sm text-[var(--arena-fog)]">
              Still need help? Email{" "}
              <a href="mailto:support@arenaos.app" className="text-[var(--arena-amber)] hover:underline">
                support@arenaos.app
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
