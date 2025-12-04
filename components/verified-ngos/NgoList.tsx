'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, ChevronDown, BadgeCheck, Building2, Globe, ArrowRight } from 'lucide-react'
import { useDebounce } from 'use-debounce' 
import { NgoProfileWithUser } from '@/app/(public)/ngos/page'

// ----------------------------------------------------------------------
// 1. Reusable Dropdown Component (From your example)
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
// 2. Main NGO List Component
// ----------------------------------------------------------------------
interface NgoListProps {
  initialNgos: NgoProfileWithUser[];
}

export default function NgoList({ initialNgos }: NgoListProps) {
  const router = useRouter();
  
  // State
  const [filterSort, setFilterSort] = useState('Newest Added')
  const [inputText, setInputText] = useState('')
  const [debouncedSearchTerm] = useDebounce(inputText, 300)

  // Options
  const sortOptions = ['Newest Added', 'Name (A-Z)', 'Name (Z-A)']

  // Filtering & Sorting Logic
  const filteredNgos = initialNgos
    .filter((ngo) => {
      const name = ngo.users?.name?.toLowerCase() || "";
      const description = ngo.description?.toLowerCase() || "";
      const query = debouncedSearchTerm.toLowerCase();
      return name.includes(query) || description.includes(query);
    })
    .sort((a, b) => {
      if (filterSort === 'Name (A-Z)') {
        return (a.users?.name || "").localeCompare(b.users?.name || "");
      }
      if (filterSort === 'Name (Z-A)') {
        return (b.users?.name || "").localeCompare(a.users?.name || "");
      }
      // Default: Newest Added (assuming standard UUID or created_at if available, otherwise generic sort)
      return 0; 
    });

  const handleCardClick = (ngoId: string) => {
    router.push(`/ngos/${ngoId}`);
  };

  const handleWebsiteClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      
      {/* HERO SECTION */}
      <section className="relative h-[45vh] lg:h-[50vh] w-full flex items-center justify-center overflow-hidden">
        {/* You can replace this with a specific NGO background image */}
        <Image
          src="/hero-image.jpg" 
          alt="NGOs background"
          fill
          priority
          className="object-cover brightness-[0.4]"
        />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            Verified NGOs
          </h1>
          
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            “The best of people are those that bring most benefit to the rest of mankind.” <br />
            <span className="italic text-base opacity-90 mt-2 block">— Prophet Muhammad SAW (Daraqutni)</span>
          </p>

          {/* Large Search Bar (Hero) */}
          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search by name or description..."
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
                <span className="ml-2 text-sm font-medium text-gray-600 sm:hidden">Sort By</span>
              </div>
              
              <Dropdown 
                label="Sort Order"
                options={sortOptions} 
                selected={filterSort} 
                setSelected={setFilterSort} 
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

      {/* CONTENT AREA (GRID) */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNgos.map((ngo) => (
            <div
              key={ngo.ngo_id}
              onClick={() => handleCardClick(ngo.ngo_id)}
              className="group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer h-full"
            >
              {/* Header / Banner area */}
              <div className="h-24 bg-linear-to-r from-blue-900 to-blue-800 relative">
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs text-white font-medium">
                  <BadgeCheck className="w-3 h-3 text-orange-400" />
                  <span>Verified</span>
                </div>
              </div>

              <div className="p-6 pt-0 flex-1 flex flex-col">
                {/* Avatar */}
                <div className="-mt-12 mb-4">
                  <div className="relative h-24 w-24 rounded-full border-4 border-white bg-gray-50 overflow-hidden shadow-sm">
                    {ngo.avatar_url ? (
                      <Image
                        src={ngo.avatar_url}
                        alt={ngo.users?.name || "NGO"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <Building2 className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                    {ngo.users?.name || "Unnamed NGO"}
                  </h3>

                  <p className="text-xs text-gray-500 mb-4 font-mono flex items-center gap-1">
                     SSM: {ngo.ssm_number}
                  </p>

                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                    {ngo.description || "No description provided for this organization."}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                  {ngo.website_url ? (
                    <button
                      onClick={(e) => handleWebsiteClick(e, ngo.website_url!)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors z-10 font-medium"
                      title="Visit Website"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="hidden sm:inline">Website</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <span className="flex items-center gap-1 text-sm font-semibold text-orange-600 group-hover:translate-x-1 transition-transform">
                    View Profile <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredNgos.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-75">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                 <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No NGOs found</h3>
              <p className="text-gray-500 mt-2">
                We couldn't find any organizations matching "{inputText}"
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}