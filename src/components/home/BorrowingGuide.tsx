import {
  BookCheckIcon,
  BookMarkedIcon,
  SearchIcon,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/home/SectionHeading";

interface BorrowingStep {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: BorrowingStep[] = [
  {
    number: "01",
    icon: SearchIcon,
    title: "Discover",
    description: "Explore our growing collection and find a book you love.",
  },
  {
    number: "02",
    icon: BookMarkedIcon,
    title: "Borrow",
    description: "Choose your favorite book and borrow it with ease.",
  },
  {
    number: "03",
    icon: BookCheckIcon,
    title: "Return",
    description:
      "Return your book and discover another wonderful story.",
  },
];

export function BorrowingGuide() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading title="Your Next Read Is Just Three Steps Away" />
      <div className="relative">
        {/* Connecting dashed line on desktop, behind the icon badges */}
        <div
          aria-hidden="true"
          className="absolute top-10 right-[16.6%] left-[16.6%] hidden border-t-2 border-dashed border-secondary lg:block"
        />
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center gap-4 text-center"
            >
              <div className="relative z-10 flex items-center gap-3 bg-background px-3">
                <span className="flex size-20 items-center justify-center rounded-full bg-secondary/40 ring-1 ring-secondary">
                  <step.icon className="size-9 text-forest" aria-hidden="true" />
                </span>
              </div>
              <p className="font-heading text-sm font-bold tracking-[0.25em] text-primary">
                {step.number}
              </p>
              <h3 className="font-heading text-2xl font-bold text-forest">
                {step.title}
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
