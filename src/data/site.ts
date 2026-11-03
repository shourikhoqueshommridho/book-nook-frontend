/**
 * Shared site navigation and footer content.
 * Routes for future pages (/books, /books/add, ...) are defined here once
 * so the Navbar, Footer and mobile Sheet always stay in sync.
 */
export interface NavLink {
  label: string;
  href: string;
}

/** Public navigation — always visible in the Navbar. */
export const publicNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/books" },
];

/** Private navigation — shown only for authenticated users. */
export const privateNavLinks: NavLink[] = [
  { label: "Add Book", href: "/add-book" },
  { label: "My Books", href: "/my-books" },
  { label: "My Borrows", href: "/my-borrows" },
];

export const footerLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/books" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const siteContact = {
  email: "contact@booknook.com",
  location: "Dhaka, Bangladesh",
};
