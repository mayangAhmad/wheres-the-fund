'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import ConnectionPath from './components/ConnectionPath';
import MilestoneCard, {CircuitMilestone} from './components/MilestoneCard';
import { User } from 'lucide-react';
import { CampaignItem, ImpactCampaign } from './components/DonorItem';

interface Props {
  donorId?: string; 
}

type Coords = { [key: string]: number };

export default function DonorImpactCircuit({ donorId }: Props) {
  const [campaigns, setCampaigns] = useState<ImpactCampaign[]>([]);
  const [milestones, setMilestones] = useState<CircuitMilestone[]>([]);
  const [loading, setLoading] = useState(true);

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
        const res = await fetch (`/api/donor/${donorId}/impact`, {method: 'GET'});
        if(!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        console.log("Data:", data);

        if(data.campaigns) setCampaigns (data.campaigns);
        if (data.milestones) setMilestones (data.milestones);
      } catch (error) {
        console.error("Impact Graph Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [donorId]);

  // Measure Logic
  const updateCoordinates = () => {
    if (!containerRef.current) return;

    const newCampCoords: Coords = {};
    campaignRefs.current.forEach((el, id) => {
      newCampCoords[id] = el.offsetTop + (el.offsetHeight / 2);
    });

    const newMileCoords: Coords = {};
    milestoneRefs.current.forEach((el, id) => {
      newMileCoords[id] = el.offsetTop + (el.offsetHeight / 2);
    });
    if (userRef.current) {
        setUserY(userRef.current.offsetTop + (userRef.current.offsetHeight / 2));
    }
    setCampaignCoords(newCampCoords);
    setMilestoneCoords(newMileCoords);
  };

  useLayoutEffect(() => {
    const timer = setTimeout(updateCoordinates, 100);
    window.addEventListener('resize', updateCoordinates);
    return () => {
        window.removeEventListener('resize', updateCoordinates);
        clearTimeout(timer);
    };
  }, [activeCampaignId]); 

  const visibleMilestones = activeCampaignId 
    ? milestones.filter((m) => m.campaignId === activeCampaignId)
    : milestones.filter((m) => m.userContribution > 0);
  
  // 1. Column Widths
  const USER_COL_WIDTH = 128; // w-32
  const CAMP_COL_WIDTH = 240; // w-60

  // 2. Gaps (Must match the margins in JSX)
  const GAP_1 = 222; // Space between User and Campaign
  const GAP_2 = 210; // Space between Campaign and Milestone

  // 3. Calculated X Positions for SVG
  const CENTER_START_X = USER_COL_WIDTH + GAP_1; // 350
  const CENTER_END_X   = CENTER_START_X + CAMP_COL_WIDTH; // 590
  const RIGHT_START_X  = CENTER_END_X + GAP_2; // 800

  // 4. Line Connection Points (Overlapping for seamless look)
  const LINE_1_START = USER_COL_WIDTH - 20; // Inside User Node
  const LINE_1_END   = CENTER_START_X + 20; // Inside Campaign Button (Left)
  
  const LINE_2_START = CENTER_END_X - 20; // Inside Campaign Button (Right)
  const LINE_2_END   = RIGHT_START_X + 20; // Inside Milestone Card

  // 5. Curve Control Points
  const CP1 = (LINE_1_START + LINE_1_END) / 2;
  const CP2 = (LINE_2_START + LINE_2_END) / 2;

  // Colors
  const COLOR_BLUE = '#3b82f6';
  const COLOR_GREEN = '#22c55e';
  const COLOR_ORANGE = '#f97316'; 

  return (
    <div className="w-full overflow-x-auto p-2">
      <div className="min-w-[1200px] max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
        
        <div className="mb-6 flex justify-between items-end border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Impact Graph</h2>
            <p className="text-xs text-gray-500 mt-1">
                {activeCampaignId 
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

        {/* CONTAINER: Removed justify-between, using explicit margins */}
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
               style={{ marginLeft: `${GAP_1}px` }}> {/* Explicit Gap */}
             {campaigns.map(camp => {
                const isActive = activeCampaignId === camp.id;
                const isDimmed = activeCampaignId !== null && !isActive;

                return (
                  <div 
                      key={camp.id} 
                      ref={el => { if(el) campaignRefs.current.set(camp.id, el); }}
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
               style={{ marginLeft: `${GAP_2}px` }}> {/* Explicit Gap */}
             {visibleMilestones.map(m => (
                <div 
                    key={m.id} 
                    ref={el => { if(el) milestoneRefs.current.set(m.id, el); }}
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
                {campaigns.map(camp => {
                    const startY = userY;
                    const endY = campaignCoords[camp.id];
                    if (!startY || !endY) return null;

                    const isActive = activeCampaignId === null || activeCampaignId === camp.id;
                    const color = isActive ? COLOR_BLUE : '#e5e7eb';

                    return (
                        <ConnectionPath 
                            key={`u-${camp.id}`}
                            // Curve from ME (right side) to CAMPAIGN (left side, tucked in)
                            d={`M ${LINE_1_START} ${startY} C ${CP1} ${startY}, ${CP1} ${endY}, ${LINE_1_END} ${endY}`}
                            active={isActive}
                            color={color}
                            delay={0}
                        />
                    );
                })}

                {/* Campaigns -> Milestones */}
                {visibleMilestones.map(m => {
                    const campaignY = campaignCoords[m.campaignId]; 
                    const milestoneY = milestoneCoords[m.id];
                    if (!campaignY || !milestoneY) return null;

                    if (m.userContribution <= 0) return null; 

                    const lineColor = m.status === 'completed' ? COLOR_GREEN : COLOR_ORANGE;

                    return (
                        <ConnectionPath 
                            key={`c-${m.id}`}
                            // Curve from CAMPAIGN (right side, tucked in) to MILESTONE (left side, tucked in)
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
      </div>
    </div>
  );
}
