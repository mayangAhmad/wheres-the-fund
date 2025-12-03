'use client';

import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import ConnectionPath from './components/ConnectionPath';
import MilestoneCard, { CircuitMilestone } from './components/MilestoneCard';
import { User, AlertCircle } from 'lucide-react';
import { CampaignItem, ImpactCampaign } from './components/DonorItem';

interface Props {
  donorId?: string; 
}

type Coords = Record<string, number>;

// Layout Constants
const LAYOUT = {
  USER_COL_WIDTH: 128,      // w-32
  CAMP_COL_WIDTH: 240,      // w-60
  GAP_1: 180,               // Space between User and Campaign
  GAP_2: 180,               // Space between Campaign and Milestone
  LINE_OFFSET: 20,          // Overlap for seamless look
  FETCH_TIMEOUT_MS: 10000,  // 10 second timeout
} as const;

const SVG_COLORS = {
  BLUE: '#3b82f6',
  GREEN: '#22c55e',
  ORANGE: '#f97316',
  GRAY: '#e5e7eb',
} as const;

export default function DonorImpactCircuit({ donorId }: Props) {
  const [campaigns, setCampaigns] = useState<ImpactCampaign[]>([]);
  const [milestones, setMilestones] = useState<CircuitMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  // Refs & Coords
  const campaignRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const milestoneRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const userRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [campaignCoords, setCampaignCoords] = useState<Coords>({});
  const [milestoneCoords, setMilestoneCoords] = useState<Coords>({});
  const [userY, setUserY] = useState(0);

  useEffect(() => {
    if (!donorId) return;

    const fetchData = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), LAYOUT.FETCH_TIMEOUT_MS);

        const res = await fetch(`/api/donor/${donorId}/impact`, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(
            res.status === 404 
              ? "Donor impact data not found"
              : res.status === 500
              ? "Server error while fetching impact data"
              : `Failed to fetch impact data (${res.status})`
          );
        }

        const data = await res.json();
        
        if (!data || typeof data !== 'object') {
          throw new Error("Invalid response format from server");
        }

        if (data.campaigns) setCampaigns(data.campaigns);
        if (data.milestones) setMilestones(data.milestones);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Impact Graph Error:", err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [donorId]);

  // Measure Logic
  const updateCoordinates = useCallback(() => {
    if (!containerRef.current) return;

    const newCampCoords: Coords = {};
    campaignRefs.current.forEach((el, id) => {
      newCampCoords[id] = el.offsetTop + el.offsetHeight / 2;
    });

    const newMileCoords: Coords = {};
    milestoneRefs.current.forEach((el, id) => {
      newMileCoords[id] = el.offsetTop + el.offsetHeight / 2;
    });

    if (userRef.current) {
      setUserY(userRef.current.offsetTop + userRef.current.offsetHeight / 2);
    }

    setCampaignCoords(newCampCoords);
    setMilestoneCoords(newMileCoords);
  }, []);

  useLayoutEffect(() => {
    const timer = setTimeout(updateCoordinates, 100);
    const handleResize = () => updateCoordinates();
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [activeCampaignId, updateCoordinates]); 

  const visibleMilestones = activeCampaignId 
    ? milestones.filter((m) => m.campaignId === activeCampaignId)
    : milestones.filter((m) => m.userContribution > 0);
  
  // Calculated X Positions for SVG
  const CENTER_START_X = LAYOUT.USER_COL_WIDTH + LAYOUT.GAP_1;
  const CENTER_END_X = CENTER_START_X + LAYOUT.CAMP_COL_WIDTH;
  const RIGHT_START_X = CENTER_END_X + LAYOUT.GAP_2;

  // Line Connection Points (Overlapping for seamless look)
  const LINE_1_START = LAYOUT.USER_COL_WIDTH - LAYOUT.LINE_OFFSET;
  const LINE_1_END = CENTER_START_X + LAYOUT.LINE_OFFSET;
  
  const LINE_2_START = CENTER_END_X - LAYOUT.LINE_OFFSET;
  const LINE_2_END = RIGHT_START_X + LAYOUT.LINE_OFFSET;

  // Curve Control Points
  const CP1 = (LINE_1_START + LINE_1_END) / 2;
  const CP2 = (LINE_2_START + LINE_2_END) / 2; 

  return (
    <div className="w-full overflow-x-auto p-2">
      <div className="min-w-[1100px] max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
        
        <div className="mb-6 flex justify-between items-end border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Impact Graph</h2>
            <p className="text-xs text-gray-500 mt-1">
              {loading 
                ? "Loading your impact data..."
                : activeCampaignId 
                ? "Viewing full campaign traceability details." 
                : "Visualizing your direct impact on milestones."}
            </p>
          </div>

          <button 
            onClick={() => setActiveCampaignId(null)} 
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              activeCampaignId === null 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
            }`}
            disabled={activeCampaignId === null}
          >
            Clear Selection
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Failed to load impact data</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Loading your impact visualization...</p>
            </div>
          </div>
        )}

        {/* Main Circuit - Only show when not loading and no errors */}
        {!loading && !error && (
          <div ref={containerRef} className="flex relative" style={{ minHeight: '400px' }}>
            
            {/* COL 1: USER NODE */}
            <div className="w-32 flex flex-col justify-center items-center z-20 shrink-0">
              <div 
                ref={userRef}
                className="w-24 h-24 rounded-full bg-blue-600 border-4 border-blue-100 shadow-xl flex flex-col items-center justify-center text-white z-20"
              >
                <User size={32} />
                <span className="text-xs font-bold mt-1">ME</span>
              </div>
            </div>

            {/* COL 2: CAMPAIGNS */}
            <div className="w-60 flex flex-col gap-4 justify-center py-10 z-20 shrink-0" 
                 style={{ marginLeft: `${LAYOUT.GAP_1}px` }}>
              {campaigns.map((camp) => {
                const isActive = activeCampaignId === camp.id;
                const isDimmed = activeCampaignId !== null && !isActive;

                return (
                  <div 
                    key={camp.id} 
                    ref={(el) => { if (el) campaignRefs.current.set(camp.id, el); }}
                    className={`
                      w-full h-20 transition-all duration-500 ease-in-out
                      ${isDimmed ? 'opacity-30 scale-95 grayscale' : 'opacity-100 scale-100'}
                    `}
                  >
                    <CampaignItem 
                      campaign={camp}
                      isActive={isActive} 
                      onClick={setActiveCampaignId} 
                    />
                  </div>
                );
              })}
            </div>

            {/* COL 3: MILESTONES */}
            <div className="w-80 flex flex-col gap-6 justify-center py-10 z-20 shrink-0" 
                 style={{ marginLeft: `${LAYOUT.GAP_2}px` }}>
              {visibleMilestones.map((m) => (
                <div 
                  key={m.id} 
                  ref={(el) => { if (el) milestoneRefs.current.set(m.id, el); }}
                  className="w-full"
                >
                  <MilestoneCard 
                    milestone={m} 
                    isTargeted={m.userContribution > 0} 
                    isCompact={activeCampaignId === null} 
                  />
                </div>
              ))}
              {visibleMilestones.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-xl p-10">
                  Select a campaign to view impact.
                </div>
              )}
            </div>

            {/* SVG LAYER */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <svg className="w-full h-full">
                {/* User -> Campaigns */}
                {campaigns.map((camp) => {
                  const startY = userY;
                  const endY = campaignCoords[camp.id];
                  if (!startY || !endY) return null;

                  const isActive = activeCampaignId === null || activeCampaignId === camp.id;
                  const color = isActive ? SVG_COLORS.BLUE : SVG_COLORS.GRAY;

                  return (
                    <ConnectionPath 
                      key={`u-${camp.id}`}
                      d={`M ${LINE_1_START} ${startY} C ${CP1} ${startY}, ${CP1} ${endY}, ${LINE_1_END} ${endY}`}
                      active={isActive}
                      color={color}
                      delay={0}
                    />
                  );
                })}

                {/* Campaigns -> Milestones */}
                {visibleMilestones.map((m) => {
                  const campaignY = campaignCoords[m.campaignId]; 
                  const milestoneY = milestoneCoords[m.id];
                  if (!campaignY || !milestoneY) return null;
                  if (m.userContribution <= 0) return null; 

                  const lineColor = m.status === 'completed' ? SVG_COLORS.GREEN : SVG_COLORS.ORANGE;

                  return (
                    <ConnectionPath 
                      key={`c-${m.id}`}
                      d={`M ${LINE_2_START} ${campaignY} C ${CP2} ${campaignY}, ${CP2} ${milestoneY}, ${LINE_2_END} ${milestoneY}`}
                      active={true}
                      color={lineColor}
                      delay={0.4}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
