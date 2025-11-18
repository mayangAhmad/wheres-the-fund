'use client'

import { useState } from 'react'
import { useCampaigns } from '../../hooks/useCampaigns'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CampaignCard from '@/components/campaigns/CampaignCard'

export default function HeroCampaignCarousel() {
  const { campaigns, loading } = useCampaigns()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Filter only disaster relief campaigns
  const disasterCampaigns = campaigns
    .filter(c => c.category?.toLowerCase() === 'disaster')
    .slice(0, 10) // top 10 campaigns

  const CARDS_VISIBLE = 3

  const handlePrev = () => setCurrentIndex(prev => Math.max(prev - 1, 0))
  const handleNext = () =>
    setCurrentIndex(prev =>
      Math.min(prev + 1, disasterCampaigns.length - CARDS_VISIBLE)
    )

  if (loading) return <p className="text-gray-600">Loading campaigns...</p>
  if (disasterCampaigns.length === 0)
    return <p className="text-gray-600">No disaster relief campaigns yet.</p>

  return (
    <div className="relative w-full h-full flex flex-col justify-center">
      {/* Title */}
      <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        Disaster Relief Campaigns
      </h3>

      {/* Carousel Container */}
      <div className="relative overflow-visible">
        <motion.div
          className="flex gap-5"
          animate={{ x: `calc(-${currentIndex * 33.33}% - ${currentIndex * 5}px)` }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        >
          {disasterCampaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              className="flex-shrink-0 w-1/3 cursor-pointer rounded-lg"
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
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        {currentIndex < disasterCampaigns.length - CARDS_VISIBLE && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>
    </div>
  )
}
