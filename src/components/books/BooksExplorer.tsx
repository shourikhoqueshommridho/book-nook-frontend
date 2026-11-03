
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BookListResponse, BookSortKey } from "@/lib/api";
import { BOOK_SORTS, getBooks, getCategories } from "@/lib/api";
import { FilterSidebar } from "@/components/books/FilterSidebar";
import { Pagination } from "@/components/books/Pagination";
import { BookCard } from "@/components/home/BookCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookIcon,
  RotateCcwIcon,
  SearchXIcon,
  TriangleAlertIcon,
} from "lucide-react";

interface ExplorerState {
  key: string | null;
  status: "loading" | "success" | "error";
  data: BookListResponse | null;
  message: string | null;
}

/** The All Books explorer keeps all filter state in the URL. */
export function BooksExplorer() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const sortParamRaw = searchParams.get("sort") ?? "newest";

  const sort: BookSortKey = BOOK_SORTS.some(
    (option) => option.value === sortParamRaw
  )
    ? (sortParamRaw as BookSortKey)
    : "newest";

  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1
  );

  const requestKey = `${q}|${categoryParam}|${sort}|${page}`;

  const [queryInput, setQueryInput] = React.useState(q);
  const [genres, setGenres] = React.useState<string[]>([]);

  const [state, setState] = React.useState<ExplorerState>({
    key: null,
    status: "loading",
    data: null,
    message: null,
  });

  const [reloadNonce, setReloadNonce] = React.useState(0);

  /** Update URL search params and reset pagination. */
  function updateUrl(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());

    mutate(params);
    params.delete("page");

    router.replace(
      `/books${params.size > 0 ? `?${params.toString()}` : ""}`,
      { scroll: false }
    );
  }

  /** Commit search query. */
  function commitQuery(value: string) {
    setQueryInput(value);

    updateUrl((params) => {
      const trimmed = value.trim();

      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
    });
  }

  /** Commit genre selection. */
  function toggleGenre(genre: string) {
    updateUrl((params) => {
      const selectedGenres = params
        .get("category")
        ?.split(",")
        .filter(Boolean) ?? [];

      const updatedGenres = selectedGenres.includes(genre)
        ? selectedGenres.filter((item) => item !== genre)
        : [...selectedGenres, genre];

      if (updatedGenres.length > 0) {
        params.set("category", updatedGenres.join(","));
      } else {
        params.delete("category");
      }
    });
  }

  /** Commit sorting selection. */
  function commitSort(value: BookSortKey) {
    updateUrl((params) => {
      if (value === "newest") {
        params.delete("sort");
      } else {
        params.set("sort", value);
      }
    });
  }

  /** Clear all filters. */
  function clearFilters() {
    setQueryInput("");
    router.replace("/books", { scroll: false });
  }

  /** Navigate to another page. */
  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(nextPage));

    router.replace(`/books?${params.toString()}`, {
      scroll: true,
    });
  }

  /** Load categories from API. */
  React.useEffect(() => {
    const controller = new AbortController();

    getCategories({ signal: controller.signal })
      .then((list) => {
        if (list.length > 0) {
          setGenres(list);
        }
      })
      .catch(() => {
        // Static fallback categories are already available.
      });

    return () => controller.abort();
  }, []);

  /** Fetch books whenever URL filters change. */
  React.useEffect(() => {
    const controller = new AbortController();

    getBooks(
      {
        q: q || undefined,
        category: categoryParam || undefined,
        sort,
        page,
        limit: 9,
      },
      { signal: controller.signal }
    )
      .then((data) => {
        setState({
          key: requestKey,
          status: "success",
          data,
          message: null,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setState({
          key: requestKey,
          status: "error",
          data: null,
          message:
            error instanceof Error
              ? error.message
              : "Something went wrong while loading books.",
        });
      });

    return () => controller.abort();
  }, [q, categoryParam, sort, page, requestKey, reloadNonce]);

  const loading = state.key !== requestKey;

  const hasFilters =
    Boolean(q) ||
    Boolean(categoryParam) ||
    sort !== "newest";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-bold text-forest sm:text-5xl">
        All Books
      </h1>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] xl:gap-8">
        <FilterSidebar
          genres={genres}
          query={queryInput}
          selectedGenres={categoryParam.split(",").filter(Boolean)}
          sort={sort}
          hasFilters={hasFilters}
          onQueryChange={setQueryInput}
          onQueryCommit={commitQuery}
          onToggleGenre={toggleGenre}
          onSortCommit={commitSort}
          onClear={clearFilters}
        />

        <section aria-label="Book catalogue" className="min-w-0">
          {state.status === "error" && state.message ? (
            <ErrorState
              message={state.message}
              onRetry={() =>
                setReloadNonce((current) => current + 1)
              }
            />
          ) : loading ? (
            <BooksGridSkeleton />
          ) : state.data ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p
                  className="text-sm text-muted-foreground"
                  aria-live="polite"
                >
                  {state.data.total === 0
                    ? "No books match your filters"
                    : state.data.total === 1
                      ? "Showing 1 book"
                      : `Showing ${
                          (state.data.page - 1) * state.data.limit + 1
                        }–${Math.min(
                          state.data.page * state.data.limit,
                          state.data.total
                        )} of ${state.data.total} books`}
                </p>
              </div>

              {state.data.books.length === 0 ? (
                <EmptyState
                  hasFilters={hasFilters}
                  onClear={clearFilters}
                />
              ) : (
                <>
                  {/* Three book cards per row on desktop */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {state.data.books.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>

                  {state.data.totalPages > 1 ? (
                    <Pagination
                      page={state.data.page}
                      totalPages={state.data.totalPages}
                      buildHref={goToPage}
                    />
                  ) : null}
                </>
              )}
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}

/** Grid skeleton matching the loaded card layout. */
export function BooksGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {Array.from({ length: 10 }, (_, index) => (
        <div key={index} className="flex flex-col gap-2.5">
          <Skeleton className="aspect-[3/4] w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-7 w-full" />
        </div>
      ))}
    </div>
  );
}

/** Full-page skeleton while search params resolve. */
export function BooksExplorerSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-12 w-48" />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] xl:gap-8">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[22rem] w-full" />
        </div>

        <BooksGridSkeleton />
      </div>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/60 px-4 py-16 text-center">
      {hasFilters ? (
        <SearchXIcon
          className="size-10 text-secondary"
          aria-hidden="true"
        />
      ) : (
        <BookIcon
          className="size-10 text-secondary"
          aria-hidden="true"
        />
      )}

      <p className="font-heading text-xl font-bold text-foreground">
        {hasFilters
          ? "No books match your search"
          : "The shelves are empty"}
      </p>

      <p className="max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "Try a different title, author or genre — the library is still growing."
          : "New books will appear here as soon as they join the library."}
      </p>

      {hasFilters ? <ClearButton onClick={onClear} /> : null}
    </div>
  );
}

function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-primary outline-none hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <RotateCcwIcon className="size-4" aria-hidden="true" />
      Clear all filters
    </button>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/60 px-4 py-16 text-center">
      <TriangleAlertIcon
        className="size-10 text-destructive"
        aria-hidden="true"
      />

      <p className="font-heading text-xl font-bold text-foreground">
        We couldn&apos;t load the library
      </p>

      <p className="max-w-sm text-sm text-muted-foreground">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-2 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-primary outline-none hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <RotateCcwIcon className="size-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}
