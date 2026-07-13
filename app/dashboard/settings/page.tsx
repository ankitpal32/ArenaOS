"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Input, PasswordInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ToggleRow } from "@/components/ui/Toggle";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock } from "@/components/dashboard/DataState";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { updatePassword, updateEmail, signOutAllDevices } from "@/lib/supabase/auth";
import { updateProfile, uploadAvatar, updatePreferences, deleteAccount } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";
import type { UserPreferences } from "@/lib/supabase/types";
import {
  User,
  Mail,
  Bell,
  Sun,
  Moon,
  Globe,
  ShieldCheck,
  Link2,
  LogOut,
  Trash2,
  Camera,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import clsx from "clsx";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "hi", label: "हिन्दी" },
  { code: "ar", label: "العربية" },
];

function SavedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="flex items-center gap-1 font-mono text-[11px] text-[var(--arena-green)]">
      <CheckCircle2 size={12} /> Saved
    </span>
  );
}

export default function SettingsPage() {
  const { user, profile, isSupabaseConfigured, loading: authLoading, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    const supabase = createClient();
    if (!supabase) return;
    supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setPrefs(data ?? null);
        setLoadingPrefs(false);
      });
  }, [user, isSupabaseConfigured]);

  async function savePrefs(updates: Partial<UserPreferences>) {
    if (!user || !prefs) return;
    const next = { ...prefs, ...updates };
    setPrefs(next);
    await updatePreferences(user.id, updates);
  }

  if (!isSupabaseConfigured) {
    return (
      <DashboardShell title="Settings">
        <NotConfiguredBlock what="settings" />
      </DashboardShell>
    );
  }
  if (authLoading) {
    return (
      <DashboardShell title="Settings">
        <LoadingBlock label="Loading your account…" />
      </DashboardShell>
    );
  }
  if (!user || !profile) {
    return (
      <DashboardShell title="Settings">
        <EmptyBlock label="Log in to manage your settings." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Settings">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <ProfileSection userId={user.id} profile={profile} onSaved={refreshProfile} />
        <PasswordSection />
        <EmailSection currentEmail={user.email ?? ""} />

        <Card>
          <CardHeader eyebrow="Preferences" title="Notifications" />
          {loadingPrefs || !prefs ? (
            <LoadingBlock label="Loading preferences…" />
          ) : (
            <div className="flex flex-col gap-3">
              <ToggleRow
                icon={Mail}
                label="Email notifications"
                description="Booking updates, announcements, and alerts by email"
                on={prefs.notify_email}
                onToggle={() => savePrefs({ notify_email: !prefs.notify_email })}
              />
              <ToggleRow
                icon={Bell}
                label="Push notifications"
                description="In-app notification bell updates"
                on={prefs.notify_push}
                onToggle={() => savePrefs({ notify_push: !prefs.notify_push })}
              />
            </div>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Appearance" title="Theme" />
          <div className="flex gap-3">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  if (prefs) savePrefs({ theme: t });
                }}
                className={clsx(
                  "flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
                  theme === t
                    ? "border-[var(--arena-amber)] bg-[var(--arena-amber)]/8"
                    : "border-[var(--arena-line)] hover:border-[var(--arena-fog)]/50"
                )}
              >
                {t === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                <span className="text-sm capitalize text-[var(--arena-white)]">{t}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Preferences" title="Language" />
          {loadingPrefs || !prefs ? (
            <LoadingBlock label="Loading preferences…" />
          ) : (
            <>
              <div className="relative">
                <Globe size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--arena-fog)]" />
                <select
                  value={prefs.language}
                  onChange={(e) => savePrefs({ language: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] py-2.5 pl-9 pr-4 text-sm text-[var(--arena-white)] outline-none focus:border-[var(--arena-amber)]"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-xs text-[var(--arena-fog)]">
                Interface translations are coming soon — your preference is saved for when they launch.
              </p>
            </>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Privacy" title="Profile visibility" />
          {loadingPrefs || !prefs ? (
            <LoadingBlock label="Loading preferences…" />
          ) : (
            <ToggleRow
              icon={ShieldCheck}
              label="Visible to organizers and staff"
              description="Turn off to hide your profile from venue staff directories"
              on={prefs.profile_visible}
              onToggle={() => savePrefs({ profile_visible: !prefs.profile_visible })}
            />
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Future-ready" title="Connected accounts" />
          <div className="flex flex-col gap-2">
            {["Google", "Apple"].map((provider) => (
              <div
                key={provider}
                className="flex items-center justify-between rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-3.5"
              >
                <span className="flex items-center gap-3 text-sm text-[var(--arena-white)]">
                  <Link2 size={16} className="text-[var(--arena-fog)]" /> {provider}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wide text-[var(--arena-fog)]">
                  Coming soon
                </span>
              </div>
            ))}
          </div>
        </Card>

        <DangerZone router={router} />
      </div>
    </DashboardShell>
  );
}

function ProfileSection({
  userId,
  profile,
  onSaved,
}: {
  userId: string;
  profile: { full_name: string | null; avatar_url: string | null };
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const { url, error: uploadError } = await uploadAvatar(userId, file);
    setUploading(false);
    if (uploadError) {
      setError(uploadError);
      return;
    }
    setAvatarUrl(url);
    await updateProfile(userId, { avatar_url: url ?? undefined });
    onSaved();
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const { error: saveError } = await updateProfile(userId, { full_name: fullName });
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardHeader eyebrow="Account" title="Profile information" />
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--arena-navy)] text-[var(--arena-fog)]">
            <User size={24} />
          </div>
        )}
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Camera size={14} /> {uploading ? "Uploading…" : "Change photo"}
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <Field label="Full name" htmlFor="full_name">
          <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1 text-xs text-[var(--arena-red)]">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <SavedBadge show={saved} />
      </div>
    </Card>
  );
}

function PasswordSection() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSaving(true);
    const { error: saveError } = await updatePassword(password);
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    setSaved(true);
    setPassword("");
    setConfirm("");
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardHeader eyebrow="Security" title="Change password" />
      <div className="flex flex-col gap-4">
        <Field label="New password" htmlFor="new_password">
          <PasswordInput
            id="new_password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <div className="mt-2">
            <PasswordStrengthMeter password={password} />
          </div>
        </Field>
        <Field label="Confirm new password" htmlFor="confirm_password">
          <PasswordInput
            id="confirm_password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1 text-xs text-[var(--arena-red)]">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <Button variant="primary" onClick={handleSave} disabled={saving || !password}>
          {saving ? "Updating…" : "Update password"}
        </Button>
        <SavedBadge show={saved} />
      </div>
    </Card>
  );
}

