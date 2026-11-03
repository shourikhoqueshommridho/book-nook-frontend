/** The five assignment-required book categories. */
export type BookCategory = "Fiction" | "Science" | "History" | "Kids" | "Others";

/**
 * Book shape mirrors what the Express + MongoDB API returns
 * (see backend src/database.js → toApiBook()).
 * `cover` may be a URL or a local `/covers/...` path until the
 * Add Book flow stores real image URLs in MongoDB.
 */
/** The authenticated user who added the book (now stored with every book). */
export interface BookOwner {
  name: string;
  email: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  cover: string;
  description?: string;
  /** Average rating 0–5; null/undefined when the book has no rating yet. */
  rating?: number | null;
  /** Total copies owned; undefined while the borrow system isn't rolled out. */
  copies?: number;
  /** Copies currently available to borrow. */
  copiesAvailable?: number;
  /** Populated for books created through the authenticated Add Book flow. */
  addedBy?: BookOwner;
  createdAt: string; // ISO timestamp — used for "newest first" sorting
  updatedAt: string;
}
