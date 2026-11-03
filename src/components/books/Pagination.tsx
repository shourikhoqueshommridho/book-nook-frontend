
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  buildHref,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <nav
      aria-label="Book pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => buildHref(page - 1)}
        className="flex size-10 items-center justify-center rounded-lg border border-border transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => buildHref(pageNumber)}
          aria-current={page === pageNumber ? "page" : undefined}
          className={`size-10 rounded-lg border text-sm font-medium transition ${
            page === pageNumber
              ? "border-forest bg-forest text-white"
              : "border-border hover:bg-muted"
          }`}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => buildHref(page + 1)}
        className="flex size-10 items-center justify-center rounded-lg border border-border transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
