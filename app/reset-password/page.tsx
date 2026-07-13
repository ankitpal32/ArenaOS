"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/layout/AuthShell";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updatePassword } from "@/lib/supabase/auth";
import { KeyRound, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await updatePassword(password);
    setLoading(false);

    if (updateError) {
      setError(updateError);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 1800);
  }

  return (
    <AuthShell
      eyebrow="Reset access"
      title="Set a new password"
      subtitle="Choose a new password for your ArenaOS account."
      footer={
        <>
          Changed your mind?{" "}
          <Link href="/login" className="text-[var(--arena-amber)] hover:underline">
            Back to log in
          </Link>
        </>
      }
    >
      {done ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-[var(--arena-green)]/30 bg-[var(--arena-green)]/10 px-5 py-8 text-center">
          <CheckCircle2 className="text-[var(--arena-green)]" size={28} />
          <p className="text-sm text-[var(--arena-white)]">
            Password updated. Redirecting you to log in…
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="New password" htmlFor="password" hint="At least 8 characters.">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm password" htmlFor="confirm">
            <Input
              id="confirm"
              name="confirm"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </Field>

          {error && (
            <p className="rounded-lg border border-[var(--arena-red)]/30 bg-[var(--arena-red)]/10 px-3 py-2 text-xs text-[var(--arena-red)]">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full py-3" disabled={loading}>
            {loading ? "Updating…" : (
              <>
                Update password <KeyRound size={16} />
              </>
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
