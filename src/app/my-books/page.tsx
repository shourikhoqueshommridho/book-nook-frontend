
import type { Metadata } from "next";
import { RequireSession } from "@/components/auth/RequireSession";
import { AddBookTable } from "@/components/books/AddBookTable";

export const metadata: Metadata = {
  title: "BookNook | My Books",
  description: "The books you added to the BookNook library.",
};

/** Private "My Books" page — same background and theme tokens as the Home page. */
export default function MyBooksPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
        <RequireSession redirectFrom="/my-books">
          {() => <AddBookTable />}
        </RequireSession>
      </section>
    </main>
  );
}
