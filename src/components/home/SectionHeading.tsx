import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

/** Shared heading block for homepage sections: title, subtitle and optional link CTA. */
export function SectionHeading({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="font-heading text-3xl font-bold text-forest sm:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {ctaLabel && ctaHref ? (
        <Link
          href={ctaHref}
          className="group inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-primary outline-none transition-colors hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {ctaLabel}
          <ArrowRightIcon
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  );
}