function EmailSection({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState(currentEmail);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    if (email === currentEmail) return;
    setSaving(true);
    const { error: saveError } = await updateEmail(email);
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    setSent(true);
  }

  return (
    <Card>
      <CardHeader eyebrow="Account" title="Email address" />
      <Field label="Email" htmlFor="email">
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>

      {error && (
        <p className="mt-2 flex items-center gap-1 text-xs text-[var(--arena-red)]">
          <AlertCircle size={12} /> {error}
        </p>
      )}
      {sent && (
        <p className="mt-2 flex items-center gap-1 text-xs text-[var(--arena-green)]">
          <CheckCircle2 size={12} /> Confirmation link sent to {email}. Click it to finish the change.
        </p>
      )}

      <div className="mt-4">
        <Button variant="primary" onClick={handleSave} disabled={saving || email === currentEmail}>
          {saving ? "Sending…" : "Change email"}
        </Button>
      </div>
    </Card>
  );
}

function DangerZone({ router }: { router: ReturnType<typeof useRouter> }) {
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogoutAll() {
    setLoggingOutAll(true);
    await signOutAllDevices();
    setLoggingOutAll(false);
    router.push("/login");
  }

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    const { error: delError } = await deleteAccount();
    setDeleting(false);
    if (delError) {
      setError(delError);
      return;
    }
    router.push("/login");
  }

  return (
    <Card className="border-[var(--arena-red)]/25">
      <CardHeader eyebrow="Danger zone" title="Account actions" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-3.5">
          <div>
            <p className="text-sm font-medium text-[var(--arena-white)]">Log out of all devices</p>
            <p className="text-xs text-[var(--arena-fog)]">Ends every active session, including this one</p>
          </div>
          <Button variant="secondary" onClick={handleLogoutAll} disabled={loggingOutAll}>
            <LogOut size={14} /> {loggingOutAll ? "Logging out…" : "Logout all"}
          </Button>
        </div>

        <div className="rounded-lg border border-[var(--arena-red)]/25 bg-[var(--arena-red)]/5 p-3.5">
          <p className="text-sm font-medium text-[var(--arena-white)]">Delete account</p>
          <p className="mt-0.5 text-xs text-[var(--arena-fog)]">
            Permanently deletes your account and all associated data. This cannot be undone.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              className="sm:max-w-[200px]"
            />
            <Button
              variant="danger"
              disabled={confirmText !== "DELETE" || deleting}
              onClick={handleDelete}
            >
              <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete account"}
            </Button>
          </div>
          {error && (
            <p className="mt-2 flex items-center gap-1 text-xs text-[var(--arena-red)]">
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
