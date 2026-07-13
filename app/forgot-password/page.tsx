"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/layout/AuthShell";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MailCheck, Send } from "lucide-react";
import { sendPasswordReset } from "@/lib/supabase/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const email = String(new FormData(e.currentTarget).get("email"));
    // sendPasswordReset no-ops (and resolves with no error) when Supabase
    // isn't configured, so this keeps working as a mock flow either way.
    await sendPasswordReset(email);
    setLoading(false);
    setSent(true);
  }

  return (
    <AuthShell
      eyebrow="Reset access"
      title="Forgot your password?"
      subtitle="Enter the email on your account and we'll send a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-[var(--arena-amber)] hover:underline">
            Back to log in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-[var(--arena-green)]/30 bg-[var(--arena-green)]/10 px-5 py-8 text-center">
          <MailCheck className="text-[var(--arena-green)]" size={28} />
          <p className="text-sm text-[var(--arena-white)]">
            If an account exists for that email, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" placeholder="you@venue.com" required autoComplete="email" />
          </Field>
          <Button type="submit" variant="primary" className="w-full py-3" disabled={loading}>
            {loading ? "Sending…" : (
              <>
                Send reset link <Send size={16} />
              </>
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
