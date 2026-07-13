"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/layout/AuthShell";
import { Field, Input, PasswordInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LogIn, AlertCircle, CheckCircle2 } from "lucide-react";
import { signIn } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const emailValid = EMAIL_RE.test(email);
  const showEmailError = emailTouched && email.length > 0 && !emailValid;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!emailValid) {
      setEmailTouched(true);
      return;
    }

    setLoading(true);
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));

    const { error: authError } = await signIn(email, password, rememberMe);
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/role-select"), 500);
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to ArenaOS"
      subtitle="Enter your credentials to access your venue console."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[var(--arena-amber)] hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
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
            aria-describedby={showEmailError ? "email-error" : undefined}
            className={showEmailError ? "border-[var(--arena-red)]" : undefined}
          />
          {showEmailError && (
            <p id="email-error" className="mt-1 flex items-center gap-1 text-xs text-[var(--arena-red)]">
              <AlertCircle size={12} /> Enter a valid email address.
            </p>
          )}
        </Field>

        <Field label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            name="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </Field>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-[var(--arena-red)]/30 bg-[var(--arena-red)]/10 px-3 py-2 text-xs text-[var(--arena-red)]"
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}
        {success && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-lg border border-[var(--arena-green)]/30 bg-[var(--arena-green)]/10 px-3 py-2 text-xs text-[var(--arena-green)]"
          >
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Signed in — redirecting…
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[var(--arena-fog)]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-[var(--arena-amber)]"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-[var(--arena-amber)] hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="mt-1 w-full py-3" disabled={loading || success}>
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Signing in…
            </>
          ) : (
            <>
              Log in <LogIn size={16} />
            </>
          )}
        </Button>
      </form>

      {!isSupabaseConfigured && (
        <p className="mt-5 text-center text-xs text-[var(--arena-red)]">
          No database connected — sign-in is unavailable until Supabase is configured.
        </p>
      )}
    </AuthShell>
  );
}
