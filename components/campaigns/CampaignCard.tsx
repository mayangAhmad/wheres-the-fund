'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Campaign } from '@/context/CampaignsContext'; 
import wsrvLoader from '@/lib/services/image-service';

interface CampaignCardProps {
  campaign: Campaign;
  priority?: boolean;
}

const getDaysLeft = (endDateString: string | null): string => {
    if (!endDateString) return 'No Deadline';
    const now = new Date();
    const end = new Date(endDateString);
    const diffTime = end.getTime() - now.getTime();
    
    if (diffTime <= 0) return 'Ended';

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays === 1 ? '' : 's'} left`;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, priority }) => {
    
    const collected = Number(campaign.collected_amount) || 0;
    const goal = Number(campaign.goal_amount) || 0;
    const progress = goal > 0 ? Math.min((collected / goal) * 100, 100) : 0;
    const daysLeft = getDaysLeft(campaign.end_date);

   return (
        /* 1. CHANGED: Outer div is now a Link */
        <Link
            href={`/campaigns/${campaign.id}`}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all flex flex-col h-full group overflow-hidden border border-gray-100 cursor-pointer"
        >
            
            <div className="relative w-full h-40 shrink-0 overflow-hidden">
                <Image
                    loader={wsrvLoader}
                    src={campaign.image_url || '/placeholder.jpg'}
                    alt={campaign.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105" // Added zoom effect on hover
                    priority={priority}
                    quality={75}
                    loading={priority ? 'eager' : 'lazy'} 
                />
                
                <span 
                    className={`absolute top-2 right-2 text-[12px] px-2 py-0.5 rounded-lg font-medium z-10 
                    ${campaign.status === 'Ongoing' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`
                    }
                >
                    {campaign.status}
                </span>
            </div>

            <div className="flex-1 p-4 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                    {/* Added group-hover color change for title */}
                    <h3 className="text-lg font-bold line-clamp-2 leading-tight pr-2 group-hover:text-orange-600 transition-colors">
                        {campaign.title}
                    </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-1">{campaign.ngo_name || 'Anonymous NGO'}</p>

                <div className="mt-auto pt-2">
                    <div className="flex justify-between text-xs mb-1 font-semibold text-gray-800">
                        <span>{progress.toFixed(0)}% Funded</span>
                        <span className="text-gray-500">
                            RM {collected.toLocaleString()} / RM {goal.toLocaleString()} 
                        </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    
                    <div className="flex justify-end text-xs text-gray-500 mt-2 font-medium">
                        <span className={`font-medium ${daysLeft === 'Ended' ? 'text-red-500' : 'text-gray-600'}`}>
                            {daysLeft}
                        </span>
                    </div>
                </div>

                <span
                    className="mt-4 block w-full text-center bg-orange-600 group-hover:bg-orange-700 text-white text-sm font-semibold py-2 rounded transition-all"
                >
                    Donate Now
                </span>
            </div>
        </Link>
    );
};

export default CampaignCard;