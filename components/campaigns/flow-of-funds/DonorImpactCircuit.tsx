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
  USER_COL_WIDTH: 190,      // w-32
  CAMP_COL_WIDTH: 250,      // w-60
  GAP_1: 180,               // Space between User and Campaign
  LINE_OFFSET: 80,          // Overlap for seamless look
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

    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/donor/${donorId}/impact`, {
          method: 'GET'
        });

        if (!res.ok) {
          throw new Error("Failed to fetch impact data.");
        }

        const data = await res.json();
        
        if (isMounted) {
          if (data.campaigns) setCampaigns(data.campaigns);
          if (data.milestones) setMilestones(data.milestones);
          setError(null);
        }

      } catch (err: any) {
        if (!isMounted) return;
        console.error("Impact Graph Error:", err);
        setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
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
    
    window.addEventListener('resize', updateCoordinates);
    
    return () => {
      window.removeEventListener('resize', updateCoordinates);
      clearTimeout(timer);
    };
  }, [activeCampaignId, campaigns, milestones, loading]); 

  const visibleMilestones = activeCampaignId 
    ? milestones.filter((m) => m.campaignId === activeCampaignId)
    : milestones.filter((m) => m.userContribution > 0);
  
  // Calculated X Positions for SVG
  const CENTER_START_X = LAYOUT.USER_COL_WIDTH + LAYOUT.GAP_1;
  const CENTER_END_X = CENTER_START_X + LAYOUT.CAMP_COL_WIDTH;
  const RIGHT_START_X = CENTER_END_X + LAYOUT.GAP_1;

  // Line Connection Points (Overlapping for seamless look)
  const LINE_1_START = LAYOUT.USER_COL_WIDTH - LAYOUT.LINE_OFFSET;
  const LINE_1_END = CENTER_START_X + LAYOUT.LINE_OFFSET;
  
  const LINE_2_START = CENTER_END_X - LAYOUT.LINE_OFFSET;
  const LINE_2_END = RIGHT_START_X + LAYOUT.LINE_OFFSET;

  // Curve Control Points
  const CP1 = (LINE_1_START + LINE_1_END) / 2;
  const CP2 = (LINE_2_START + LINE_2_END) / 2; 

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[1200px] max-w-7xl mx-auto bg-white rounded-2xl border border-gray-200 z-0 relative isolate">
        
        <div className="p-6 flex justify-between items-end border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Impact Graph</h2>
            <p className="text-xs text-gray-500 mt-1">
              This is a visualization of how your donations have contributed to various campaigns and their milestones.
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

        {(loading || error) ? (
          <div className={`flex flex-col items-center justify-center text-center ${loading ? "h-96" : "p-8 bg-red-50 border border-red-200 rounded-xl"}`}>
            {loading ? (
              <>
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
                <p className="text-sm text-gray-600">Loading your impact visualization...</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-sm font-semibold text-red-800">Failed to load data</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </>
            )}
          </div>
        ) : (
          <div 
            ref={containerRef} 
            className="flex relative items-center justify-center p-10" 
            style={{ minHeight: '400px' }}>
            
            {/* COL 1: USER NODE */}
            <div className="w-32 flex flex-col justify-center items-center z-10">
              <div 
                ref={userRef}
                className="w-24 h-24 rounded-full bg-blue-600 border-4 border-blue-100 shadow-xl flex flex-col items-center justify-center text-white z-10"
              >
                <User size={32} />
                <span className="text-xs font-bold mt-1">YOU</span>
              </div>
            </div>

            {/* COL 2: CAMPAIGNS */}
            <div className="w-70 flex flex-col gap-4 justify-center py-10 z-10" 
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
                      ${isDimmed ? 'opacity-40 scale-95 grayscale' : 'opacity-100 scale-100'}`}>

                    <CampaignItem 
                      campaign={camp}
                      isActive={isActive} 
                      onClick={setActiveCampaignId} />
                  </div>
                );
              })}
            </div>

            {/* COL 3: MILESTONES */}
            <div className="w-80 flex flex-col gap-6 justify-center z-10" style={{ marginLeft: `${LAYOUT.GAP_1}px` }}>

              {visibleMilestones.length > 0 && visibleMilestones.map((m) => (
                <div 
                  key={m.id} 
                  ref={(el) => { if (el) milestoneRefs.current.set(m.id, el); }}
                  className="w-full">
                  <MilestoneCard 
                    milestone={m} 
                    isTargeted={m.userContribution > 0} 
                    isCompact={activeCampaignId === null} />
                </div>
              ))} 
            </div>

            {/* SVG LAYER */}
            <div className="absolute inset-0 pointer-events-none">
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
