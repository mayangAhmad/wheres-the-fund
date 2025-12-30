'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { useDebounce } from 'use-debounce' 
import CampaignGrid from '@/components/campaigns/list-page/CampaignGrid'
import wsrvLoader from "@/lib/services/image-service";

// ----------------------------------------------------------------------
// 1. Dropdown Component
// ----------------------------------------------------------------------
interface DropdownProps {
  options: string[]
  selected: string
  setSelected: (value: string) => void
  label?: string
}

function Dropdown({ options, selected, setSelected, label }: DropdownProps) {
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
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap
          ${isOpen 
            ? 'bg-white border-orange-500 ring-2 ring-orange-100 text-orange-600' 
            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
          }`}
      >
        <span className="truncate max-w-[120px]">{selected}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          {label && <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">{label}</div>}
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => (
              <button
                key={opt}
                className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50
                  ${selected === opt ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-600'}
                `}
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
// 2. Main Page
// ----------------------------------------------------------------------
export default function CampaignPageContent() {
  const [filterStatus, setFilterStatus] = useState('All Status')
  const [filterCategory, setFilterCategory] = useState('All Campaigns') 
  const [inputText, setInputText] = useState('')
  const [debouncedSearchTerm] = useDebounce(inputText, 300)
  
  const statusOptions = ['All Status', 'Ongoing', 'Completed']
  const categoryOptions = ['All Campaigns', 'Disaster Relief', 'Education', 'Hunger', 'Medical', 'Community']

  return (
    <main className="min-h-screen bg-gray-50">
      
      {/* HERO SECTION */}
      <section className="relative h-[45vh] lg:h-[50vh] w-full flex items-center justify-center overflow-hidden">
        <Image
          loader={wsrvLoader}
          src="https://tsdtxolyogjpmbtogfmr.supabase.co/storage/v1/object/public/asset/hero-image.jpg"
          alt="Campaigns background"
          fill
          priority
          className="object-cover brightness-[0.4]"
        />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            Browse Campaigns
          </h1>
          
          {/* HADITH RESTORED HERE */}
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            “Charity does not decrease wealth.” <br />
            <span className="italic text-base opacity-90 mt-2 block">— Prophet Muhammad SAW (Sahih Muslim 2588)</span>
          </p>

          {/* Large Search Bar (Hero) */}
          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full pl-6 pr-14 py-4 rounded-full text-gray-900 placeholder:text-gray-500 bg-white/95 backdrop-blur shadow-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 text-lg transition-all"
            />
            <div className="absolute right-2 top-2 p-2 bg-orange-600 rounded-full text-white">
              <Search size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* STICKY FILTER BAR */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4"> 
            {/* Left: Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center text-gray-500 mr-2 shrink-0">
                <SlidersHorizontal size={18} />
                <span className="ml-2 text-sm font-medium text-gray-600 sm:hidden">Filters</span>
              </div>
              
              <Dropdown 
                label="Status"
                options={statusOptions} 
                selected={filterStatus} 
                setSelected={setFilterStatus} 
              />
              
              <Dropdown 
                label="Category"
                options={categoryOptions} 
                selected={filterCategory} 
                setSelected={setFilterCategory} 
              />
            </div>

            {/* Right: Active Search Text (Desktop Only) */}
            {inputText && (
              <div className="hidden md:flex items-center text-sm text-gray-500 animate-in fade-in slide-in-from-right-4">
                Results for&nbsp;<span className="font-semibold text-gray-900">"{inputText}"</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[500px]">
        <CampaignGrid
            filterStatus={filterStatus}    
            filterCategory={filterCategory}
            searchTerm={debouncedSearchTerm}       
            onReset={() => {
              setFilterStatus('All Status');
              setFilterCategory('All Campaigns');
              setInputText('');
            }}
          />
      </section>

    </main>
  )
}