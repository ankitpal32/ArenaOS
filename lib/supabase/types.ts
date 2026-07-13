/**
 * Hand-written types mirroring `supabase/schema.sql`.
 *
 * If you have the Supabase CLI installed, you can regenerate this file
 * automatically instead of maintaining it by hand:
 *
 *   supabase gen types typescript --project-id <your-project-ref> > lib/supabase/types.ts
 */

export type Role =
  | "fan"
  | "volunteer"
  | "staff"
  | "organizer"
  | "security"
  | "medical"
  | "admin";

export type IncidentType = "lost-child" | "medical" | "fire" | "security";
export type IncidentPriority = "low" | "medium" | "high";
export type IncidentStatus = "open" | "in-progress" | "resolved";
export type GateStatusValue = "clear" | "moderate" | "congested";
export type CrowdLevel = "low" | "medium" | "high";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: Role;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: Role;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: Role;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      gates: {
        Row: {
          id: string;
          name: string;
          crowd_pct: number;
          wait_minutes: number;
          status: GateStatusValue;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          crowd_pct?: number;
          wait_minutes?: number;
          status?: GateStatusValue;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          crowd_pct?: number;
          wait_minutes?: number;
          status?: GateStatusValue;
          updated_at?: string;
        };
        Relationships: [];
      };
      incidents: {
        Row: {
          id: string;
          type: IncidentType;
          location: string;
          summary: string | null;
          priority: IncidentPriority;
          status: IncidentStatus;
          reported_by: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          type: IncidentType;
          location: string;
          summary?: string | null;
          priority?: IncidentPriority;
          status?: IncidentStatus;
          reported_by?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          type?: IncidentType;
          location?: string;
          summary?: string | null;
          priority?: IncidentPriority;
          status?: IncidentStatus;
          reported_by?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
        Relationships: [];
      };
      routes: {
        Row: {
          id: string;
          label: string;
          description: string | null;
          eta_minutes: number;
          crowd_level: CrowdLevel;
          accessible: boolean;
        };
        Insert: {
          id: string;
          label: string;
          description?: string | null;
          eta_minutes: number;
          crowd_level?: CrowdLevel;
          accessible?: boolean;
        };
        Update: {
          id?: string;
          label?: string;
          description?: string | null;
          eta_minutes?: number;
          crowd_level?: CrowdLevel;
          accessible?: boolean;
        };
        Relationships: [];
      };
      sustainability_metrics: {
        Row: {
          id: string;
          event_date: string;
          water_litres: number;
          water_target_litres: number;
          energy_kwh: number;
          energy_target_kwh: number;
          waste_pct_diverted: number;
        };
        Insert: {
          id?: string;
          event_date?: string;
          water_litres?: number;
          water_target_litres?: number;
          energy_kwh?: number;
          energy_target_kwh?: number;
          waste_pct_diverted?: number;
        };
        Update: {
          id?: string;
          event_date?: string;
          water_litres?: number;
          water_target_litres?: number;
          energy_kwh?: number;
          energy_target_kwh?: number;
          waste_pct_diverted?: number;
        };
        Relationships: [];
      };
      venue_stats: {
        Row: {
          id: boolean;
          attendance_current: number;
          attendance_capacity: number;
          parking_full_pct: number;
          transport_on_time_pct: number;
          incidents_resolved: number;
          volunteers_active: number;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          attendance_current?: number;
          attendance_capacity?: number;
          parking_full_pct?: number;
          transport_on_time_pct?: number;
          incidents_resolved?: number;
          volunteers_active?: number;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          attendance_current?: number;
          attendance_capacity?: number;
          parking_full_pct?: number;
          transport_on_time_pct?: number;
          incidents_resolved?: number;
          volunteers_active?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      crowd_trend_points: {
        Row: {
          id: string;
          label: string;
          pct: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          pct: number;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          pct?: number;
          recorded_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          user_id: string;
          voice_guidance: boolean;
          live_captions: boolean;
          notify_email: boolean;
          notify_push: boolean;
          theme: "light" | "dark";
          language: string;
          profile_visible: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          voice_guidance?: boolean;
          live_captions?: boolean;
          notify_email?: boolean;
          notify_push?: boolean;
          theme?: "light" | "dark";
          language?: string;
          profile_visible?: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          voice_guidance?: boolean;
          live_captions?: boolean;
          notify_email?: boolean;
          notify_push?: boolean;
          theme?: "light" | "dark";
          language?: string;
          profile_visible?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      tickets: {
        Row: {
          id: string;
          user_id: string;
          event_name: string;
          seat: string | null;
          status: "active" | "used" | "cancelled";
          qr_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_name: string;
          seat?: string | null;
          status?: "active" | "used" | "cancelled";
          qr_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_name?: string;
          seat?: string | null;
          status?: "active" | "used" | "cancelled";
          qr_code?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [];
      };
      parking_lots: {
        Row: {
          id: string;
          name: string;
          pct: number;
          status: string;
          accessible: boolean;
        };
        Insert: {
          id: string;
          name: string;
          pct?: number;
          status?: string;
          accessible?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          pct?: number;
          status?: string;
          accessible?: boolean;
        };
        Relationships: [];
      };
      shuttles: {
        Row: {
          id: string;
          route: string;
          eta_minutes: number;
          crowd_level: CrowdLevel;
        };
        Insert: {
          id: string;
          route: string;
          eta_minutes: number;
          crowd_level?: CrowdLevel;
        };
        Update: {
          id?: string;
          route?: string;
          eta_minutes?: number;
          crowd_level?: CrowdLevel;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          home_team: string;
          away_team: string;
          status: "scheduled" | "live" | "halftime" | "finished";
          starts_at: string;
          score_home: number;
          score_away: number;
          venue_section: string | null;
        };
        Insert: {
          id?: string;
          home_team: string;
          away_team: string;
          status?: "scheduled" | "live" | "halftime" | "finished";
          starts_at: string;
          score_home?: number;
          score_away?: number;
          venue_section?: string | null;
        };
        Update: {
          id?: string;
          home_team?: string;
          away_team?: string;
          status?: "scheduled" | "live" | "halftime" | "finished";
          starts_at?: string;
          score_home?: number;
          score_away?: number;
          venue_section?: string | null;
        };
        Relationships: [];
      };
      weather_snapshots: {
        Row: {
          id: string;
          condition: string;
          temp_c: number;
          wind_kph: number;
          precipitation_pct: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          condition: string;
          temp_c: number;
          wind_kph?: number;
          precipitation_pct?: number;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          condition?: string;
          temp_c?: number;
          wind_kph?: number;
          precipitation_pct?: number;
          recorded_at?: string;
        };
        Relationships: [];
      };
      assignments: {
        Row: {
          id: string;
          assignee_id: string | null;
          role_target: "volunteer" | "staff";
          task: string;
          location: string | null;
          priority: "low" | "medium" | "high";
          status: "pending" | "in-progress" | "done";
          created_at: string;
        };
        Insert: {
          id?: string;
          assignee_id?: string | null;
          role_target: "volunteer" | "staff";
          task: string;
          location?: string | null;
          priority?: "low" | "medium" | "high";
          status?: "pending" | "in-progress" | "done";
          created_at?: string;
        };
        Update: {
          id?: string;
          assignee_id?: string | null;
          role_target?: "volunteer" | "staff";
          task?: string;
          location?: string | null;
          priority?: "low" | "medium" | "high";
          status?: "pending" | "in-progress" | "done";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Gate = Database["public"]["Tables"]["gates"]["Row"];
export type Incident = Database["public"]["Tables"]["incidents"]["Row"];
export type RouteRow = Database["public"]["Tables"]["routes"]["Row"];
export type SustainabilityMetric =
  Database["public"]["Tables"]["sustainability_metrics"]["Row"];
export type VenueStats = Database["public"]["Tables"]["venue_stats"]["Row"];
export type CrowdTrendPoint = Database["public"]["Tables"]["crowd_trend_points"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"];
export type ActivityLogEntry = Database["public"]["Tables"]["activity_log"]["Row"];
export type ParkingLot = Database["public"]["Tables"]["parking_lots"]["Row"];
export type Shuttle = Database["public"]["Tables"]["shuttles"]["Row"];
export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
export type WeatherSnapshot = Database["public"]["Tables"]["weather_snapshots"]["Row"];
export type Assignment = Database["public"]["Tables"]["assignments"]["Row"];
