import { NavItem, Role } from "@/types";

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["fan", "volunteer", "staff", "organizer", "security", "medical", "admin"],
  },
  {
    label: "Admin Overview",
    href: "/dashboard/admin",
    icon: "ShieldCheck",
    roles: ["admin"],
  },
  {
    label: "Fan Dashboard",
    href: "/dashboard/fan",
    icon: "Ticket",
    roles: ["fan"],
  },
  {
    label: "AI Assistant",
    href: "/dashboard/assistant",
    icon: "Sparkles",
    roles: ["fan", "volunteer", "staff", "organizer", "security", "medical", "admin"],
  },
  {
    label: "Navigation",
    href: "/dashboard/navigation",
    icon: "Compass",
    roles: ["fan", "volunteer", "staff"],
  },
  {
    label: "Crowd Intelligence",
    href: "/dashboard/crowd",
    icon: "Waves",
    roles: ["staff", "organizer", "security", "volunteer", "admin"],
  },
  {
    label: "Emergency Response",
    href: "/dashboard/emergency",
    icon: "Siren",
    roles: ["volunteer", "security", "medical", "organizer", "staff"],
  },
  {
    label: "Organizer Control",
    href: "/dashboard/organizer",
    icon: "Radar",
    roles: ["organizer"],
  },
  {
    label: "Accessibility",
    href: "/dashboard/accessibility",
    icon: "Accessibility",
    roles: ["fan", "volunteer", "staff", "organizer"],
  },
  {
    label: "Transport",
    href: "/dashboard/transport",
    icon: "Bus",
    roles: ["fan", "staff", "organizer"],
  },
  {
    label: "Sustainability",
    href: "/dashboard/sustainability",
    icon: "Leaf",
    roles: ["organizer", "staff"],
  },
];

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
