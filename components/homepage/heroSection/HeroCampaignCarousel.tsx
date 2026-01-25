// HeroCampaignCarousel.tsx
'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CampaignCard from '@/components/campaigns/CampaignCard'
import { useInfiniteCarousel } from '@/hooks/useInfiniteCarousel'
import { useSwipeable } from 'react-swipeable'
import clsx from 'clsx'
import { useResponsiveVisibleItems } from '@/hooks/useResponsiveVisibleItems'
// 1. Import the Type from your file
import { Campaign } from '@/types/ngo' 

interface HeroCampaignCarouselProps {
  campaigns: Campaign[] // 2. Use the imported interface here
}

export default function HeroCampaignCarousel({ campaigns }: HeroCampaignCarouselProps) {
  const visibleItems = useResponsiveVisibleItems()

const filteredCampaigns = useMemo(() => {
  return campaigns.filter((campaign) => {
    const category = (campaign.category || "").toLowerCase().trim();
    
    const allowedKeywords = ['disaster', 'hunger'];
    const isMatchCategory = allowedKeywords.some(kw => category.includes(kw));

    const status = (campaign.status || "").toLowerCase().trim();
    const isActive = status === 'ongoing' || status === 'active';

    return isMatchCategory && isActive;
  });
}, [campaigns]);

  const {
    index,
    handleNext,
    handlePrev,
    disableAnimation,
    isTransitioning,
    translateX,
    containerRef,
    isReady
  } = useInfiniteCarousel(filteredCampaigns.length, visibleItems)

  const infiniteCampaigns = useMemo(() => {
    if (filteredCampaigns.length === 0) return []
    const startClones = filteredCampaigns.slice(-visibleItems)
    const endClones = filteredCampaigns.slice(0, visibleItems)
    return [...startClones, ...filteredCampaigns, ...endClones]
  }, [filteredCampaigns, visibleItems])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true,
  })

  if (filteredCampaigns.length === 0) return null
  if (!isReady) return ( // ✅ Show placeholder while measuring
  <div className="w-full h-64 flex items-center justify-center">
    <div className="animate-pulse text-white">Loading campaigns...</div>
  </div>
)

  return (
    <div 
      className="w-full select-none flex items-center gap-2 sm:gap-4" 
      {...swipeHandlers}
    >
      <button
        onClick={handlePrev}
        disabled={isTransitioning}
        className="shrink-0 hidden md:block bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full p-3 transition-all disabled:opacity-30 disabled:scale-90"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

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
                <div className="group transition-transform duration-300 hover:-translate-y-2 h-full">
                  {/* Now CampaignCard also receives the typed object */}
                  <CampaignCard
                   campaign={campaign} 
                   priority={i < 3}
                   />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={isTransitioning}
        className="shrink-0 hidden md:block bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full p-3 transition-all disabled:opacity-30 disabled:scale-90"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  )
}