import type { BookCategory } from "@/types/book";

export interface BookCategoryInfo {
  name: BookCategory;
  description: string;
}

/**
 * The assignment's five required categories.
 * TODO(API): the category filter will later query
 * `GET /api/books?category=<name>`.
 */
export const bookCategories: BookCategoryInfo[] = [
  {
    name: "Fiction",
    description: "Immersive stories and unforgettable worlds.",
  },
  {
    name: "Science",
    description: "Understand how the world really works.",
  },
  {
    name: "History",
    description: "Journeys through the events that shaped us.",
  },
  {
    name: "Kids",
    description: "Gentle reads that spark young imaginations.",
  },
  {
    name: "Others",
    description: "Self-help, biography and everything in between.",
  },
];
