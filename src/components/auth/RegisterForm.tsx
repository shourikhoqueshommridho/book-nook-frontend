
"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, BookPlus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  isPasswordValid,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "@/lib/password-validation";
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

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirect"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
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
    router.replace(`/register?redirect=${encodeURIComponent(redirectTo)}`);
  }, [searchParams, router, redirectTo]);

  async function handleGoogleSignUp() {
    if (socialLoading) return;
    setSocialLoading(true);
    try {
      // Google OAuth registers brand-new users through Better Auth's
      // social provider flow (name, email and profile image come straight
      // from the Google profile into the MongoDB adapter).
      toast.success("Redirecting to Google…");
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo, // Home by default, or the earlier-intended page
        errorCallbackURL: `/register?error=google&redirect=${encodeURIComponent(redirectTo)}`,
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
          "Could not start Google sign-up. Please try again or register with email and password."
        );
        setSocialLoading(false);
        return;
      }
      // Initiation succeeded and the browser is redirecting to Google — keep
      // the spinner; a failure here only ever shows up via ?error= on return.
    } catch {
      toast.error("Could not start Google sign-up. Please try again or register with email and password.");
      setSocialLoading(false);
    }
  }

  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    if (name.trim().length === 0) {
      nextErrors.name = "Your name is required.";
    } else if (name.trim().length > 100) {
      nextErrors.name = "Name can be at most 100 characters.";
    }
    if (email.trim().length === 0) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "This doesn't look like a valid email address.";
    }
    if (password.length === 0) {
      nextErrors.password = "Password is required.";
    } else if (!isPasswordValid(password)) {
      nextErrors.password = PASSWORD_REQUIREMENTS_MESSAGE;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (error) {
        toast.error(
          error.status === 422 && error.code === "USER_ALREADY_EXISTS"
            ? "An account with this email already exists. Try signing in instead."
            : error.message ?? "Could not create your account. Please try again."
        );
        return;
      }
      // emailAndPassword.autoSignIn defaults to true, so the account is
      // already signed in at this point.
      toast.success("Account created — welcome to BookNook!");
      router.replace(redirectTo);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookPlus size={25} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Join BookNook to build your personal library and borrow books.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-card sm:p-8"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Shourik Hoque"
            maxLength={100}
            aria-invalid={Boolean(errors.name)}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-destructive dark:border-gray-700"
          />
          {errors.name && (
            <p role="alert" className="mt-2 text-xs text-red-500">
              {errors.name}
            </p>
          )}
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="6+ characters, with uppercase and lowercase letters"
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
          disabled={submitting}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <BookPlus size={17} />
              Create account
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
          onClick={handleGoogleSignUp}
          disabled={submitting || socialLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-card dark:text-gray-200 dark:hover:bg-muted"
        >
          {socialLoading ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <GoogleIcon className="size-4 shrink-0" />
          )}
          Sign up with Google
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
