export const SimulationService = {
  async tick(): Promise<{ ok: boolean; changes?: string[]; error?: string }> {
    try {
      const res = await fetch("/api/simulate", { method: "POST" });
      return await res.json();
    } catch {
      return { ok: false, error: "Simulation request failed." };
    }
  },
};
