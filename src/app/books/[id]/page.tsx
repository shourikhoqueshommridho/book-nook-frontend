
import { Suspense, type JSX } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookIcon, Loader2, TriangleAlertIcon } from "lucide-react";
import { RequireSession } from "@/components/auth/RequireSession";
import { BookDetail } from "@/components/books/BookDetail";
import { ApiError, getBook } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "BookNook | Book Details",
  description: "Full details of a book in the BookNook library.",
};

/**
 * This is a dynamic route, and the root layout's Navbar reads usePathname
 * (per-request URL data), so the static shell can't be prerendered here —
 * this route uses blocking SSR instead of an instant shell (route handles
 * its own Suspense boundaries below).
 */
export const instant = false;

/** Private Book Details page at /books/:id. */
export default function BookDetailsPage({
  params,
}: PageProps<"/books/[id]">) {
  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
        {/* Reading `params` is a dynamic access — it streams in behind Suspense
            just like the session check inside RequireSession. */}
        <Suspense fallback={<DetailFallback />}>
          <BookDetailContent params={params} />
        </Suspense>
      </section>
    </main>
  );
}

async function BookDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RequireSession redirectFrom={`/books/${id}`}>
      {(user) => (
        <BookDetailLoader
          id={id}
          user={{ name: user.name, email: user.email }}
        />
      )}
    </RequireSession>
  );
}

/** Skeleton matching the detail layout while params/session/book resolve. */
function DetailFallback(): JSX.Element {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
      Loading book details…
    </div>
  );
}

/**
 * Fetches the book once the session is confirmed (runs inside the
 * RequireSession Suspense boundary) and renders the detail view, or a
 * not-found / error state that keeps the user one click away from the
 * Books list.
 */
async function BookDetailLoader({
  id: _id,
  user,
}: {
  id: string;
  user: { name: string; email: string };
}) {
  let book;
  try {
    book = await getBook(_id);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 0;

    if (status === 404) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-5 py-16 text-center">
          <BookIcon className="size-10 text-primary/70" aria-hidden="true" />
          <p className="font-heading text-2xl font-bold text-foreground">
            Book not found
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            This book doesn&apos;t exist, or it was removed from the library.
          </p>
          <BackToBooks />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-5 py-16 text-center">
        <TriangleAlertIcon
          className="size-10 text-destructive"
          aria-hidden="true"
        />
        <p className="font-heading text-2xl font-bold text-foreground">
          Couldn&apos;t load this book
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error instanceof Error && error.message
            ? error.message
            : "Something went wrong while connecting to the library."}
        </p>
        <BackToBooks />
      </div>
    );
  }

  return <BookDetail book={book} user={user} />;
}

function BackToBooks() {
  return (
    <Link href="/books" className={buttonVariants({ variant: "outline" })}>
      Back to Books
    </Link>
  );
}
