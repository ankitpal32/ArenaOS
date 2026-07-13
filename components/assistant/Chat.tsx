"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User } from "lucide-react";
import { SUGGESTED_QUESTIONS } from "@/data/mockData";
import { AIService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import type { ChatMessage } from "@/types";
import { Card } from "@/components/ui/Card";

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function Chat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I'm the ArenaOS assistant. Ask me about gates, seats, restrooms, food, or the best route out of here.",
      timestamp: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || thinking) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      timestamp: now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    // Calls /api/assistant via AIService, which uses a real Anthropic model
    // (grounded in the signed-in user's role, ticket, match, and weather
    // context) when ANTHROPIC_API_KEY is set, and says so plainly otherwise.
    const { reply } = await AIService.ask(
      question,
      { role: profile?.role ?? "fan", fullName: profile?.full_name },
      [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))
    );
    const answer = reply;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        timestamp: now(),
      },
    ]);
    setThinking(false);
  }

  return (
    <Card className="flex h-[600px] flex-col p-0">
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "assistant"
                    ? "bg-[var(--arena-amber)]/15 text-[var(--arena-amber)]"
                    : "bg-[var(--arena-blue)]/15 text-[var(--arena-blue)]"
                }`}
              >
                {msg.role === "assistant" ? <Sparkles size={15} /> : <User size={15} />}
              </div>
              <div className={`max-w-[75%] ${msg.role === "user" ? "text-right" : ""}`}>
                <div
                  className={`inline-block rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "border border-[var(--arena-line)] bg-[var(--arena-navy)] text-[var(--arena-white)]"
                      : "bg-[var(--arena-amber)] text-[#1a1206]"
                  }`}
                >
                  {msg.content}
                </div>
                <p className="mt-1 font-mono text-[10px] text-[var(--arena-fog)]">
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--arena-amber)]/15 text-[var(--arena-amber)]">
                <Sparkles size={15} />
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[var(--arena-line)] bg-[var(--arena-navy)] px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[var(--arena-fog)] pulse-dot"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-[var(--arena-line)] px-5 py-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="rounded-full border border-[var(--arena-line)] px-3 py-1.5 font-mono text-[11px] text-[var(--arena-fog)] transition-colors hover:border-[var(--arena-amber)]/50 hover:text-[var(--arena-white)]"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ArenaOS anything…"
            className="flex-1 rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] px-3.5 py-2.5 text-sm text-[var(--arena-white)] outline-none placeholder:text-[var(--arena-fog)]/60 focus:border-[var(--arena-amber)]"
          />
          <button
            type="submit"
            disabled={thinking || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--arena-amber)] text-[#1a1206] transition-opacity disabled:opacity-40"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </Card>
  );
}
