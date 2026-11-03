
import type { Metadata } from "next";
import Link from "next/link";
import { BookIcon, BookmarkIcon } from "lucide-react";
import { RequireSession } from "@/components/auth/RequireSession";

export const metadata: Metadata = {
  title: "BookNook | My Profile",
  description: "Your BookNook profile.",
};

export default function ProfilePage() {
  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-3xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <RequireSession redirectFrom="/profile">
          {(user) => (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-card sm:p-8">
              <h1 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                My Profile
              </h1>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                Signed in with your BookNook account.
              </p>

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-gray-700 dark:text-gray-200">Name</dt>
                  <dd className="text-gray-500 dark:text-gray-400">{user.name}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-700 dark:text-gray-200">Email</dt>
                  <dd className="text-gray-500 dark:text-gray-400">{user.email}</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/my-books"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  <BookIcon size={16} />
                  My Books
                </Link>
                <Link
                  href="/my-borrows"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-muted"
                >
                  <BookmarkIcon size={16} />
                  My Borrows
                </Link>
              </div>
            </div>
          )}
        </RequireSession>
      </section>
    </main>
  );
}
