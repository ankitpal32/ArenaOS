export interface AIContext {
  role: string;
  fullName?: string | null;
  ticket?: { eventName: string; seat: string | null } | null;
  gate?: string;
  match?: { homeTeam: string; awayTeam: string; scoreHome: number; scoreAway: number; status: string } | null;
  weather?: { condition: string; tempC: number } | null;
}

export const AIService = {
  async ask(
    message: string,
    context: AIContext,
    history: { role: string; content: string }[] = []
  ): Promise<{ reply: string; source: string }> {
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, context, history }),
      });
      return await res.json();
    } catch {
      return { reply: "Sorry, I couldn't reach the assistant just now.", source: "error" };
    }
  },
};
