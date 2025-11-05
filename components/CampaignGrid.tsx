'use client'

import { useCampaigns } from '../hooks/useCampaigns'
import Image from 'next/image'
import Link from 'next/link'

// ✅ Define props interface
interface CampaignGridProps {
  filterStatus: string
  filterCategory: string
  searchTerm: string
}

export default function CampaignGrid({
  filterStatus,
  filterCategory,
  searchTerm,
}: CampaignGridProps) {
  const { campaigns, loading } = useCampaigns()

  if (loading)
    return <div className="px-6 md:px-16 lg:px-20">Loading campaigns...</div>

  // ✅ Filter logic
  const filtered = campaigns
    .filter((c) => {
      const matchStatus =
        filterStatus === 'All Status' ||
        c.status?.toLowerCase() === filterStatus.toLowerCase()
      const matchCategory =
        filterCategory === 'All Campaigns' ||
        c.category?.toLowerCase() === filterCategory.toLowerCase()
      const matchSearch =
        !searchTerm ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase())

      return matchStatus && matchCategory && matchSearch
    })
    .slice(0, 20)

  if (filtered.length === 0)
    return <div className="px-6 md:px-16 lg:px-20">No campaigns available.</div>

  return (
    <section className="py-16 px-6 md:px-16 lg:px-20 bg-white">
      <div className="max-w-[90rem] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Active Campaigns</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((campaign) => {
            // ✅ fallback values
            const collected = campaign.collected_amount ?? 0
            const goal = campaign.goal_amount ?? 0
            const endDate = campaign.end_date ? new Date(campaign.end_date) : null
            const progress = goal > 0 ? Math.min((collected / goal) * 100, 100) : 0

            return (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative w-full h-40 mb-2 flex-shrink-0">
                  <Image
                    src={campaign.image_url || '/placeholder.jpg'}
                    alt={campaign.title}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>

                {/* Main content grows to fill space */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{campaign.title}</h3>
                  <p className="text-sm text-gray-600">{campaign.ngo_name || 'Anonymous NGO'}</p>

                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1">
                      RM {collected.toLocaleString()} / RM {goal.toLocaleString()}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Ends: {endDate ? endDate.toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                {/* Button sticks at the bottom */}
                <Link
                  href={`/campaign/${campaign.id}`}
                  className="mt-4 block w-full text-center bg-orange-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Donate Now
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
