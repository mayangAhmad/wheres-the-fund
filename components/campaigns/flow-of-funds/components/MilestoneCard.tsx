import { motion } from 'framer-motion';
import Link from 'next/link';

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

  const findStatusConfig = () => {
    if (milestone.currentAmount >= milestone.targetAmount) {
      return {
        cardStyle: isTargeted 
          ? "border-green-500 ring-2 ring-green-100 shadow-xl bg-green-50" 
          : "border-green-200 bg-green-50/50",
        progressBarColor: "bg-green-500",
        statusBadge: <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">COMPLETED</span>,
        raisedTextColor: "text-green-700"
      };
    } else if (milestone.currentAmount > 0 && milestone.currentAmount < milestone.targetAmount) {
      return {
        cardStyle: isTargeted 
          ? "border-orange-500 ring-2 ring-orange-100 shadow-xl bg-white" 
          : "border-orange-200 bg-orange-50/50",
        progressBarColor: "bg-orange-500",
        statusBadge: <span className="text-[10px] bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-bold animate-pulse">ACTIVE</span>,
        raisedTextColor: "text-orange-500"
      };
    } else {
      return {
        cardStyle: "border-gray-100 bg-gray-50 opacity-50 grayscale",
        progressBarColor: "bg-gray-300",
        statusBadge: <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-bold">LOCKED</span>,
        raisedTextColor: "text-gray-500"
      };
    }
  };

  const { cardStyle, progressBarColor, statusBadge, raisedTextColor } = findStatusConfig();

  //COMPACT VIEW (Donor Dashboard - Default State)
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

  //FULL VIEW (Public Page OR Donor Dashboard - Clicked State) 
  return (
    <Link href={`/campaigns/${milestone.campaignId}?tab=milestone#milestone-${milestone.id}`} className="block w-full">
      <div className={`p-4 rounded-xl border transition-all duration-500 relative flex flex-col justify-center shadow-sm w-full ${cardStyle}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-gray-800 line-clamp-1">{milestone.name}</h4>
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
        <span className={raisedTextColor}>
          Raised: RM {milestone.currentAmount.toLocaleString()}
        </span>
        <span className="text-gray-400">{percentage.toFixed(0)}%</span>
      </div>

      {/* Optional: Show User Contribution footer if data exists */}
      {(milestone.userContribution || 0) > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-300 text-[10px] text-gray-500 flex justify-between">
            <span>Your contribution:</span>
            <span className="font-bold text-gray-700">RM {milestone.userContribution}</span>
        </div>
      )}
    </div>
    </Link>
    
  );
}