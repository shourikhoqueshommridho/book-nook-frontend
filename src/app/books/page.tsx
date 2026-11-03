import { Suspense } from "react";


import { BooksExplorerSkeleton, BooksExplorer } from "@/components/books/BooksExplorer";

/**
 * All Books page (src/app/books). The interactive explorer streams in behind
 * a Suspense boundary: filtering state lives in the URL so searches stay
 * shareable and the server/client split stays hydration-safe.
 */
export default function BooksPage() {
  return (
    <>
     
      <main className="flex-1">
        <Suspense fallback={<BooksExplorerSkeleton />}>
          <BooksExplorer />
        </Suspense>
      </main>
     
    </>
  );
}
