"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Keyboard, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { buttonVariants } from "@/components/ui/button";

interface HeroSlide {
  image: string;
  alt: string;
  heading: string;
  description: string;
  cta: string;
}

/* Assignment copy for the three homepage slides. All CTAs route to /books. */
const slides: HeroSlide[] = [
  {
    image: "/images/hero-1.jpg",
    alt: "A stack of well-read books beside a small potted plant in warm window light",
    heading: "A World of Stories, Waiting for You.",
    description:
      "Discover beautiful books and explore your next favorite story.",
    cta: "Browse Books",
  },
  {
    image: "/images/hero-2.jpg",
    alt: "Tall wooden shelves filled with books inside a classic library hall",
    heading: "Every Book Opens a New World.",
    description:
      "Explore fiction, science, history and many more categories.",
    cta: "Explore Collection",
  },
  {
    image: "/images/hero-3.jpg",
    alt: "An open book resting on a table next to a cup of coffee",
    heading: "Read More. Discover More.",
    description:
      "Borrow your favorite books and make reading a daily habit.",
    cta: "Start Exploring",
  },
];

export function HeroSlider() {
  return (
    <section aria-label="Featured highlights" className="w-full">
      <Swiper
        className="hero-swiper h-[26rem] w-full sm:h-[30rem] lg:h-[34rem]"
        modules={[Autoplay, Navigation, Pagination, Keyboard, A11y]}
        loop
        speed={800}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true }}
        navigation
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.image}>
            <div className="relative h-full w-full">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={slide === slides[0]}
                sizes="100vw"
                className="object-cover"
              />
              {/* Readability overlay */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-[#0e231d]/85 via-[#173f35]/45 to-transparent"
              />
              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="max-w-xl pb-8">
                    <h1 className="font-heading text-4xl font-bold leading-tight text-[#f7f4ec] sm:text-5xl lg:text-6xl">
                      {slide.heading}
                    </h1>
                    <p className="mt-4 max-w-md text-base text-[#f7f4ec]/85 sm:text-lg">
                      {slide.description}
                    </p>
                    <Link
                      href="/books"
                      className={buttonVariants({
                        size: "lg",
                        className: "mt-8 h-11 px-7 text-[0.95rem]",
                      })}
                    >
                      {slide.cta}
                      <ArrowRightIcon data-icon="inline-end" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
