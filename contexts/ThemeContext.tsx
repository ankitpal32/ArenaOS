"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Theme = "light" | "dark";
const STORAGE_KEY = "arenaos-theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  // The blocking script in app/layout.tsx already set this attribute before
  // paint, so we just mirror it into React state — no flash, no mismatch.
  const attr = document.documentElement.dataset.theme;
  return attr === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);
  const { user, profile } = useAuth();

  // When a profile loads with a saved theme preference, adopt it (e.g. the
  // user set their theme on another device).
  useEffect(() => {
    if (profile) {
      const supabase = createClient();
      if (!supabase) return;
      supabase
        .from("user_preferences")
        .select("theme")
        .eq("user_id", profile.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.theme && data.theme !== theme) {
            setThemeState(data.theme);
            document.documentElement.dataset.theme = data.theme;
            window.localStorage.setItem(STORAGE_KEY, data.theme);
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      document.documentElement.dataset.theme = next;
      window.localStorage.setItem(STORAGE_KEY, next);

      if (user) {
        const supabase = createClient();
        supabase?.from("user_preferences").update({ theme: next }).eq("user_id", user.id).then();
      }
    },
    [user]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
