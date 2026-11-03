import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Books — BookNook",
  description:
    "Browse the full BookNook library. Search by title or author, filter by genre, sort and paginate through every book.",
};

export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
