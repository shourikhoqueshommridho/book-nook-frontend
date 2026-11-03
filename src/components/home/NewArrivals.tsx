
import Link from "next/link";
import { ArrowRightIcon, BookIcon } from "lucide-react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { BookCard } from "@/components/home/BookCard";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, getBooks } from "@/lib/api";

/**
 * "Freshly Added to Our Shelves" — the 6 newest books straight from the
 * Express + MongoDB API (GET /api/books?sort=newest&limit=6).
 * Server-rendered and streamed behind a Suspense boundary.
 */
export async function NewArrivals() {
  let data;

  try {
    data = await getBooks({ sort: "newest", limit: 6 });
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Something went wrong.";

    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          title="Freshly Added to Our Shelves"
          subtitle="Discover the latest additions to our growing library."
        />

        <p className="rounded-xl bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
          {message}
        </p>
      </section>
    );
  }

  if (data.books.length === 0) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          title="Freshly Added to Our Shelves"
          subtitle="Discover the latest additions to our growing library."
        />

        <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/60 px-4 py-12 text-center">
          <BookIcon
            className="size-10 text-secondary"
            aria-hidden="true"
          />

          <p className="max-w-md text-sm text-muted-foreground">
            Our shelves are being stocked. New books will appear here as soon as
            they hit the library.
          </p>

          <Link
            href="/books"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "h-11 px-8",
            })}
          >
            Explore Books
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        title="Freshly Added to Our Shelves"
        subtitle="Discover the latest additions to our growing library."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/books"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "h-11 px-8",
          })}
        >
          See All Books
          <ArrowRightIcon data-icon="inline-end" />
        </Link>
      </div>
    </section>
  );
}

/** Static skeleton shown while the section streams in. */
export function NewArrivalsFallback() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <Skeleton className="h-9 w-80 max-w-full" />
      <Skeleton className="mt-2 h-5 w-64 max-w-full" />

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <Skeleton className="aspect-[3/4] w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
