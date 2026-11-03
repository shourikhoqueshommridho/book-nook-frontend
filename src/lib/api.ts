import type { Book, BookCategory } from "@/types/book";

/** Valid GET /api/books sort values (see Express backend src/routes/books.js). */
export type BookSortKey =
  | "newest"
  | "oldest"
  | "title-asc"
  | "title-desc"
  | "rating-desc";

export const BOOK_SORTS: { value: BookSortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
  { value: "rating-desc", label: "Highest rated" },
];

/** GET /api/books query parameters supported by the backend.
 *  `mine: true` requires a JWT — returns only the authenticated user's books. */
export interface BookListQuery {
  q?: string;
  category?: string;
  sort?: BookSortKey;
  page?: number;
  limit?: number;
  mine?: boolean;
}

/** GET /api/borrows response shape (see backend src/database.js → toApiBorrow). */
export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  userEmail: string;
  borrowDate: string;
  returnDate: string | null;
  status: string;
}

/** GET /api/books response envelope. */
export interface BookListResponse {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** POST /api/books request body. */
export interface BookInput {
  title: string;
  author: string;
  category: BookCategory;
  cover: string;
  description?: string;
  rating?: number | null;
  copies?: number;
  /** Available copies — accepted by PATCH /api/books/:id. */
  copiesAvailable?: number;
}

/**
 * Errors surfaced by the centralized API service.
 * `status` is the HTTP status (0 = network/config failure).
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function apiUrl(path: string): string {
  const requestPath = path.startsWith("/") ? path : `/${path}`;

  // Browser requests use Next's same-origin rewrite, avoiding cross-origin
  // CORS and keeping the backend URL out of the client bundle.
  if (typeof window !== "undefined") return requestPath;

  // Server Components cannot fetch a relative URL. Call the backend directly
  // during server rendering; NEXT_PUBLIC_API_URL remains a legacy fallback.
  const backendBase = (
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ""
  )
    .trim()
    .replace(/\/+$/, "");
  if (!backendBase) {
    throw new ApiError(
      0,
      "API base URL is not configured. Set BACKEND_API_URL in the frontend environment."
    );
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(backendBase);
  } catch {
    throw new ApiError(0, "BACKEND_API_URL must be an absolute HTTP(S) URL.");
  }

  if (baseUrl.protocol !== "https:" && baseUrl.protocol !== "http:") {
    throw new ApiError(0, "BACKEND_API_URL must use http or https.");
  }
  if (baseUrl.search || baseUrl.hash) {
    throw new ApiError(0, "BACKEND_API_URL must not include a query or fragment.");
  }

  // Accept either an origin or an origin already ending in `/api`.
  const backendPath = baseUrl.pathname.replace(/\/+$/, "").replace(/\/api$/, "");
  return `${baseUrl.origin}${backendPath}${requestPath}`;
}

async function apiRequest<T>(path: string, init: RequestInit & { signal?: AbortSignal }): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), { ...init, cache: "no-store" });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError(0, "Could not reach the BookNook API. Is the backend running?");
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // keep the generic message
    }
    throw new ApiError(response.status, message);
  }
  return (await response.json()) as T;
}

function toQueryString(query: BookListQuery): string {
  const search = new URLSearchParams();
  if (query.q) search.set("q", query.q);
  if (query.category) search.set("category", query.category);
  if (query.sort) search.set("sort", query.sort);
  if (query.page !== undefined) search.set("page", String(query.page));
  if (query.limit !== undefined) search.set("limit", String(query.limit));
  if (query.mine) search.set("mine", "true"); // needs a JWT in options.token
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

/** GET /api/books. With `query.mine` a JWT (options.token) is required. */
export async function getBooks(
  query: BookListQuery = {},
  options: AuthenticatedRequestOptions & { signal?: AbortSignal } = {}
): Promise<BookListResponse> {
  return apiRequest<BookListResponse>(`/api/books${toQueryString(query)}`, {
    headers: withAuthHeader({}, options),
    signal: options.signal,
  });
}

/** GET /api/books/:id */
export async function getBook(id: string): Promise<Book> {
  const { book } = await apiRequest<{ book: Book }>(
    `/api/books/${encodeURIComponent(id)}`,
    {}
  );
  return book;
}

/** GET /api/categories — genre values for filter UIs. */
export async function getCategories(options: { signal?: AbortSignal } = {}): Promise<string[]> {
  const { categories } = await apiRequest<{ categories: string[] }>(
    "/api/categories",
    { signal: options.signal }
  );
  return categories;
}

/**
 * Extra per-request options: `token` is the Better Auth JWT used to
 * authenticate protected endpoints against the Express backend.
 */
export interface AuthenticatedRequestOptions {
  token?: string | null;
}

function withAuthHeader(
  headers: Record<string, string>,
  options?: AuthenticatedRequestOptions
): Record<string, string> {
  if (options?.token) {
    return { ...headers, Authorization: `Bearer ${options.token}` };
  }
  return headers;
}

/** POST /api/books — requires a Better Auth JWT for the Express backend. */
export async function createBook(
  input: BookInput,
  options: AuthenticatedRequestOptions = {}
): Promise<Book> {
  const { book } = await apiRequest<{ book: Book }>("/api/books", {
    method: "POST",
    headers: withAuthHeader({ "Content-Type": "application/json" }, options),
    body: JSON.stringify(input),
  });
  return book;
}

/**
 * POST /api/uploads/image — sends an image as multipart/form-data to the
 * Express backend, which validates it and forwards it to the imgbb API
 * (the imgbb key never reaches the browser). Resolves with the hosted
 * image URL. Uses XHR so upload progress is reported via `onProgress`.
 */
export function uploadBookImage(
  file: File,
  {
    token,
    onProgress,
  }: AuthenticatedRequestOptions & { onProgress?: (percent: number) => void } = {}
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl("/api/uploads/image"));

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let body: { url?: string; error?: string } = {};
      try {
        body = JSON.parse(xhr.responseText) as { url?: string; error?: string };
      } catch {
        // fall through to generic message
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.url) {
        resolve(body.url);
      } else {
        reject(
          new ApiError(
            xhr.status || 0,
            body.error ?? "Image upload failed. Please try again."
          )
        );
      }
    };

    xhr.onerror = () =>
      reject(
        new ApiError(0, "Could not reach the BookNook API. Is the backend running?")
      );

    const form = new FormData();
    form.append("image", file);
    xhr.send(form);
  });
}

