
import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getServerSession, type Session } from "@/lib/auth";

/**
 * Server-side auth gate for protected pages.
 *
 * With `cacheComponents`, reading the request (cookies via the session) can't
 * be prerendered into the static shell, so the check streams in behind a
 * `<Suspense>` boundary at request time. Unauthenticated visitors are
 * redirected to /login with a `redirect` search param so they can be sent
 * back to exactly where they were headed after signing in.
 */
export function RequireSession({
  redirectFrom,
  children,
}: {
  /** Path used both for post-login bounce-back and the login URL. */
  redirectFrom: string;
  children: (user: Session["user"]) => ReactNode;
}) {
  return (
    <Suspense fallback={<SessionFallback />}>
      <SessionGate redirectFrom={redirectFrom}>{children}</SessionGate>
    </Suspense>
  );
}

async function SessionGate({
  redirectFrom,
  children,
}: {
  redirectFrom: string;
  children: (user: Session["user"]) => ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(redirectFrom)}`);
  }

  return <>{children(session.user)}</>;
}

function SessionFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-3 text-sm text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
      Checking your session…
    </div>
  );
}
