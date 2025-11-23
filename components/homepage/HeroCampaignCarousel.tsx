'use client'

import { useState, useEffect } from 'react'
import { useCampaigns } from '../../hooks/useCampaigns'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CampaignCard from '@/components/campaigns/CampaignCard'

export default function HeroCampaignCarousel() {
  const { campaigns, loading } = useCampaigns()
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // NEW: State to track how many cards to show based on screen width
  const [cardsToShow, setCardsToShow] = useState(3)

  // Filter only disaster relief campaigns
  const disasterCampaigns = campaigns
    .filter(c => c.category?.toLowerCase() === 'disaster')
    .slice(0, 10)

  // NEW: Handle Screen Resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsToShow(1) // Mobile: Show 1 big card
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2) // Tablet: Show 2 cards
      } else {
        setCardsToShow(3) // Desktop: Show 3 cards
      }
    }

    // Set initial value
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handlePrev = () => setCurrentIndex(prev => Math.max(prev - 1, 0))
  
  // UPDATED: Logic now uses dynamic cardsToShow instead of hardcoded 3
  const handleNext = () =>
    setCurrentIndex(prev =>
      Math.min(prev + 1, disasterCampaigns.length - cardsToShow)
    )

  if (loading) return <p className="text-gray-600">Loading campaigns...</p>
  if (disasterCampaigns.length === 0)
    return <p className="text-gray-600">No disaster relief campaigns yet.</p>

  return (
    <div className="relative w-full h-full flex flex-col justify-center">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        Disaster Relief Campaigns
      </h3>

      <div className="relative overflow-hidden p-1"> 
      {/* ^ Added p-1 to prevent shadow clipping */}
        
        <motion.div
          className="flex gap-5"
          // UPDATED: Animation math based on dynamic width (100%, 50%, or 33%)
          animate={{ 
            x: `calc(-${currentIndex * (100 / cardsToShow)}% - ${currentIndex * 20}px)` 
            // Note: 20px accounts for the gap-5 (which is 20px)
          }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        >
          {disasterCampaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              className="flex-shrink-0 cursor-pointer rounded-lg"
              // UPDATED: Dynamic width calculation
              style={{ width: `calc(${100 / cardsToShow}% - ${20 * (cardsToShow - 1) / cardsToShow}px)` }}
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <CampaignCard campaign={campaign} />
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Buttons */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur shadow-md rounded-full p-2 hover:bg-gray-100 z-10 text-gray-800"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        
        {/* UPDATED: Condition uses cardsToShow */}
        {currentIndex < disasterCampaigns.length - cardsToShow && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur shadow-md rounded-full p-2 hover:bg-gray-100 z-10 text-gray-800"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  )
}