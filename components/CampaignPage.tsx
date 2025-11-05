'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Search, SlidersHorizontal } from 'lucide-react'
import CampaignGrid from '@/components/CampaignGrid'

interface DropdownProps {
  options: string[]
  selected: string
  setSelected: (value: string) => void
}

function Dropdown({ options, selected, setSelected }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="relative w-44" ref={containerRef}>
      {/* Dropdown button */}
      <div
        className="flex justify-between items-center bg-gray-200 px-4 py-2 rounded-full cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selected}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className={`h-5 w-5 ml-2 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {/* Options */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
          <div className="flex flex-col">
            {options.map((opt) => (
              <button
                key={opt}
                className="text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setSelected(opt)
                  setIsOpen(false)
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CampaignPage() {
  const [filterStatus, setFilterStatus] = useState('All Status')
  const [filterCategory, setFilterCategory] = useState('All Campaigns')
  const [searchTerm, setSearchTerm] = useState('')

  const statusOptions = ['All status', 'Ongoing', 'Completed']
  const categoryOptions = ['All Campaigns', 'Disaster Relief', 'Education', 'Charity']

  return (
    <>
      {/* HERO */}
      <section className="relative h-[60vh] w-full">
        <Image
          src="/hero-image.jpg"
          alt="Campaigns background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg mb-12">
            Browse Campaigns
          </h1>
          <p className="text-lg md:text-xl mt-3">
            “Charity does not decrease wealth.” <br />
            <span className="italic text-sm">— Prophet Muhammad SAW (Sahih Muslim 2588)</span>
          </p>

          {/* Search bar */}
          <div className="relative w-full max-w-xl mt-8">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-full bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={22} />
          </div>
        </div>
      </section>

      {/* FILTER BAR aligned with CampaignGrid */}
<div className="w-full max-w-[90rem] mx-auto flex flex-wrap items-center gap-4 mt-12 px-6 md:px-16 lg:px-16">
  <SlidersHorizontal size={22} className="text-gray-600" />
  <Dropdown options={statusOptions} selected={filterStatus} setSelected={setFilterStatus} />
  <Dropdown options={categoryOptions} selected={filterCategory} setSelected={setFilterCategory} />
</div>


      {/* CAMPAIGNS */}
      <CampaignGrid
        filterStatus={filterStatus}
        filterCategory={filterCategory}
        searchTerm={searchTerm}
      />
    </>
  )
}
