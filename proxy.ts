import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// NOTE: this project runs Next.js 16, which renamed `middleware.ts` to
// `proxy.ts` (and the `middleware` export to `proxy`). If you're on
// Next.js 15, rename this file to `middleware.ts` and rename the exported
// function below to `middleware` — no other changes needed.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every route except static assets and image optimization files,
     * so the Supabase session cookie stays fresh everywhere.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
