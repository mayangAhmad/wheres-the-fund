'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CampaignCard from '@/components/campaigns/CampaignCard'
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel'
import { useSwipeable } from 'react-swipeable'
import clsx from 'clsx'
import { useResponsiveVisibleItems } from '@/hooks/useResponsiveVisibleItems'

interface HeroCampaignCarouselProps {
  campaigns: any[]
}

export default function HeroCampaignCarousel({ campaigns }: HeroCampaignCarouselProps) {
  const visibleItems = useResponsiveVisibleItems()

  const {
    index,
    handleNext,
    handlePrev,
    disableAnimation,
    isTransitioning,
    translateX,
    containerRef
  } = useInfiniteCarousel(campaigns.length, visibleItems)

  const infiniteCampaigns = useMemo(() => {
    if (campaigns.length === 0) return []
    const startClones = campaigns.slice(-visibleItems)
    const endClones = campaigns.slice(0, visibleItems)
    return [...startClones, ...campaigns, ...endClones]
  }, [campaigns, visibleItems])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true,
  })

  if (campaigns.length === 0) return null

  return (
    <div 
      // FIX 1: Removed 'group' from here
      className="w-full select-none flex items-center gap-2 sm:gap-4" 
      {...swipeHandlers}
    >
      
      {/* PREV BUTTON (Now Static, on the left) */}
      <button
        onClick={handlePrev}
        disabled={isTransitioning}
        // REMOVED: absolute positioning, opacity-0
        // ADDED: shrink-0 (prevents button from getting squashed)
        className="shrink-0 hidden md:block bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full p-3 transition-all disabled:opacity-30 disabled:scale-90 disabled:cursor-default"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* CAROUSEL WINDOW (Middle) */}
      {/* Added flex-1 to fill the space between buttons */}
      <div className="overflow-hidden flex-1 -my-8 py-8 px-1">
        <div
          ref={containerRef}
          className={clsx(
            "flex gap-5",
            !disableAnimation && "transition-transform duration-500 ease-in-out"
          )}
          style={{ transform: `translateX(${translateX}px)` }}
        >
          {infiniteCampaigns.map((campaign, i) => {
            const isVisible = i >= index && i < index + visibleItems
            return (
              <div
                key={`${campaign.id}-${i}`}
                className="shrink-0 w-full sm:w-[calc((100%-40px)/3)]"
                aria-hidden={!isVisible}
              >
                {/* FIX 2: Added 'group' here so the hover effect is isolated to this specific card */}
                <div className="group transition-transform duration-300 hover:-translate-y-2 h-full">
                  <CampaignCard campaign={campaign} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* NEXT BUTTON (Now Static, on the right) */}
      <button
        onClick={handleNext}
        disabled={isTransitioning}
        // REMOVED: absolute positioning, opacity-0
        // ADDED: shrink-0
        className="shrink-0 hidden md:block bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full p-3 transition-all disabled:opacity-30 disabled:scale-90 disabled:cursor-default"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  )
}