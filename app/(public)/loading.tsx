import HeroCarouselSkeleton from "@/components/homepage/heroSection/HeroCarouselSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen p-8 md:p-24 space-y-12">
      {/* Hero Section Skeleton */}
      <div className="flex flex-col md:flex-row gap-12 items-center">
        {/* Left Text Skeleton */}
        <div className="w-full md:w-1/2 space-y-6">
          <div className="h-12 w-3/4 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-12 w-1/2 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-24 w-full bg-gray-50 rounded-lg animate-pulse" />
        </div>

        {/* Right Carousel Skeleton */}
        <div className="w-full md:w-1/2">
           <HeroCarouselSkeleton />
        </div>
      </div>
    </div>
  );
}