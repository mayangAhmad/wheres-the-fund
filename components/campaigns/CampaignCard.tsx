import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Campaign } from '@/types/ngo';
import wsrvLoader from '@/lib/services/image-service';

// 1. Updated status logic
const getCampaignStatus = (campaign: Campaign, isFullyFunded: boolean) => {
    const now = new Date().getTime();
    const end = new Date(campaign.end_date || '').getTime();
    
    const isPastDeadline = now > end;
    // Ensure we handle different status strings from your DB (e.g., 'active' or 'Ongoing')
    const isOngoing = campaign.status?.toLowerCase() === 'ongoing' || campaign.status?.toLowerCase() === 'active';
    
    // ⭐ A campaign is ONLY active if: it's not past deadline, status is ongoing, AND it's not fully funded
    const isActive = !isPastDeadline && isOngoing && !isFullyFunded;

    if (!isActive) {
        return { 
            label: isFullyFunded ? 'Fully Funded' : 'Ended', 
            isActive: false, 
            color: 'text-red-600' 
        };
    }
    
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { label: `${diffDays} day${diffDays === 1 ? '' : 's'} left`, isActive: true, color: 'text-gray-600' };
};

const CampaignCard: React.FC<{ 
  campaign: Campaign; 
  priority?: boolean;
}> = ({ campaign, priority }) => {
    const collected = Number(campaign.collected_amount) || 0;
    const goal = Number(campaign.goal_amount) || 0;
    const progress = goal > 0 ? (collected / goal) * 100 : 0;

    // ⭐ FIX: Calculate isFullyFunded here so you don't rely on parent props
    const isFullyFunded = collected >= goal;
    
    const { label, isActive, color } = getCampaignStatus(campaign, isFullyFunded);

    // Visual check for "Completed" status from DB
    const isClosedInDB = campaign.status === 'Completed' || campaign.status === 'Closed';

    return (
        <Link
            href={`/campaigns/${campaign.id}`}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all flex flex-col h-full group overflow-hidden border border-gray-100"
        >
            <div className="relative w-full h-40 shrink-0 overflow-hidden">
                <Image
                    loader={wsrvLoader}
                    src={campaign.image_url || '/placeholder.jpg'}
                    alt={campaign.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={priority}
                />
                
                {/* ⭐ This badge will now correctly switch to CLOSED when progress >= 100% */}
                <span className={`absolute top-2 right-2 text-[10px] px-2 py-1 rounded font-bold z-10 
                    ${isActive ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                    {isActive ? 'ACTIVE' : 'CLOSED'}
                </span>
            </div>

            <div className="flex-1 p-4 flex flex-col">
                <h3 className="text-lg font-bold line-clamp-2 leading-tight mb-1 text-gray-900 group-hover:text-orange-600 transition-colors">
                    {campaign.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-1">{campaign.ngo_name || 'Anonymous NGO'}</p>

                <div className="mt-auto pt-2">
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                        <span className="text-orange-600">{progress.toFixed(0)}% Funded</span>
                        <span className="text-gray-500">RM {collected.toLocaleString()} / RM {goal.toLocaleString()}</span>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-2 rounded-full transition-all duration-700 ease-out ${
                                !isActive ? 'bg-gray-400' : 'bg-orange-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    
                    <div className="flex justify-end text-xs mt-2 font-medium">
                        {/* ⭐ This will now show "Fully Funded" instead of days left */}
                        <span className={color}>{label}</span>
                    </div>
                </div>

                {/* ⭐ Button correctly greys out and changes text */}
                <span
                    className={`mt-4 w-full text-center text-sm font-bold py-2 rounded transition-all
                        ${isActive 
                            ? 'bg-orange-600 group-hover:bg-orange-700 text-white' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isActive ? 'Donate Now' : isFullyFunded ? 'Goal Reached' : 'Campaign Ended'}
                </span>
            </div>
        </Link>
    );
};

export default CampaignCard;