/** PATCH /api/books/:id — owner-only on the backend; a JWT is required. */
export async function updateBook(
  id: string,
  input: Partial<BookInput>,
  options: AuthenticatedRequestOptions = {}
): Promise<Book> {
  const { book } = await apiRequest<{ book: Book }>(`/api/books/${id}`, {
    method: "PATCH",
    headers: withAuthHeader({ "Content-Type": "application/json" }, options),
    body: JSON.stringify(input),
  });
  return book;
}

/** DELETE /api/books/:id — owner-only on the backend; a JWT is required. */
export async function deleteBook(
  id: string,
  options: AuthenticatedRequestOptions = {}
): Promise<void> {
  await apiRequest(`/api/books/${id}`, {
    method: "DELETE",
    headers: withAuthHeader({}, options),
  });
}

/** POST /api/borrows — borrow a book; the backend decrements copies atomically. */
export async function borrowBook(
  bookId: string,
  options: AuthenticatedRequestOptions = {}
): Promise<{ message: string; borrow: BorrowRecord }> {
  return apiRequest<{ message: string; borrow: BorrowRecord }>(
    "/api/borrows",
    {
      method: "POST",
      headers: withAuthHeader({ "Content-Type": "application/json" }, options),
      body: JSON.stringify({ bookId }),
    }
  );
}

/** GET /api/borrows — the authenticated user's borrow records, newest first.
 *  The user is derived from the JWT on the backend; no query params needed. */
export async function getBorrows(
  options: AuthenticatedRequestOptions = {}
): Promise<{ borrows: BorrowRecord[] }> {
  return apiRequest<{ borrows: BorrowRecord[] }>("/api/borrows", {
    headers: withAuthHeader({}, options),
  });
}

/** DELETE /api/borrows/:id — return a borrowed book; the backend restores
 *  one available copy atomically. */
export async function returnBook(
  borrowId: string,
  options: AuthenticatedRequestOptions = {}
): Promise<{ message: string; borrow: BorrowRecord }> {
  return apiRequest<{ message: string; borrow: BorrowRecord }>(
    `/api/borrows/${encodeURIComponent(borrowId)}`,
    {
      method: "DELETE",
      headers: withAuthHeader({}, options),
    }
  );
}
