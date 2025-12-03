import { Donation } from "@/types/ngo";

// --- TYPES ---
export interface ImpactCampaign {
  id: string;
  name: string;
  totalDonated: number;
}

// --- 1. THE GENERIC UI COMPONENT (Dumb & Reusable) ---
interface BaseProps {
  title: string;
  subtitle: string;
  value: string | number;
  isActive: boolean;
  colorTheme: 'green' | 'orange' | 'blue'; // Explicit colors are safer
  onClick: () => void;
}

function BaseCircuitNode({ title, subtitle, value, isActive, colorTheme, onClick }: BaseProps) {
  
  // Color Dictionary (Easy to manage)
  const colors = {
    green: {
      border: "border-green-500 ring-green-100",
      text: "text-green-700",
      value: "text-green-600"
    },
    orange: {
      border: "border-orange-500 ring-orange-200",
      text: "text-orange-700",
      value: "text-orange-600"
    },
    blue: {
      border: "border-blue-500 ring-blue-200",
      text: "text-blue-700",
      value: "text-blue-600"
    }
  };

  const theme = colors[colorTheme];

  return (
    <button
      onClick={onClick}
      className={`w-full h-full px-4 py-2 rounded-xl border text-left transition-all duration-300 relative bg-white flex items-center justify-between shadow-sm ${
        isActive
          ? `${theme.border} ring-2 shadow-lg scale-105 z-20`
          : 'border-gray-100 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="truncate pr-2">
        <div className={`font-bold text-sm truncate ${isActive ? theme.text : 'text-gray-700'}`} title={title}>
          {title}
        </div>
        <div className="text-[10px] text-gray-400 truncate">{subtitle}</div>
      </div>
      <div className={`text-xs font-mono font-bold whitespace-nowrap ${isActive ? theme.value : 'text-gray-500'}`}>
        {value}
      </div>
    </button>
  );
}

// --- 2. THE DONOR WRAPPER (Smart) ---
interface DonorProps {
  donor: Donation;
  isActive: boolean;
  status: string;
  onClick: (id: string) => void;
}

export function DonorItem({ donor, isActive, status, onClick }: DonorProps) {
  // Logic: Decide color based on status
  const color = (status === 'approved' || status === 'completed') ? 'green' : 'orange';

  return (
    <BaseCircuitNode 
      title={donor.name}
      subtitle={donor.time}
      value={donor.amount}
      isActive={isActive}
      colorTheme={color}
      onClick={() => onClick(donor.id)}
    />
  );
}

// --- 3. THE CAMPAIGN WRAPPER (Smart) ---
interface CampaignProps {
  campaign: ImpactCampaign;
  isActive: boolean;
  onClick: (id: string) => void;
}

export function CampaignItem({ campaign, isActive, onClick }: CampaignProps) {
  return (
    <BaseCircuitNode 
      title={campaign.name}
      subtitle="Total Given"
      value={`RM ${campaign.totalDonated}`}
      isActive={isActive}
      colorTheme="blue"
      onClick={() => onClick(campaign.id)}
    />
  );
}