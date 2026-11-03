
"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  Loader2,
  UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { borrowBook } from "@/lib/api";
import { getBackendToken } from "@/lib/auth-client";
import type { Book } from "@/types/book";

/** Mirrors backend src/validation.js → requireCover (http(s) URLs or "/..." paths). */
function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function formatAddedDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Book Details view: cover on one side, metadata on the other (stacked on
 * mobile), with the Borrow action behind a confirmation dialog. The copy
 * decrement itself happens atomically in the backend on POST /api/borrows.
 */
export function BookDetail({
  book,
  user,
}: {
  book: Book;
  user: { name: string; email: string };
}) {
  const router = useRouter();
  const [available, setAvailable] = useState(book.copiesAvailable);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  // Broken cover URLs degrade to a fallback panel instead of a raw broken img.
  const [coverFailed, setCoverFailed] = useState(false);

  const coverUrl = book.cover;
  const coverIsHttp =
    isValidHttpUrl(coverUrl) || coverUrl.startsWith("/");
  const soldOut = available === 0;

  async function confirmBorrow() {
    const token = await getBackendToken();
    if (!token) {
      toast.error("Your session has expired. Please sign in again.");
      router.push(`/login?redirect=${encodeURIComponent(`/books/${book.id}`)}`);
      return;
    }

    setBusy(true);
    try {
      const result = await borrowBook(book.id, { token });
      toast.success(result.message);
      setDialogOpen(false);
      // Optimistic sync with the backend's atomic decrement; the router
      // refresh pulls the authoritative server-rendered numbers back in.
      setAvailable((current) =>
        current === undefined ? current : Math.max(0, current - 1)
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Could not borrow this book. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Link
        href="/books"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary outline-none hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        Back to Books
      </Link>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
        {/* Cover — stacks above the info column on mobile */}
        <div className="mx-auto w-full max-w-xs lg:mx-0 lg:w-full">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
            {coverIsHttp && !coverFailed ? (
              // eslint-disable-next-line @next/next/no-img-element -- covers can be any user-entered http(s) URL; next/image would 400 on unconfigured hosts
              <img
                src={coverUrl}
                alt={`Cover of ${book.title} by ${book.author}`}
                className="size-full object-cover"
                onError={() => setCoverFailed(true)}
              />
            ) : (
              <div className="grid size-full place-items-center p-6 text-center">
                <BookOpenIcon
                  className="size-12 text-muted-foreground/50"
                  aria-hidden="true"
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Cover image not available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="min-w-0">
          <Badge
            variant="secondary"
            className="h-6 w-fit px-2.5 text-[0.7rem] font-semibold uppercase tracking-wide"
          >
            {book.category}
          </Badge>

          <h1 className="mt-3 font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {book.title}
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            by <span className="font-medium text-foreground">{book.author}</span>
          </p>

          {typeof book.rating === "number" ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Rated {book.rating.toFixed(1)} / 5
            </p>
          ) : null}

          {book.description ? (
            <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              {book.description}
            </p>
          ) : null}

          <dl className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
            <DetailRow label="Total Copies">
              {book.copies !== undefined ? String(book.copies) : "—"}
            </DetailRow>
            <DetailRow label="Available Copies">
              {soldOut ? (
                <span className="font-semibold text-destructive">None left</span>
              ) : (
                String(available ?? "—")
              )}
            </DetailRow>
            <DetailRow label="Added On">{formatAddedDate(book.createdAt)}</DetailRow>
            <DetailRow label="Added By">
              {book.addedBy ? (
                <span>
                  {book.addedBy.name}
                  <span className="text-muted-foreground">
                    {" "}
                    · {book.addedBy.email}
                  </span>
                </span>
              ) : (
                "—"
              )}
            </DetailRow>
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              disabled={soldOut || busy}
              className="h-11 sm:w-auto sm:px-6"
              onClick={() => setDialogOpen(true)}
            >
              {soldOut ? (
                "Not Available"
              ) : (
                <>
                  <BookOpenIcon className="size-4" data-icon="inline-start" />
                  Borrow This Book
                </>
              )}
            </Button>

            <Link
              href="/books"
              className={buttonVariants({
                variant: "outline",
                className: "h-11 sm:px-6",
              })}
            >
              Back to Books
            </Link>
          </div>
        </div>
      </div>

      {dialogOpen ? (
        <BorrowDialog
          book={book}
          user={user}
          busy={busy}
          onCancel={() => setDialogOpen(false)}
          onConfirm={() => void confirmBorrow()}
        />
      ) : null}
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm font-medium text-foreground">
        {children}
      </dd>
    </div>
  );
}

/**
 * Loan confirmation dialog. User identity comes from the Better Auth
 * session (read-only, display only — the backend derives identity itself
 * from the JWT).
 */
function BorrowDialog({
  book,
  user,
  busy,
  onCancel,
  onConfirm,
}: {
  book: Book;
  user: { name: string; email: string };
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-foreground shadow-2xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Loan request
        </p>
        <h2 id="dialog-title" className="mt-1 font-heading text-2xl font-bold">
          Borrow this book?
        </h2>

        <div className="mt-4 flex gap-4 rounded-xl border border-border bg-muted/40 p-3">
          <div className="relative h-20 w-15 shrink-0 overflow-hidden rounded-md bg-muted shadow-sm">
            {book.cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-entered cover URL
              <img
                src={book.cover}
                alt={`Cover of ${book.title}`}
                className="size-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold leading-snug">{book.title}</p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {book.author}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {book.category} · {book.copiesAvailable} available
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border p-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <UsersIcon className="size-3.5" aria-hidden="true" />
            Borrower
          </p>
          <p className="mt-2 text-sm">
            <span className="block font-medium">{user.name}</span>
            <span className="block text-muted-foreground">{user.email}</span>
          </p>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Taking it home? You can return it from{" "}
          <span className="font-medium text-foreground">My Borrows</span> when
          you&apos;re done.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={busy} onClick={onConfirm}>
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Borrowing…
              </>
            ) : (
              "Confirm Borrow"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
