'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Donation } from '@/types/ngo';
import ConnectionPath from './components/ConnectionPath';
import { DonorItem } from './components/DonorItem';
import SmartContractNode from './components/SmartContractNode';
import MilestoneCard, {CircuitMilestone} from './components/MilestoneCard';

interface Props {
  campaignId: string;
}

type Coords = { [key: string]: number };

export default function CircuitBoard({ campaignId }: Props) {
  const [milestones, setMilestones] = useState<CircuitMilestone[]>([]);
  const [donors, setDonors] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDonorId, setActiveDonorId] = useState<string | null>(null);
  const activeDonor = donors.find(d => d.id === activeDonorId);

  // Refs for measuring positions-map to store unlimited of references
  const donorRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const milestoneRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  //store final calculated num of exact center point(Y-axis) of items
  const [donorCoords, setDonorCoords] = useState<Coords>({});
  const [milestoneCoords, setMilestoneCoords] = useState<Coords>({});
  const [centerY, setCenterY] = useState(0);

  // 1. DATA FETCHING
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/campaign/${campaignId}/flow`, { method: 'GET' });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        if(data.milestones) setMilestones(data.milestones);
        if(data.donors) setDonors(data.donors);
      } catch (error) {
        console.log("Circuit Board Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [campaignId]);

  //MEASURE POSITIONS BY CALCULATE EXACT CENTER POINTS
  //FIND Y-COORDINATE FOR DEAD CENTER OF BUTTON 
  const updateCoordinates = () => {
    //stop if container isnt loaded yet
    if (!containerRef.current) return;

    //measure donor
    const newDonorCoords: Coords = {};
    donorRefs.current.forEach((el, id) => {
      // Measure center of each button relative to the container
      //top edge of the button from top container + half height of button
      newDonorCoords[id] = el.offsetTop + (el.offsetHeight / 2);
    });

    //measure milestone-same logic
    const newMilestoneCoords: Coords = {};
    milestoneRefs.current.forEach((el, id) => {
      // Measure center of each card
      newMilestoneCoords[id] = el.offsetTop + (el.offsetHeight / 2);
    });

    //the circle to be in the middle
    setCenterY(containerRef.current.scrollHeight / 2);
    //save data then trigger re-render with exact line position
    setDonorCoords(newDonorCoords);
    setMilestoneCoords(newMilestoneCoords);
  };

  //run synchronously after React calculate DOM but bfr paints the pixels-to measure height/width of element to calculate line position
  useLayoutEffect(() => { 
    //ensure visual layout settled bfr measure
    const timer = setTimeout(updateCoordinates, 100); 
    //rerun if window size change
    window.addEventListener('resize', updateCoordinates);
    return () => { //cleanup if user move tab
        window.removeEventListener('resize', updateCoordinates);
        clearTimeout(timer);
    };
  }, [donors, milestones, loading]);

  const getLineColor = (milestoneId: string) => {
    const m = milestones.find(m => m.id === milestoneId);
    if (m?.status === 'approved' || m?.status === 'pending_review') return '#22c55e';
    if (m?.status === 'active') return '#f97316';
    return '#9ca3af';
  };

  if (loading) {
    return (
      <div className='w-full h-[300px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200'>
        <div className='text-gray-400 animate-pulse font-mono text-sm'>Loading Ledger...</div>
      </div>
    );
  }

  // 1. Define Width: w-52 is 208px.
  const DONOR_COL_WIDTH_CLASS = "w-52"; //for css button 
  const DONOR_COL_WIDTH_PX = 208;  //for svg line
  
  // 2. Line Start: Start 10px inside the button for a solid connection
  const LINE_START_X = DONOR_COL_WIDTH_PX - 10; 

  // 3. Curve "Elbow" Point: Where the line starts turning.
  //line shoot straight out of button for 82px, then start curving up/down toward center
  const BEZIER_X = 290; 

  return (
    <div className="w-full overflow-x-auto p-2">
      <div className="min-w-[1000px] max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
        
        {/* HEADER */}
        <div className="mb-6 flex justify-between items-end border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Live Ledger Feed</h2>
            <p className="text-xs text-gray-500 mt-1">Real-time verification of recent transactions.</p>
          </div>
          <button 
            onClick={() => setActiveDonorId(null)}
            className="text-xs font-semibold text-orange-600 hover:text-orange-800 bg-orange-50 px-3 py-1.5 rounded-full transition-colors"
          >
            Reset View
          </button>
        </div>

        {/* MAIN CONTAINER */}
        <div 
            ref={containerRef} 
            className="p-4 flex justify-between relative"
            style={{ minHeight: '350px' }} 
        >
          
          {/* 1. LEFT COLUMN: DONORS */}
          <div className={`flex flex-col gap-5 z-10 ${DONOR_COL_WIDTH_CLASS} justify-center `}>
            {donors.length === 0 ? (
              <div className='text-gray-400 text-sm italic text-center'>No donations yet.</div>
            ): (
              donors.map((d) => {
                //index for that milestone id
                const targetMilestone = milestones.find(m => m.id === d.targetMilestoneId);
                const status = targetMilestone ? targetMilestone.status : 'active';
                
                return (
                  <div 
                    key={d.id}
                    ref={(el) => { if(el) donorRefs.current.set(d.id, el); }}
                    className="w-full h-20"
                  >
                    <DonorItem 
                      donor={d} 
                      isActive={activeDonorId === d.id} 
                      status={status} 
                      onClick={setActiveDonorId} 
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* 2. CENTER: SVG CONNECTIONS */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full">
              
              {/* LEFT LINES */}
              {donors.map((d) => {
                //check of measure done
                const startY = donorCoords[d.id];
                if (!startY) return null;

                return (
                  <ConnectionPath 
                    key={d.id}
                    // LOGIC: Start at Button -> Curve at Elbow(BEZIER_x) -> End at Center (480)
                    d={`M ${LINE_START_X} ${startY} C ${BEZIER_X} ${startY}, ${BEZIER_X} ${centerY}, 480 ${centerY}`} 
                    active={activeDonorId === d.id} 
                    color={getLineColor(d.targetMilestoneId)}
                    delay={0}
                  />
                );
              })}

              {/* RIGHT LINES */}
              {milestones.map((m) => {
                 const endY = milestoneCoords[m.id];
                 if (!endY) return null;
                 
                 if (m.status === 'locked') return null;

                 return (
                   <ConnectionPath 
                     key={m.id}
                     // LOGIC: Start at Center (480) -> Curve at Right Elbow -> End at Card
                     d={`M 480 ${centerY} C 650 ${centerY}, 650 ${endY}, 750 ${endY}`} 
                     active={activeDonor?.targetMilestoneId === m.id} 
                     color={getLineColor(m.id)}
                     delay={0.6}
                   />
                 );
              })}
            </svg>
          </div>

          {/* 3. CENTER NODE */}
          <div 
            className="absolute left-0 right-0 z-10 flex justify-center pointer-events-none" 
            style={{ top: centerY - 50 }} 
          >
             <SmartContractNode isActive={!!activeDonorId} /> 
          </div>

          {/* 4. RIGHT COLUMN: MILESTONES */}
          <div className="flex flex-col gap-8 z-10 w-80 justify-center pl-8 py-4">
            {milestones.map((m) => (
              <div 
                key={m.id}
                ref={(el) => { if(el) milestoneRefs.current.set(m.id, el); }}
                className="w-full"
              >
                <MilestoneCard 
                    milestone={m} 
                    isTargeted={activeDonor?.targetMilestoneId === m.id} 
                />
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}