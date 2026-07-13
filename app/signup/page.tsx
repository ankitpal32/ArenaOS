"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/layout/AuthShell";
import { Field, Input, PasswordInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PasswordStrengthMeter, scorePassword } from "@/components/ui/PasswordStrengthMeter";
import { UserPlus, AlertCircle, Mail } from "lucide-react";
import { signUp } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);

  const emailValid = EMAIL_RE.test(email);
  const showEmailError = emailTouched && email.length > 0 && !emailValid;
  const passwordsMatch = password === confirm;
  const showConfirmError = confirmTouched && confirm.length > 0 && !passwordsMatch;
  const strength = scorePassword(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!emailValid) {
      setEmailTouched(true);
      return;
    }
    if (!passwordsMatch) {
      setConfirmTouched(true);
      setError("Passwords don't match.");
      return;
    }
    if (strength < 2) {
      setError("Choose a stronger password.");
      return;
    }

    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name"));

    const { error: authError, needsEmailConfirmation } = await signUp(email, password, name);
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    if (needsEmailConfirmation) {
      // Supabase requires email confirmation before a session exists, so we
      // show a real "check your inbox" state rather than assuming success.
      setEmailSent(true);
    } else {
      router.push("/role-select");
    }
  }

  if (emailSent) {
    return (
      <AuthShell
        eyebrow="Almost there"
        title="Check your inbox"
        subtitle=""
        footer={
          <>
            Wrong email?{" "}
            <button onClick={() => setEmailSent(false)} className="text-[var(--arena-amber)] hover:underline">
              Go back
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-3 rounded-lg border border-[var(--arena-green)]/30 bg-[var(--arena-green)]/10 px-5 py-8 text-center">
          <Mail className="text-[var(--arena-green)]" size={28} />
          <p className="text-sm text-[var(--arena-white)]">
            We sent a confirmation link to <strong>{email}</strong>. Click it
            to activate your account, then log in.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Join ArenaOS"
      subtitle="Set up access for your venue in a couple of minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--arena-amber)] hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <Field label="Full name" htmlFor="name">
          <Input id="name" name="name" type="text" placeholder="Jordan Rivera" required autoComplete="name" />
        </Field>

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@venue.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            aria-invalid={showEmailError}
            className={showEmailError ? "border-[var(--arena-red)]" : undefined}
          />
          {showEmailError && (
            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--arena-red)]">
              <AlertCircle size={12} /> Enter a valid email address.
            </p>
          )}
        </Field>

        <Field label="Password" htmlFor="password" hint="At least 8 characters, mix of cases, numbers, symbols.">
          <PasswordInput
            id="password"
            name="password"
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-2">
            <PasswordStrengthMeter password={password} />
          </div>
        </Field>

        <Field label="Confirm password" htmlFor="confirm">
          <PasswordInput
            id="confirm"
            name="confirm"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => setConfirmTouched(true)}
            aria-invalid={showConfirmError}
            className={showConfirmError ? "border-[var(--arena-red)]" : undefined}
          />
          {showConfirmError && (
            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--arena-red)]">
              <AlertCircle size={12} /> Passwords don&apos;t match.
            </p>
          )}
        </Field>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-[var(--arena-red)]/30 bg-[var(--arena-red)]/10 px-3 py-2 text-xs text-[var(--arena-red)]"
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}

        <label className="flex items-start gap-2 text-sm text-[var(--arena-fog)]">
          <input type="checkbox" className="mt-0.5 accent-[var(--arena-amber)]" required />
          I agree to the terms of service and privacy policy.
        </label>

        <Button type="submit" variant="primary" className="mt-1 w-full py-3" disabled={loading}>
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creating account…
            </>
          ) : (
            <>
              Create account <UserPlus size={16} />
            </>
          )}
        </Button>
      </form>

      {!isSupabaseConfigured && (
        <p className="mt-5 text-center text-xs text-[var(--arena-red)]">
          No database connected — sign-up is unavailable until Supabase is configured.
        </p>
      )}
    </AuthShell>
  );
}
