"use client";

import * as React from "react";
import Image from "next/image";
import { CheckIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteBook as deleteBookRequest, getBooks, updateBook as updateBookRequest } from "@/lib/api";
import { getBackendToken } from "@/lib/auth-client";
import type { Book, BookCategory } from "@/types/book";

function formatAddedDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * The "My Books" listing — every book the signed-in user added, with the
 * edit/delete actions. The backend only returns own books for `mine: true`
 * and 401s edit/delete without a JWT, so this component resolves the
 * Better Auth JWT via getBackendToken() before every protected call.
 */
export function AddBookTable() {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [editBook, setEditBook] = React.useState<Book | null>(null);
  const [deleteBook, setDeleteBook] = React.useState<Book | null>(null);
  const [toast, setToast] = React.useState("");
  const [toastType, setToastType] = React.useState<"success" | "error">("success");
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  // Short-lived Better Auth JWT for the Express backend; refreshed lazily by
  // callers that need it (the fetched token is only valid for ~15 minutes).
  const [reload, setReload] = React.useState(0);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast(message);
    setToastType(type);
  }

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
      getBooks({ sort: "newest", limit: 60, mine: true }, { token })
        .then((result) => {
          if (!cancelled) {
            setBooks(result.books);
            setTotalCount(result.total);
            setLoadError("");
          }
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            setLoadError(error instanceof Error ? error.message : "Could not load your books.");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    })();
    return () => { cancelled = true; };
  }, [reload]);

  async function updateBook(updated: Book) {
    const token = await getBackendToken();
    if (!token) {
      showToast("Your session has expired. Please sign in again.", "error");
      return;
    }
    setBusy(true);
    try {
      const saved = await updateBookRequest(
        updated.id,
        {
          title: updated.title,
          category: updated.category,
          cover: updated.cover,
          copies: updated.copies ?? 0,
          copiesAvailable: updated.copiesAvailable ?? updated.copies ?? 0,
        },
        { token }
      );
      setBooks((items) => items.map((book) => book.id === saved.id ? saved : book));
      setEditBook(null);
      showToast("Book details updated.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update this book.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function removeBook() {
    if (!deleteBook) return;
    const token = await getBackendToken();
    if (!token) {
      showToast("Your session has expired. Please sign in again.", "error");
      return;
    }
    setBusy(true);
    try {
      await deleteBookRequest(deleteBook.id, { token });
      setBooks((items) => items.filter((book) => book.id !== deleteBook.id));
      setTotalCount((count) => Math.max(0, count - 1));
      setDeleteBook(null);
      showToast("Book removed from your library.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete this book.", "error");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">My Books</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">The books you added to the BookNook library, with their edit and delete actions.</p>
      </div>
      <div className="flex flex-col items-start self-start pb-1 sm:items-end">
        <span className="text-base font-medium sm:text-lg text-foreground">Total Books: {loading ? "…" : totalCount}</span>
        <span className="mt-1.5 h-0.5 w-10 self-end bg-primary" />
      </div>
    </div>
    {toast ? <div role={toastType === "error" ? "alert" : "status"} aria-live="polite" className={`fixed bottom-5 right-5 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${toastType === "error" ? "bg-destructive" : "bg-forest"}`}><CheckIcon className="size-4 shrink-0" />{toast}<button className="ml-2 rounded p-1 hover:bg-white/10" onClick={() => setToast("")} aria-label="Dismiss message"><XIcon className="size-4" /></button></div> : null}

    {loading ? <div className="rounded-xl border border-border bg-card px-5 py-16 text-center text-sm text-muted-foreground" role="status">Loading your books…</div> : loadError ? <div className="rounded-xl border border-border bg-card px-5 py-12 text-center"><p role="alert" className="text-sm text-destructive">{loadError}</p><Button variant="outline" className="mt-4" onClick={() => { setLoading(true); setReload((value) => value + 1); }}>Try again</Button></div> : books.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-16 text-center"><h2 className="font-heading text-2xl font-semibold">You haven&apos;t added any books yet</h2><p className="mt-2 text-sm text-muted-foreground">Books you add to the library will appear here.</p></div> : <>
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[930px] table-fixed border-collapse text-left text-sm">
            <colgroup><col className="w-[5.5%]" /><col className="w-[11.5%]" /><col className="w-[22%]" /><col className="w-[14%]" /><col className="w-[14%]" /><col className="w-[10%]" /><col className="w-[23%]" /></colgroup>
            <thead className="bg-muted/50 text-foreground">
              <tr>{["#", "Book Cover", "Title", "Category", "Added Date", "Copies", "Actions"].map((heading) => <th key={heading} className="border-b border-r border-border px-3 py-4 font-semibold last:border-r-0">{heading}</th>)}</tr>
            </thead>
            <tbody>{books.map((book, index) => <tr key={book.id} className="h-[5.25rem] transition-colors hover:bg-muted/40">
              <td className="border-b border-r border-border px-4 text-base last:border-r-0">{index + 1}</td>
              <td className="border-b border-r border-border px-4 last:border-r-0"><div className="relative mx-auto h-[4.1rem] w-12 overflow-hidden rounded-md bg-muted shadow-sm"><Image src={book.cover} alt={`Cover of ${book.title}`} fill sizes="48px" unoptimized className="object-cover" /></div></td>
              <td className="border-b border-r border-border px-4 font-medium leading-snug last:border-r-0">{book.title}</td>
              <td className="border-b border-r border-border px-4 last:border-r-0">{book.category}</td>
              <td className="border-b border-r border-border px-4 last:border-r-0">{formatAddedDate(book.createdAt)}</td>
              <td className="border-b border-r border-border px-4 last:border-r-0">{book.copies}</td>
              <td className="border-b border-border px-3 last:border-r-0"><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" disabled={busy} onClick={() => setEditBook(book)} className="h-9"><PencilIcon />Edit</Button><Button variant="destructive" size="sm" disabled={busy} onClick={() => setDeleteBook(book)} className="h-9"><Trash2Icon />Delete</Button></div></td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">{books.map((book, index) => <article key={book.id} className="flex gap-4 rounded-xl border border-border bg-card p-3 shadow-sm"><div className="relative h-24 w-[4.25rem] shrink-0 overflow-hidden rounded-md bg-muted shadow-sm"><Image src={book.cover} alt={`Cover of ${book.title}`} fill sizes="68px" unoptimized className="object-cover" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><span className="text-xs text-muted-foreground">#{index + 1}</span><span className="rounded-full bg-muted px-2 py-1 text-[0.68rem] font-medium">{book.category}</span></div><h2 className="mt-1 font-semibold leading-snug">{book.title}</h2><p className="mt-1 text-xs text-muted-foreground">Added {formatAddedDate(book.createdAt)} · {book.copies} copies</p><div className="mt-3 flex gap-2"><Button variant="outline" size="sm" disabled={busy} onClick={() => setEditBook(book)}><PencilIcon />Edit</Button><Button variant="destructive" size="sm" disabled={busy} onClick={() => setDeleteBook(book)}><Trash2Icon />Delete</Button></div></div></article>)}</div>
    </>}

    {editBook ? <EditBookDialog book={editBook} busy={busy} onCancel={() => setEditBook(null)} onSave={updateBook} /> : null}
    {deleteBook ? <ConfirmDeleteDialog book={deleteBook} busy={busy} onCancel={() => setDeleteBook(null)} onConfirm={removeBook} /> : null}
  </>;
}

function EditBookDialog({ book, busy, onCancel, onSave }: { book: Book; busy: boolean; onCancel: () => void; onSave: (book: Book) => void | Promise<void> }) {
  const [title, setTitle] = React.useState(book.title);
  const [category, setCategory] = React.useState(book.category);
  const [cover, setCover] = React.useState(book.cover);
  const [copies, setCopies] = React.useState(String(book.copies));
  return <Dialog onClose={onCancel}>
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Update catalog entry</p><h2 id="dialog-title" className="mt-1 font-heading text-2xl font-bold">Edit book</h2>
    <form className="mt-5 space-y-4" onSubmit={(event) => { event.preventDefault(); void onSave({ ...book, title: title.trim(), category: category as BookCategory, cover: cover.trim(), copies: Number(copies) }); }}>
      <label className="block text-sm font-medium">Book title<input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
      <label className="block text-sm font-medium">Book Cover Image URL<input value={cover} onChange={(event) => setCover(event.target.value)} placeholder="https://example.com/book-cover.jpg" className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
      <label className="block text-sm font-medium">Category<select value={category} onChange={(event) => setCategory(event.target.value as BookCategory)} className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">{["Fiction", "Science", "History", "Kids", "Others"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="block text-sm font-medium">Copies<input required min="0" type="number" value={copies} onChange={(event) => setCopies(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
      <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button></div>
    </form>
  </Dialog>;
}

function ConfirmDeleteDialog({ book, busy, onCancel, onConfirm }: { book: Book; busy: boolean; onCancel: () => void; onConfirm: () => void | Promise<void> }) {
  return <Dialog onClose={onCancel}><div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive"><Trash2Icon className="size-5" /></div><h2 id="dialog-title" className="mt-4 font-heading text-2xl font-bold">Delete this book?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground"><span className="font-semibold text-foreground">{book.title}</span> will be removed from the catalog.</p><div className="mt-6 flex justify-end gap-2"><Button variant="outline" disabled={busy} onClick={onCancel}>Keep book</Button><Button variant="destructive" disabled={busy} onClick={() => void onConfirm()}>{busy ? "Deleting…" : "Delete book"}</Button></div></Dialog>;
}

function Dialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-foreground shadow-2xl">{children}</section></div>;
}
