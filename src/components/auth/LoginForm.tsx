
"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { GoogleIcon } from "@/components/layout/BrandIcons";
import { readOAuthError } from "./oauth-error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only allows in-app relative paths — prevents open redirects. */
function safeRedirectPath(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }
  return "/";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirect"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  // OAuth failure callback: Better Auth appends its machine-readable code
  // after our own `error=google` sentinel, so readOAuthError un-masks the
  // real reason (see oauth-error.ts) and shows a specific, safe message.
  useEffect(() => {
    const errorValues = searchParams.getAll("error");
    if (errorValues.length === 0) return;

    const info = readOAuthError(errorValues);
    // Development log — helps debug OAuth failures without exposing anything
    // to end users (error codes are not secrets).
    if (process.env.NODE_ENV !== "production") {
      console.error("[OAuth callback failed]", { code: info.code });
    }
    toast.error(info.message);

    // Strip the error params from the URL so a refresh doesn't re-toast.
    router.replace(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }, [searchParams, router, redirectTo]);

  function validate(): boolean {
    const nextErrors: typeof errors = {};
    if (email.trim().length === 0) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "This doesn't look like a valid email address.";
    }
    if (password.length === 0) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (error) {
        toast.error(error.message ?? "Could not sign you in. Check your credentials.");
        return;
      }
      toast.success("Welcome back!");
      router.replace(redirectTo);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    if (socialLoading) return;
    setSocialLoading(true);
    try {
      // Better Auth redirects the browser to Google and back to `redirectTo`.
      // The same OAuth entry covers both sign-in (existing user) and
      // sign-up (new Google user) — Better Auth links by Google identity.
      toast.success("Redirecting to Google sign-in…");
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
        errorCallbackURL: `/login?error=google&redirect=${encodeURIComponent(redirectTo)}`,
      });
      // The react client resolves errors as a value — it doesn't throw.
      if (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[OAuth initiation failed]", {
            status: error.status,
            message: error.message,
          });
        }
        toast.error(
          "Could not start Google sign-in. Please try again or use email and password."
        );
        setSocialLoading(false);
        return;
      }
      // Initiation succeeded and the browser is redirecting to Google — keep
      // the spinner; failures only ever show up via ?error= on return.
    } catch {
      toast.error("Could not start Google sign-in. Please try again or use email and password.");
      setSocialLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LogIn size={25} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Sign in to add books, manage your collection, and borrow from BookNook.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-card sm:p-8"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-destructive dark:border-gray-700"
          />
          {errors.email && (
            <p role="alert" className="mt-2 text-xs text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-destructive dark:border-gray-700"
          />
          {errors.password && (
            <p role="alert" className="mt-2 text-xs text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || socialLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn size={17} />
              Sign in
            </>
          )}
        </button>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          or
          <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting || socialLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-card dark:text-gray-200 dark:hover:bg-muted"
        >
          {socialLoading ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <GoogleIcon className="size-4 shrink-0" />
          )}
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-primary hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
