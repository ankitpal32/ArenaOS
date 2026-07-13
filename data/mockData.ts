/**
 * UI configuration only — role metadata (labels/icons/colors) and the
 * assistant's suggested-question chips. This file intentionally does NOT
 * contain any business data (gates, incidents, routes, stats, etc.); all
 * of that now comes from Supabase via lib/supabase/queries.ts and
 * hooks/useSupabaseData.ts.
 */
import { RoleInfo } from "@/types";

export const ROLES: RoleInfo[] = [
  {
    id: "fan",
    label: "Fan",
    description: "Find your seat, explore the venue, and get help fast.",
    icon: "Ticket",
    color: "#F5A623",
  },
  {
    id: "volunteer",
    label: "Volunteer",
    description: "Assist attendees and respond to on-ground requests.",
    icon: "HeartHandshake",
    color: "#2FAE66",
  },
  {
    id: "staff",
    label: "Staff",
    description: "Run day-to-day venue operations and logistics.",
    icon: "ClipboardList",
    color: "#4C8DFF",
  },
  {
    id: "organizer",
    label: "Organizer",
    description: "Monitor the full event from a single control center.",
    icon: "LayoutDashboard",
    color: "#B980F0",
  },
  {
    id: "security",
    label: "Security",
    description: "Track incidents and coordinate rapid response.",
    icon: "ShieldAlert",
    color: "#E5484D",
  },
  {
    id: "medical",
    label: "Medical",
    description: "Manage medical calls and dispatch aid on site.",
    icon: "Stethoscope",
    color: "#37C6D0",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Full visibility across every dashboard, user, and role.",
    icon: "ShieldCheck",
    color: "#F5A623",
  },
];

export function getRole(id: string | undefined): RoleInfo {
  return ROLES.find((r) => r.id === id) ?? ROLES[0];
}

export const SUGGESTED_QUESTIONS = [
  "Where is Gate 14?",
  "Where is my seat?",
  "Nearest restroom?",
  "Best route to the exit?",
  "Where can I refill water?",
  "Is Gate 9 crowded right now?",
];
