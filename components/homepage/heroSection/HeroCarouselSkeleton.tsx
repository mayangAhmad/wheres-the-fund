export default function HeroCarouselSkeleton() {
  return (
    <div className="w-full h-full flex flex-col justify-center animate-pulse">
      {/* Title Skeleton */}
      <div className="h-8 w-64 bg-gray-200 rounded-md mb-6" />

      {/* Carousel Track Skeleton */}
      <div className="flex gap-5 overflow-hidden py-4 px-2 -my-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-1/3 flex-shrink-0 flex flex-col space-y-3">
            {/* Image Placeholder */}
            <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl" />
            
            {/* Content Placeholders */}
            <div className="px-1 space-y-2">
              <div className="h-6 w-3/4 bg-gray-200 rounded" /> {/* Title */}
              <div className="h-4 w-1/2 bg-gray-200 rounded" /> {/* Category */}
              
              {/* Progress Bar Skeleton */}
              <div className="h-2 w-full bg-gray-200 rounded-full mt-4" />
              
              {/* Stats Row */}
              <div className="flex justify-between mt-2">
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}