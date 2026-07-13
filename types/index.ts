export type Role =
  | "fan"
  | "volunteer"
  | "staff"
  | "organizer"
  | "security"
  | "medical"
  | "admin";

export interface RoleInfo {
  id: Role;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export interface GateStatus {
  id: string;
  name: string;
  crowdPct: number;
  waitMinutes: number;
  status: "clear" | "moderate" | "congested";
}

export interface Incident {
  id: string;
  type: "medical" | "lost-child" | "fire" | "security" | "other";
  location: string;
  reportedAt: string;
  status: "open" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high" | "critical";
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface RouteOption {
  id: string;
  label: string;
  description: string;
  etaMinutes: number;
  crowdLevel: "low" | "medium" | "high";
  accessible: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
}
