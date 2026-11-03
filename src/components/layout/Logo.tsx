
import Link from "next/link";
import { BookOpenIcon } from "lucide-react";
import { cn } from "cn";

interface LogoProps {
  className?: string;
  variant?: "default" | "cream";
}

/** BookNook wordmark used in the navbar, footer and mobile menu. */
export function Logo({ className, variant = "default" }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex w-fit items-center gap-2",
        variant === "cream" ? "text-[#f7f4ec]" : "text-foreground",
        className
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-lg",
          variant === "cream"
            ? "bg-[#f7f4ec]/10 ring-1 ring-[#f7f4ec]/20"
            : "bg-[#9DBFA8] ring-1 ring-[#9DBFA8]/20"
        )}
      >
        <BookOpenIcon
          className={cn(
            "size-5",
            variant === "cream"
              ? "text-[#a8b99a]"
              : "text-[#E6F0E7]"
          )}
          aria-hidden="true"
        />
      </span>

      <span className="font-heading text-xl font-bold tracking-tight">
        Book<span className="text-primary">Nook</span>
      </span>
    </Link>
  );
}
