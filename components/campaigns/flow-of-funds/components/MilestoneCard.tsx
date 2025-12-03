import { motion } from 'framer-motion';

// --- TYPES ---
export interface CircuitMilestone {
  id: string;
  campaignId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  status: string; 
  userContribution: number;
}


interface Props {
  milestone: CircuitMilestone;
  isTargeted: boolean;
  // Optional: Only needed for Donor Dashboard logic
  isCompact?: boolean; 
}

export default function MilestoneCard({ milestone, isTargeted, isCompact = false }: Props) {
  const percentage = Math.min((milestone.currentAmount / milestone.targetAmount) * 100, 100);

  // --- STYLE LOGIC ---
  let cardStyle = "border-gray-200 bg-white opacity-90";
  let progressBarColor = "bg-gray-300";
  let statusBadge = null;

  if (milestone.status === 'completed' || milestone.status === 'approved' || milestone.status === 'pending_review') {
    cardStyle = isTargeted 
      ? "border-green-500 ring-2 ring-green-100 shadow-xl bg-green-50" 
      : "border-green-200 bg-green-50/50";
    progressBarColor = "bg-green-500";
    
    const badgeText = milestone.status === 'pending_review' ? "PENDING REVIEW" : "COMPLETED";
    statusBadge = <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">{badgeText}</span>;
  } 
  else if (milestone.status === 'active') {
    cardStyle = isTargeted 
      ? "border-orange-500 ring-2 ring-orange-100 shadow-xl bg-white" 
      : "border-orange-200 bg-white";
    progressBarColor = "bg-orange-500";
    statusBadge = <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold animate-pulse">ACTIVE</span>;
  } 
  else if (milestone.status === 'locked') {
    cardStyle = "border-gray-100 bg-gray-50 opacity-50 grayscale";
    statusBadge = <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-bold">LOCKED</span>;
  }

  // --- SCENARIO 1: COMPACT VIEW (Donor Dashboard - Default State) ---
  if (isCompact) {
    return (
      <div className={`p-4 rounded-lg border transition-all duration-500 relative flex flex-col justify-center shadow-sm w-full ${cardStyle}`}>
        <div className="flex justify-between items-center mb-1">
           <h4 className="font-bold text-gray-800 text-xs truncate w-3/4" title={milestone.name}>{milestone.name}</h4>
           {statusBadge}
        </div>
        <div className="flex items-center gap-2 mt-1">
           <span className="text-[10px] text-gray-500 uppercase font-bold">You gave:</span>
           <span className="text-sm font-bold text-gray-900 font-mono">
             RM {(milestone.userContribution || 0).toLocaleString()}
           </span>
        </div>
      </div>
    );
  }

  // --- SCENARIO 2: FULL VIEW (Public Page OR Donor Dashboard - Clicked State) ---
  return (
    <div className={`p-5 rounded-xl border transition-all duration-500 relative flex flex-col justify-center shadow-sm w-full ${cardStyle}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-800">{milestone.name}</h4>
          <p className="text-xs text-gray-500 mt-1">
            Target: <span className="font-mono">RM {milestone.targetAmount.toLocaleString()}</span>
          </p>
        </div>
        {statusBadge}
      </div>
      
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100 mb-2">
        <motion.div 
          className={`h-full ${progressBarColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, delay: 0.2 }}
        />
      </div>

      <div className="flex justify-between text-xs font-mono font-medium">
        <span className={milestone.status === 'active' ? 'text-orange-600' : 'text-gray-500'}>
          Raised: RM {milestone.currentAmount.toLocaleString()}
        </span>
        <span className="text-gray-400">{percentage.toFixed(0)}%</span>
      </div>

      {/* Optional: Show User Contribution footer if data exists */}
      {(milestone.userContribution || 0) > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500 flex justify-between">
            <span>Your contribution:</span>
            <span className="font-bold text-gray-700">RM {milestone.userContribution}</span>
        </div>
      )}
    </div>
  );
}