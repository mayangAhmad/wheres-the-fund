'use client'

import { useState, useEffect, useRef } from 'react'
import { useCampaigns } from '../hooks/useCampaigns'
import Image from 'next/image'
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'

export default function CampaignSlider() {
  const { campaigns, loading } = useCampaigns()
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 3
    const width = window.innerWidth
    if (width >= 1280) return 4
    if (width >= 768) return 3
    return 1
  }

  const [visibleCount, setVisibleCount] = useState(getVisibleCount())

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.offsetWidth / visibleCount
      containerRef.current.scrollTo({
        left: scrollAmount * currentIndex,
        behavior: 'smooth',
      })
    }
  }, [currentIndex, visibleCount])

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }

  const handleNext = () => {
    setCurrentIndex(prev =>
      Math.min(prev + 1, campaigns.length - visibleCount)
    )
  }

  const disasterCampaigns = campaigns.filter(
    campaign => campaign.category?.toLowerCase() === 'disaster relief'
  )

  if (loading) return <div className="px-6 md:px-16 lg:px-20">Loading campaigns...</div>
  if (disasterCampaigns.length === 0) return <div className="px-6 md:px-16 lg:px-20">No disaster-relief campaigns found.</div>

  return (
    <section className="py-16 px-6 md:px-16 lg:px-20 bg-white mr-4">
      <div className="max-w-[90rem] mx-auto">
        {/* Title */}
        <div className="flex items-center mb-4">
          <TrendingUp className="text-red-500 mr-2" />
          <h2 className="text-xl font-semibold">Trending Campaigns</h2>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Left Button */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Right Button */}
          {currentIndex < disasterCampaigns.length - visibleCount && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Sliding Container */}
          <div
            ref={containerRef}
            className="flex overflow-hidden scroll-smooth"
          >
            {disasterCampaigns.map(campaign => (
              <div
                key={campaign.id}
                className="min-w-[calc(100%/4)] px-2 transition-transform duration-300 ease-in-out"
                style={{ flex: `0 0 ${100 / visibleCount}%` }}
              >
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="relative w-full h-40 mb-2">
                    <Image
                      src={campaign.image_url || '/placeholder.jpg'}
                      alt={campaign.title}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold">{campaign.title}</h3>
                  <p className="text-sm text-gray-600">{campaign.ngo_name}</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(campaign.collected_amount / campaign.goal_amount) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs mt-1">
                      RM {campaign.collected_amount.toLocaleString()} / RM {campaign.goal_amount.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ends: {new Date(campaign.end_date!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
