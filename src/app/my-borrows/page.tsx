import type { Metadata } from "next";
import { RequireSession } from "@/components/auth/RequireSession";
import { MyBorrowsView } from "@/components/books/MyBorrowsView";

export const metadata: Metadata = {
  title: "BookNook | My Borrows",
  description: "The books you are currently borrowing from BookNook.",
};

/**
 * Private "My Borrows" page — reads and returns borrows through the
 * authenticated Express endpoints (GET / DELETE /api/borrows). The user's
 * identity is derived from the Better Auth JWT on the backend.
 */
export default function MyBorrowsPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
        <RequireSession redirectFrom="/my-borrows">
          {() => <MyBorrowsView />}
        </RequireSession>
      </section>
    </main>
  );
}
