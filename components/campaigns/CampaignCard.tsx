import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Campaign } from '@/types/ngo';
import wsrvLoader from '@/lib/services/image-service';

// Helper to determine status strictly
const getCampaignStatus = (campaign: Campaign) => {
    const now = new Date().getTime();
    const end = new Date(campaign.end_date || '').getTime();
    
    // Campaign is inactive if past deadline OR status is not Ongoing
    const isPastDeadline = now > end;
    const isOngoing = campaign.status === 'Ongoing';
    const isActive = !isPastDeadline && isOngoing;

    if (!isActive) {
        return { label: 'Ended', isActive: false, color: 'text-red-600' };
    }
    
    // Calculate days strictly
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { label: `${diffDays} day${diffDays === 1 ? '' : 's'} left`, isActive: true, color: 'text-gray-600' };
};

const CampaignCard: React.FC<{ campaign: Campaign; priority?: boolean }> = ({ campaign, priority }) => {
    const collected = Number(campaign.collected_amount) || 0;
    const goal = Number(campaign.goal_amount) || 0;
    const progress = goal > 0 ? (collected / goal) * 100 : 0;
    
    const { label, isActive, color } = getCampaignStatus(campaign);

    const isEnded = campaign.status === 'Completed' || campaign.status === 'Closed';

    return (
        <Link
            href={`/campaigns/${campaign.id}`}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all flex flex-col h-full group overflow-hidden border border-gray-100"
        >
            {/* Image Section */}
            <div className="relative w-full h-40 shrink-0 overflow-hidden">
                <Image
                    loader={wsrvLoader}
                    src={campaign.image_url || '/placeholder.jpg'}
                    alt={campaign.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    // REMOVED grayscale, kept zoom effect for all
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={priority}
                />
                
                {/* Status Badge */}
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

                {/* Progress Section */}
                <div className="mt-auto pt-2">
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                        <span className="text-orange-600">{progress.toFixed(0)}% Funded</span>
                        <span className="text-gray-500">RM {collected.toLocaleString()} / RM {goal.toLocaleString()}</span>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                        className={`h-2 rounded-full transition-all duration-700 ease-out ${
                            isEnded ? 'bg-gray-700' : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    
                    <div className="flex justify-end text-xs mt-2 font-medium">
                        <span className={color}>{label}</span>
                    </div>
                </div>

                {/* Dynamic Button */}
                <span
                    className={`mt-4 w-full text-center text-sm font-bold py-2 rounded transition-all
                        ${isActive 
                            ? 'bg-orange-600 group-hover:bg-orange-700 text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}
                >
                    {isActive ? 'Donate Now' : 'Campaign Ended'}
                </span>
            </div>
        </Link>
    );
};

export default CampaignCard;