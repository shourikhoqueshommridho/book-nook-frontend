
"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
} from "lucide-react";
import { BOOK_SORTS, type BookSortKey } from "@/lib/api";
import { bookCategories } from "@/data/categories";

interface FilterSidebarProps {
  genres: string[];
  query: string;
  selectedGenres: string[];
  sort: BookSortKey;
  hasFilters: boolean;
  onQueryChange: (value: string) => void;
  onQueryCommit: (value: string) => void;
  onToggleGenre: (genre: string) => void;
  onSortCommit: (value: BookSortKey) => void;
  onClear: () => void;
}

function SectionHeader({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-2 rounded-md py-1.5 text-left font-heading text-[0.95rem] font-bold text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {label}

      {open ? (
        <ChevronUpIcon
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        />
      ) : (
        <ChevronDownIcon
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export function FilterSidebar({
  genres,
  query,
  selectedGenres,
  sort,
  hasFilters,
  onQueryChange,
  onQueryCommit,
  onToggleGenre,
  onSortCommit,
  onClear,
}: FilterSidebarProps) {
  const [genreOpen, setGenreOpen] = React.useState(true);
  const [sortOpen, setSortOpen] = React.useState(true);

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const genreList =
    genres.length > 0
      ? genres
      : bookCategories.map((category) => category.name);

  function onSearchChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    onQueryChange(value);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onQueryCommit(value);
    }, 400);
  }

  function onSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    onQueryCommit(query);
  }

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-20">
      <form onSubmit={onSearchSubmit} role="search">
        <div className="flex overflow-hidden rounded-xl bg-card ring-1 ring-border focus-within:ring-2 focus-within:ring-primary/60">
          <label className="sr-only" htmlFor="book-search">
            Search books by title or author
          </label>

          <input
            id="book-search"
            type="search"
            placeholder="Search…"
            autoComplete="off"
            value={query}
            onChange={onSearchChange}
            className="h-11 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
          />

          <button
            type="submit"
            aria-label="Search books"
            className="flex w-12 shrink-0 items-center justify-center bg-forest text-[#f7f4ec] outline-none transition-colors hover:bg-forest/90 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <SearchIcon className="size-5" aria-hidden="true" />
          </button>
        </div>
      </form>

      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="mb-1 flex items-center justify-between gap-2 border-b border-border pb-3">
          <h2 className="font-heading font-bold text-foreground">
            Filter &amp; Refine
          </h2>

          {hasFilters ? (
            <button
              type="button"
              onClick={onClear}
              className="rounded text-xs font-semibold text-primary outline-none hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Clear
            </button>
          ) : null}
        </div>

        {/* Genre filters */}
        <div className="border-b border-border/60 py-2">
          <SectionHeader
            label="Genre"
            open={genreOpen}
            onToggle={() => setGenreOpen((open) => !open)}
          />

          {genreOpen ? (
            <ul className="mt-2 flex flex-col gap-2">
              {genreList.map((genre) => (
                <li key={genre}>
                  <label className="flex cursor-pointer select-none items-center gap-2.5 rounded-md py-0.5 text-sm text-foreground/85">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre)}
                      onChange={() => onToggleGenre(genre)}
                      className="size-4 rounded accent-[#b9694e] dark:accent-[#c87f63]"
                    />
                    {genre}
                  </label>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Sort controls */}
        <div className="py-2">
          <SectionHeader
            label="Sort by"
            open={sortOpen}
            onToggle={() => setSortOpen((open) => !open)}
          />

          {sortOpen ? (
            <ul className="mt-2 flex flex-col gap-2">
              {BOOK_SORTS.map((option) => (
                <li key={option.value}>
                  <label className="flex cursor-pointer select-none items-center gap-2.5 rounded-md py-0.5 text-sm text-foreground/85">
                    <input
                      type="radio"
                      name="book-sort"
                      checked={option.value === sort}
                      onChange={() => onSortCommit(option.value)}
                      className="size-4 accent-[#b9694e] dark:accent-[#c87f63]"
                    />
                    {option.label}
                  </label>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
