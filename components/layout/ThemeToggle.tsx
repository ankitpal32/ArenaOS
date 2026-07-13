"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--arena-line)] bg-[var(--arena-panel)] text-[var(--arena-fog)] transition-colors hover:text-[var(--arena-white)] ${className}`}
    >
      <Sun
        size={16}
        className={`absolute transition-all duration-300 ${
          theme === "dark" ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"
        }`}
      />
      <Moon
        size={16}
        className={`absolute transition-all duration-300 ${
          theme === "light" ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 rotate-90"
        }`}
      />
    </button>
  );
}
