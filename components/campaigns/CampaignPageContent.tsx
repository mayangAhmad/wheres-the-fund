// app/campaign/page.tsx (or where your CampaignPageContent resides)

'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useDebounce } from 'use-debounce' 

// 🌟 Import the new filtering hook (Used internally to define filteredCampaigns, 
// but we only need the input values for the Grid component in this file)
import { useFilteredCampaigns } from '@/hooks/useFilteredCampaigns' 

// Import your optimized grid (Now expects filter props)
import CampaignGrid from '@/components/campaigns/CampaignGrid'

// ----------------------------------------------------------------------
// 1. Helper Function (Kept as is)
// ----------------------------------------------------------------------
const mapCategoryToSupabaseValue = (displayName: string): string => {
  switch (displayName) {
    case 'All Campaigns':
      return 'All Campaigns' 
    case 'Standard':
      return 'standard' 
    case 'Disaster-Relief':
      return 'disaster' 
    default:
      return 'All Campaigns'
  }
}

// ----------------------------------------------------------------------
// 2. Dropdown Component (Kept as is)
// ----------------------------------------------------------------------
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
        className="flex justify-between items-center bg-gray-200 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate text-sm font-medium text-gray-700">{selected}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className={`h-4 w-4 ml-2 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {/* Options */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white shadow-xl rounded-xl max-h-60 overflow-auto border border-gray-100">
          <div className="flex flex-col py-1">
            {options.map((opt) => (
              <button
                key={opt}
                className={`text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  selected === opt ? 'font-semibold text-orange-600 bg-orange-50' : 'text-gray-600'
                }`}
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

// ----------------------------------------------------------------------
// 3. Main Page Component
// ----------------------------------------------------------------------
export default function CampaignPageContent() {
  // State for user input (Display names)
  const [filterStatus, setFilterStatus] = useState('All Status')
  const [filterCategoryDisplay, setFilterCategoryDisplay] = useState('All Campaigns')
  const [inputText, setInputText] = useState('')
  
  // Debounced search term
  const [debouncedSearchTerm] = useDebounce(inputText, 300)

  // Mapped category value for the hook
  const filterCategorySupabase = useMemo(() => {
    return mapCategoryToSupabaseValue(filterCategoryDisplay)
  }, [filterCategoryDisplay])
  
  // Dropdown Options
  const statusOptions = ['All Status', 'Ongoing', 'Completed']
  const categoryOptions = ['All Campaigns', 'Standard', 'Disaster-Relief']

  // ❌ DELETED: Removed this unnecessary hook call, as the Grid handles it internally now.
  // const { filteredCampaigns, loading } = useFilteredCampaigns({ ... }); 


  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* HERO SECTION */}
      <section className="relative h-[50vh] md:h-[60vh] w-full">
        <Image
          src="/hero-image.jpg"
          alt="Campaigns background"
          fill
          priority
          className="object-cover brightness-50"
        />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-xl mb-4 tracking-tight">
            Browse Campaigns
          </h1>
          
          <p className="text-lg md:text-xl max-w-2xl opacity-90 mb-8">
            “Charity does not decrease wealth.” <br />
            <span className="italic text-sm opacity-80">— Prophet Muhammad SAW (Sahih Muslim 2588)</span>
          </p>

          {/* Search Bar */}
          <div className="relative w-full max-w-xl group">
            <input
              type="text"
              placeholder="Search by campaign title or NGO name..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full px-6 py-4 pr-14 rounded-full bg-white/95 backdrop-blur-sm text-gray-800 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-orange-500 p-2 rounded-full text-white shadow-md">
                <Search size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* FILTER BAR (Kept as is) */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-[90rem] mx-auto flex flex-wrap items-center gap-4 py-4 px-6 md:px-16 lg:px-20">
          <div className="flex items-center gap-2 mr-2 text-gray-600 font-medium">
             <SlidersHorizontal size={20} />
             <span className="hidden sm:inline">Filters:</span>
          </div>
          
          <Dropdown 
            options={statusOptions} 
            selected={filterStatus} 
            setSelected={setFilterStatus} 
          />
          
          <Dropdown 
            options={categoryOptions} 
            selected={filterCategoryDisplay} 
            setSelected={setFilterCategoryDisplay} 
          />

          {/* Helper text to show search is active */}
          {inputText && (
             <span className="ml-auto text-sm text-gray-500 hidden md:block">
                Searching for: <span className="font-semibold text-orange-600">"{inputText}"</span>
             </span>
          )}
        </div>
      </div>

      {/* CAMPAIGNS GRID */}
      <div className="max-w-[90rem] mx-auto px-6 md:px-16 lg:px-20 mt-10">
        <CampaignGrid
          filterStatus={filterStatus}          // ✅ Passing raw filter status
          filterCategory={filterCategorySupabase} // ✅ Passing mapped filter category
          searchTerm={debouncedSearchTerm}       // ✅ Passing debounced search term
          // ❌ DELETED: campaigns={filteredCampaigns}
          // ❌ DELETED: loading={loading}
        />
      </div>
    </main>
  )
}