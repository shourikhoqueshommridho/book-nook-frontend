import { Suspense } from "react";
import { HeroSlider } from "@/components/home/HeroSlider";
import { NewArrivals, NewArrivalsFallback } from "@/components/home/NewArrivals";
import { ExploreCategories } from "@/components/home/ExploreCategories";
import { BorrowingGuide } from "@/components/home/BorrowingGuide";
import { ReadingSpace } from "@/components/home/ReadingSpace";
import { Skeleton } from "@/components/ui/skeleton";

/** Static placeholder matching the hero height while the slider streams in. */
function HeroSkeleton() {
  return <Skeleton className="h-[26rem] w-full rounded-none sm:h-[30rem] lg:h-[34rem]" />;
}

/**
 * BookNook homepage. Sections are ordered per the assignment brief.
 * New Arrivals is server-rendered from the live Express + MongoDB API.
 */
export default function Home() {
  return (
    <>
      
      <main className="flex-1">
        {/* Swiper reads the clock internally and New Arrivals fetches the API — both stream in behind Suspense */}
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSlider />
        </Suspense>
        <Suspense fallback={<NewArrivalsFallback />}>
          <NewArrivals />
        </Suspense>
        <ExploreCategories />
        <BorrowingGuide />
        <ReadingSpace />
      </main>
      
    </>
  );
}
