
import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "BookNook | Create account",
  description: "Create your BookNook library account.",
};

function AuthShellFallback() {
  return (
    <div className="w-full max-w-md animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-card sm:p-8">
      <div className="mb-8 space-y-2">
        <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-8 w-44 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-72 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="space-y-5">
        <div className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-11 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}

/**
 * `useSearchParams` sits inside `<Suspense>` because with `cacheComponents`
 * the static shell is prerendered without the request's query string.
 */
export default function RegisterPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-md px-4 pb-16 pt-10 sm:pt-14">
        <Suspense fallback={<AuthShellFallback />}>
          <RegisterForm />
        </Suspense>
      </section>
    </main>
  );
}
