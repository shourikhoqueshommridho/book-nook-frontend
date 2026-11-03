
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookPlus, Loader2, AlertCircle, Upload } from "lucide-react";
import { ApiError, createBook, uploadBookImage } from "@/lib/api";
import { getBackendToken } from "@/lib/auth-client";
import type { BookCategory } from "@/types/book";

const categories: BookCategory[] = [
  "Fiction",
  "Science",
  "History",
  "Kids",
  "Others",
];

const initialForm = {
  title: "",
  author: "",
  category: "Fiction" as BookCategory,
  description: "",
  copies: "1",
};

interface FieldErrors {
  title?: string;
  author?: string;
  category?: string;
  cover?: string;
  description?: string;
  copies?: string;
}

/** Accepts only absolute http(s) URLs (mirrors the backend's requireCover). */
function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function AddBookForm({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [coverUrl, setCoverUrl] = useState("");
  const [coverBroken, setCoverBroken] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    setCoverUrl(event.target.value);
    setCoverBroken(false);
    setErrors((previous) => ({ ...previous, cover: undefined }));
  }

  /**
   * File → hosted URL: uploads through POST /api/uploads/image (Better Auth
   * JWT required; the imgbb key stays server-side) and fills the cover URL
   * the same way as pasting one, so the rest of the form is unchanged.
   */
  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Allow re-selecting the same file after an edit.
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file (JPG, PNG, GIF, WebP, or AVIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Images can be at most 5 MB.");
      return;
    }

    const token = await getBackendToken();
    if (!token) {
      toast.error("Your session has expired. Please sign in again.");
      router.push("/login?redirect=%2Fadd-book");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const hostedUrl = await uploadBookImage(file, {
        token,
        onProgress: setUploadProgress,
      });
      setCoverUrl(hostedUrl);
      setCoverBroken(false);
      setErrors((previous) => ({ ...previous, cover: undefined }));
      toast.success("Cover image uploaded.");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Image upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  // Local blob: URL preview — revoked eagerly on the next selection/clear so
  // no effect/state churn is needed.
  function resolveFieldError(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error && error.message) return error.message;
    return "Something went wrong. Please try again.";
  }

  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    if (form.title.trim().length === 0) {
      nextErrors.title = "Book title is required.";
    } else if (form.title.trim().length > 150) {
      nextErrors.title = "Title can be at most 150 characters.";
    }
    if (form.author.trim().length === 0) {
      nextErrors.author = "Author name is required.";
    } else if (form.author.trim().length > 100) {
      nextErrors.author = "Author name can be at most 100 characters.";
    }
    const trimmedCover = coverUrl.trim();
    if (trimmedCover.length === 0) {
      nextErrors.cover = "A cover image URL is required.";
    } else if (!isValidHttpUrl(trimmedCover)) {
      nextErrors.cover = "Enter a valid http(s) image URL, e.g. https://example.com/book-cover.jpg";
    }
    if (form.description.trim().length === 0) {
      nextErrors.description = "Short description is required.";
    } else if (form.description.trim().length < 10) {
      nextErrors.description = "Write at least 10 characters describing the book.";
    }
    const copies = Number(form.copies);
    if (form.copies.trim() === "") {
      nextErrors.copies = "Total copies is required.";
    } else if (!Number.isInteger(copies) || copies < 1) {
      nextErrors.copies = "Total copies must be a positive whole number.";
    } else if (copies > 10000) {
      nextErrors.copies = "Total copies can be at most 10000.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      // Ask Better Auth for a short-lived JWT, then send it to Express.
      // If the session expired the token call fails — bounce to /login.
      const token = await getBackendToken();
      if (!token) {
        toast.error("Your session has expired. Please sign in again.");
        router.push("/login?redirect=%2Fadd-book");
        return;
      }

      await createBook(
        {
          title: form.title.trim(),
          author: form.author.trim(),
          category: form.category,
          cover: coverUrl.trim(),
          description: form.description.trim(),
          copies: Number(form.copies),
        },
        { token }
      );

      toast.success("Book added successfully!");
      setForm(initialForm);
      setCoverUrl("");
      setCoverBroken(false);
      router.refresh();
    } catch (error) {
      toast.error(resolveFieldError(error));
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookPlus size={25} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Add a New Book
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Add a new book to the BookNook library collection. It will credit your
          account as the owner.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-card sm:p-8"
      >
        {/* Book Title */}
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Book Title <span className="text-red-500">*</span>
          </label>

          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, title: event.target.value }))
            }
            placeholder="Enter book title"
            aria-invalid={Boolean(errors.title)}
            maxLength={150}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-destructive dark:border-gray-700"
          />
          {errors.title && (
            <p role="alert" className="mt-2 text-xs text-red-500">
              {errors.title}
            </p>
          )}
        </div>

        {/* Author */}
        <div>
          <label
            htmlFor="author"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Author Name <span className="text-red-500">*</span>
          </label>

          <input
            id="author"
            name="author"
            type="text"
            value={form.author}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, author: event.target.value }))
            }
            placeholder="Enter author name"
            aria-invalid={Boolean(errors.author)}
            maxLength={100}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-destructive dark:border-gray-700"
          />
          {errors.author && (
            <p role="alert" className="mt-2 text-xs text-red-500">
              {errors.author}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Category <span className="text-red-500">*</span>
          </label>

          <select
            id="category"
            name="category"
            value={form.category}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                category: event.target.value as BookCategory,
              }))
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-card"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Book Cover Image URL (input + live preview) */}
        <div>
          <label
            htmlFor="cover"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Book Cover Image URL <span className="text-red-500">*</span>
          </label>

          <input
            id="cover"
            name="cover"
            type="url"
            value={coverUrl}
            onChange={handleCoverChange}
            placeholder="https://example.com/book-cover.jpg"
            aria-invalid={Boolean(errors.cover)}
            maxLength={500}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-destructive dark:border-gray-700"
          />

          {errors.cover ? (
            <p role="alert" className="mt-2 text-xs text-red-500">
              {errors.cover}
            </p>
          ) : !isValidHttpUrl(coverUrl.trim()) && coverUrl.trim().length > 0 ? (
            <p role="alert" className="mt-2 text-xs text-red-500">
              Enter a valid http(s) image URL, e.g. https://example.com/book-cover.jpg
            </p>
          ) : null}

          {/* Upload a file instead of pasting a URL — POST /api/uploads/image
              stores the file on imgbb server-side and fills the cover URL. */}
          <div className="mt-3 border border-dashed border-gray-300 p-3 dark:border-gray-700">
            <label
              htmlFor="cover-file"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-card dark:text-gray-200 dark:hover:bg-muted"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {uploading ? `Uploading… ${uploadProgress}%` : "Upload a cover image"}
            </label>
            <input
              id="cover-file"
              name="cover-file"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
              onChange={handleCoverUpload}
              disabled={uploading || busy}
              className="sr-only"
            />
            <span className="ml-3 text-xs text-gray-400">
              JPG, PNG, GIF, WebP, or AVIF up to 5 MB.
            </span>
          </div>

          {/* Live preview — shown only while the URL is valid; a broken URL
              degrades to a fallback message instead of a raw broken image. */}
          {coverUrl.trim().length > 0 &&
            isValidHttpUrl(coverUrl.trim()) &&
            !coverBroken && (
              <div className="mt-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element -- previewing an arbitrary user-entered URL; next/image would reject unconfigured hosts */}
                <img
                  src={coverUrl.trim()}
                  alt="Live preview of the book cover"
                  onError={() => setCoverBroken(true)}
                  className="h-40 w-40 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                />
              </div>
            )}

          {coverUrl.trim().length > 0 &&
            isValidHttpUrl(coverUrl.trim()) &&
            coverBroken && (
              <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                The image at this URL could not be loaded. Check the link or try
                a different image.
              </p>
            )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Short Description <span className="text-red-500">*</span>
          </label>

          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                description: event.target.value,
              }))
            }
            placeholder="Write a short description about this book..."
            rows={4}
            maxLength={300}
            aria-invalid={Boolean(errors.description)}
            className="w-full resize-y rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-destructive dark:border-gray-700"
          />
          {errors.description && (
            <p role="alert" className="mt-2 text-xs text-red-500">
              {errors.description}
            </p>
          )}
        </div>

        {/* Copies */}
        <div>
          <label
            htmlFor="copies"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Total Copies <span className="text-red-500">*</span>
          </label>

          <input
            id="copies"
            name="copies"
            type="number"
            value={form.copies}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, copies: event.target.value }))
            }
            min="1"
            max="10000"
            step="1"
            aria-invalid={Boolean(errors.copies)}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-destructive dark:border-gray-700"
          />

          {errors.copies ? (
            <p role="alert" className="mt-2 text-xs text-red-500">
              {errors.copies}
            </p>
          ) : (
            <p className="mt-2 text-xs text-gray-400">
              Available copies will initially be equal to total copies.
            </p>
          )}
        </div>

        {/* Read-only user identity from the Better Auth session */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="userName"
              className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              User Name
            </label>
            <input
              id="userName"
              type="text"
              value={user.name}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-muted/50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="userEmail"
              className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              User Email
            </label>
            <input
              id="userEmail"
              type="email"
              value={user.email}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-muted/50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 dark:border-gray-800 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setForm(initialForm);
              setErrors({});
              setCoverUrl("");
              setCoverBroken(false);
            }}
            disabled={busy}
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-muted"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Adding Book...
              </>
            ) : (
              <>
                <BookPlus size={17} />
                Add Book
              </>
            )}
          </button>
        </div>

        {/* Non-blocking inline hint for API errors that aren't self-correctable */}
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>
            Submission errors and validation problems are shown as toasts at the
            top of the window and beside each field.
          </span>
        </div>
      </form>
    </div>
  );
}
