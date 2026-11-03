import Link from "next/link";
import {
  BlocksIcon,
  BookOpenIcon,
  FlaskConicalIcon,
  LandmarkIcon,
  PaletteIcon,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { bookCategories } from "@/data/categories";

/** Lucide illustration per assignment category. */
const categoryIcons: Record<string, LucideIcon> = {
  Fiction: BookOpenIcon,
  Science: FlaskConicalIcon,
  History: LandmarkIcon,
  Kids: BlocksIcon,
  Others: PaletteIcon,
};

export function ExploreCategories() {
  return (
    <section className="w-full bg-muted/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          title="Explore by Genre"
          subtitle="Find your next favorite book from our collections."
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {bookCategories.map((category) => {
            const Icon = categoryIcons[category.name];
            return (
              <Link
                key={category.name}
                href={`/books?category=${encodeURIComponent(category.name)}`}
                aria-label={`Browse ${category.name} books`}
                className="group flex flex-col items-center gap-3 rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10 outline-none transition-all duration-300 hover:-translate-y-1 hover:ring-2 hover:ring-primary focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span
                  className="flex size-14 items-center justify-center rounded-full bg-secondary/40 text-forest transition-colors duration-300 group-hover:bg-secondary"
                  aria-hidden="true"
                >
                  <Icon className="size-7" />
                </span>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {category.name}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {category.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
