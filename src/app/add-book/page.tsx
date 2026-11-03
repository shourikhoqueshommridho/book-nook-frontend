
import type { Metadata } from "next";
import { AddBookForm } from "@/components/books/AddBookForm";
import { RequireSession } from "@/components/auth/RequireSession";

export const metadata: Metadata = {
  title: "BookNook | Add New Book",
  description: "Add a new book to the BookNook library.",
};

export default function AddBookPage() {
  return (
    <main className="flex-1 dark:bg-background add-book-page min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
        <RequireSession redirectFrom="/add-book">
          {(user) => (
            <AddBookForm
              user={{ name: user.name, email: user.email }}
            />
          )}
        </RequireSession>
      </section>
    </main>
  );
}
