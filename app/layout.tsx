import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdminPreviewProvider } from "@/contexts/AdminPreviewContext";

export const metadata: Metadata = {
  title: "ArenaOS — Stadium Operations Intelligence",
  description:
    "ArenaOS is the AI-powered operating system for live events — navigation, crowd intelligence, and emergency response in one control layer.",
};

// Runs before paint so the correct theme is applied with zero flash. Kept
// tiny and dependency-free on purpose — this executes ahead of React.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("arenaos-theme");
    var theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <AuthProvider>
          <ThemeProvider>
            <AdminPreviewProvider>{children}</AdminPreviewProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
