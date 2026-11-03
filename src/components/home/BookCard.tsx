import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
}

function StarRating({ rating }: { rating: number }) {
  const clamped = Math.min(Math.max(rating, 0), 5);
  const filled = Math.round(clamped);
  return (
    <span
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`Rated ${clamped} out of 5`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          className={
            index < filled
              ? "size-3.5 fill-primary text-primary"
              : "size-3.5 text-muted-foreground/40"
          }
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

/**
 * Book cover card — shared by the homepage and the All Books page.
 * Cover, rating and availability all come from the API; rating and
 * availability rows only render when the API provides them.
 */
export function BookCard({ book }: BookCardProps) {
  const outOfStock = book.copiesAvailable !== undefined && book.copiesAvailable === 0;

  return (
    <Card
      className="group/card gap-0 overflow-hidden px-0 py-0 pt-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Image
          src={book.cover}
          alt={`Cover of ${book.title} by ${book.author}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          className="object-cover transition-transform duration-500 group-hover/card:scale-105"
        />
      </div>
      <CardContent className="flex flex-1 flex-col gap-2 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="secondary"
            className="h-6 w-fit px-2.5 text-[0.7rem] font-semibold uppercase tracking-wide"
          >
            {book.category}
          </Badge>
          {book.copiesAvailable !== undefined ? (
            outOfStock ? (
              <Badge className="h-6 w-fit bg-muted text-muted-foreground">Out of stock</Badge>
            ) : (
              <Badge className="h-6 w-fit bg-card text-forest ring-1 ring-secondary">
                {book.copiesAvailable} available
              </Badge>
            )
          ) : null}
        </div>
        <h3 className="font-heading text-lg font-bold leading-snug text-foreground">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground">{book.author}</p>
        {typeof book.rating === "number" ? <StarRating rating={book.rating} /> : null}
        <Link
          href={`/books/${book.id}`}
          className={buttonVariants({ variant: "default", className: "mt-3 w-full" })}
        >
          View Details
        </Link>
      </CardContent>
    </Card>
  );
}
