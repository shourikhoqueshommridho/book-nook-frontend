"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BookmarkIcon, Loader2, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getBorrows, returnBook } from "@/lib/api";
import type { BorrowRecord } from "@/lib/api";
import { getBackendToken } from "@/lib/auth-client";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

/**
 * The signed-in user's borrow records, newest first. Returning clicks
 * DELETE /api/borrows/:id — the backend flips the record to "returned" and
 * restores one available copy atomically.
 */
export function MyBorrowsView() {
  const [borrows, setBorrows] = React.useState<BorrowRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");
  const [reload, setReload] = React.useState(0);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [confirmReturn, setConfirmReturn] = React.useState<BorrowRecord | null>(
    null
  );

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getBackendToken();
      if (!token) {
        if (!cancelled) {
          setLoading(false);
          setLoadError("Your session has expired. Please sign in again.");
        }
        return;
      }
      getBorrows({ token })
        .then((result) => {
          if (!cancelled) {
            setBorrows(result.borrows);
            setLoadError("");
          }
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            setLoadError(
              error instanceof Error ? error.message : "Could not load your borrows."
            );
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  async function handleReturn() {
    if (!confirmReturn) return;

    const token = await getBackendToken();
    if (!token) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }

    setBusyId(confirmReturn.id);
    try {
      const result = await returnBook(confirmReturn.id, { token });
      toast.success(result.message);
      setBorrows((items) =>
        items.map((borrow) =>
          borrow.id === result.borrow.id ? result.borrow : borrow
        )
      );
      setConfirmReturn(null);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Could not return this book. Please try again."
      );
    } finally {
      setBusyId(null);
    }
  }

  const activeBorrows = borrows.filter((borrow) => borrow.status === "active");
  const history = borrows.filter((borrow) => borrow.status !== "active");

  return (
    <>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookmarkIcon size={25} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          My Borrows
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {loading
            ? "Loading your borrowed books…"
            : activeBorrows.length === 0
              ? "You have no borrowed books right now."
              : `You are borrowing ${activeBorrows.length} ${
                  activeBorrows.length === 1 ? "book" : "books"
                }.`}
        </p>
      </div>

      {loading ? (
        <BorrowListSkeleton />
      ) : loadError ? (
        <div className="rounded-xl border border-border bg-card px-5 py-12 text-center">
          <p role="alert" className="text-sm text-destructive">
            {loadError}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setLoading(true);
              setReload((value) => value + 1);
            }}
          >
            <RotateCcwIcon className="size-4" />
            Try again
          </Button>
        </div>
      ) : borrows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-16 text-center">
          <BookmarkIcon
            className="mx-auto size-10 text-muted-foreground/50"
            aria-hidden="true"
          />
          <h2 className="mt-4 font-heading text-2xl font-semibold">
            Nothing borrowed yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Borrow a book from the library and it will show up here.
          </p>
          <Link
            href="/books"
            className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {activeBorrows.length > 0 ? (
            <section aria-label="Currently borrowed books">
              <h2 className="mb-3 font-heading text-xl font-bold text-foreground">
                Currently Borrowed
              </h2>
              <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {activeBorrows.map((borrow) => (
                  <li
                    key={borrow.id}
                    className="flex gap-4 rounded-xl border border-border bg-card p-3 shadow-sm"
                  >
                    <div className="relative h-28 w-[4.75rem] shrink-0 overflow-hidden rounded-md bg-muted">
                      {borrow.bookImage ? (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-entered cover URL
                        <img
                          src={borrow.bookImage}
                          alt={`Cover of ${borrow.bookTitle}`}
                          className="size-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate font-semibold leading-snug">
                        {borrow.bookTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Borrowed {formatDate(borrow.borrowDate)}
                      </p>
                      <Badge className="mt-2 w-fit bg-card text-forest ring-1 ring-secondary">
                        Active
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === borrow.id}
                        className="mt-auto w-fit"
                        onClick={() => setConfirmReturn(borrow)}
                      >
                        <RotateCcwIcon className="size-4" />
                        Return
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {history.length > 0 ? (
            <section aria-label="Borrow history">
              <h2 className="mb-3 font-heading text-xl font-bold text-foreground">
                Return History
              </h2>
              <ul className="flex flex-col gap-2">
                {history.map((borrow) => (
                  <li
                    key={borrow.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm"
                  >
                    <span className="font-medium">{borrow.bookTitle}</span>
                    <span className="text-muted-foreground">
                      Borrowed {formatDate(borrow.borrowDate)}
                    </span>
                    <span className="text-muted-foreground">
                      Returned{" "}
                      {borrow.returnDate
                        ? formatDate(borrow.returnDate)
                        : "—"}
                    </span>
                    <Badge variant="secondary" className="ml-auto">
                      Returned
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}

      {confirmReturn ? (
        <ConfirmReturnDialog
          borrow={confirmReturn}
          busy={busyId === confirmReturn.id}
          onCancel={() => setConfirmReturn(null)}
          onConfirm={() => void handleReturn()}
        />
      ) : null}
    </>
  );
}

function BorrowListSkeleton() {
  return (
    <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" role="status">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex gap-4 rounded-xl border border-border bg-card p-3">
          <Skeleton className="h-28 w-[4.75rem] rounded-md" />
          <div className="flex flex-1 flex-col gap-2 py-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-auto h-8 w-24" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ConfirmReturnDialog({
  borrow,
  busy,
  onCancel,
  onConfirm,
}: {
  borrow: BorrowRecord;
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
        aria-labelledby="return-dialog-title"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-foreground shadow-2xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Return to shelf
        </p>
        <h2
          id="return-dialog-title"
          className="mt-1 font-heading text-2xl font-bold"
        >
          Return this book?
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {borrow.bookTitle}
          </span>{" "}
          will go back on the shelf and one available copy will be restored.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={onCancel}>
            Keep it
          </Button>
          <Button disabled={busy} onClick={onConfirm}>
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Returning…
              </>
            ) : (
              "Confirm Return"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
