import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/** Editorial "reading space" banner — static content, distinct from the hero slider. */
export function ReadingSpace() {
  return (
    <section
      aria-label="Make space for stories"
      className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="relative min-h-[24rem] overflow-hidden rounded-3xl shadow-xl shadow-forest/10 sm:min-h-[26rem] lg:min-h-[30rem]">
        <Image
          src="/images/reading-space.jpg"
          alt="A cozy corner with books, a warm blanket and a cup of coffee"
          fill
          sizes="(max-width: 1024px) 100vw, 1152px"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0e231d]/90 via-[#173f35]/55 to-[#173f35]/20"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-xl px-6 sm:px-10 lg:px-14">
            <h2 className="font-heading text-3xl font-bold leading-tight text-[#f7f4ec] sm:text-4xl lg:text-5xl">
              Make Space for Stories.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#f7f4ec]/85 sm:text-base">
              Every great book takes you somewhere new. Find your next
              adventure and make reading part of your everyday life.
            </p>
            <Link
              href="/books"
              className={buttonVariants({
                size: "lg",
                className: "mt-8 h-11 px-7 text-[0.95rem]",
              })}
            >
              Explore Books
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
