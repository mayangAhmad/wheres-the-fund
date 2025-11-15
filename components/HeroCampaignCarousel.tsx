'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCampaigns } from '../hooks/useCampaigns'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HeroCampaignCarousel() {
  const { campaigns, loading } = useCampaigns()
  const [currentIndex, setCurrentIndex] = useState(0)

  //  Filter only disaster relief campaigns
  const disasterCampaigns = campaigns
    .filter(c => c.category?.toLowerCase() === 'disaster relief')
    .slice(0, 10) // top 10, show 3 at once

  const handlePrev = () =>
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  const handleNext = () =>
    setCurrentIndex(prev =>
      Math.min(prev + 1, disasterCampaigns.length - 3)
    )

  if (loading)
    return <p className="text-gray-600">Loading campaigns...</p>
  if (disasterCampaigns.length === 0)
    return <p className="text-gray-600">No disaster relief campaigns yet.</p>

  return (
    <div className="relative w-full h-full flex flex-col justify-center">
      {/* Title */}
      <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
         Disaster Relief Campaigns
      </h3>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-5"
          animate={{ x: `-${currentIndex * 33.33}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        >
          {disasterCampaigns.map((campaign) => {
            const progress =
              (campaign.collected_amount / campaign.goal_amount) * 100

            return (
              <motion.div
                key={campaign.id}
                className="flex-shrink-0 w-1/3 max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] xl:max-w-[440px] rounded-xl 
                border border-zinc-200 bg-white shadow-xl hover:shadow-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                whileHover={{ scale: 1.03 }}
              >
                {/* Image */}
                <div className="relative w-full h-44 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={campaign.image_url || '/placeholder.jpg'}
                    alt={campaign.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <h4 className="font-bold text-gray-900 text-base truncate">
                  {campaign.title}
                </h4>
                <p className="text-sm text-gray-500 mb-2 truncate">
                  {campaign.ngo_name}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  RM {campaign.collected_amount.toLocaleString()} / RM{' '}
                  {campaign.goal_amount.toLocaleString()}
                </p>

                {/* Donate Button */}
                <Link
                  href={`/campaign/${campaign.id}`}
                  className="block w-full text-center bg-orange-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Donate Now
                </Link>
              </motion.div>
            )
          })}
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
        {currentIndex < disasterCampaigns.length - 3 && (
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
