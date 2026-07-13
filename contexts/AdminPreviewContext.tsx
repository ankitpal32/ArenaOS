"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role } from "@/types";

interface AdminPreviewContextValue {
  previewRole: Role | null;
  setPreviewRole: (role: Role | null) => void;
}

const AdminPreviewContext = createContext<AdminPreviewContextValue | undefined>(undefined);

const STORAGE_KEY = "arenaos-admin-preview-role";

export function AdminPreviewProvider({ children }: { children: ReactNode }) {
  const [previewRole, setPreviewRoleState] = useState<Role | null>(() => {
    if (typeof window === "undefined") return null;
    return (window.sessionStorage.getItem(STORAGE_KEY) as Role | null) ?? null;
  });

  function setPreviewRole(role: Role | null) {
    setPreviewRoleState(role);
    if (role) window.sessionStorage.setItem(STORAGE_KEY, role);
    else window.sessionStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AdminPreviewContext.Provider value={{ previewRole, setPreviewRole }}>
      {children}
    </AdminPreviewContext.Provider>
  );
}

export function useAdminPreview() {
  const ctx = useContext(AdminPreviewContext);
  if (!ctx) throw new Error("useAdminPreview must be used within <AdminPreviewProvider>");
  return ctx;
}
