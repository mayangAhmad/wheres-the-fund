'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Campaign } from '@/context/CampaignsContext'; 

interface CampaignCardProps {
  campaign: Campaign;
}

// Helper function to calculate days left (copied from previous logic)
const getDaysLeft = (endDateString: string | null): string => {
    if (!endDateString) return 'No Deadline';
    const now = new Date();
    const end = new Date(endDateString);
    const diffTime = end.getTime() - now.getTime();
    
    if (diffTime <= 0) return 'Ended';

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays === 1 ? '' : 's'} left`;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
    
    const collected = Number(campaign.collected_amount) || 0;
    const goal = Number(campaign.goal_amount) || 0;
    const progress = goal > 0 ? Math.min((collected / goal) * 100, 100) : 0;
    const daysLeft = getDaysLeft(campaign.end_date);

   return (
        <div
            key={campaign.id}
            // ✅ FIX: Re-adding overflow-hidden to the main card container. 
            // This ensures the Image is clipped by the rounded-lg corners in the default state.
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all flex flex-col h-full group overflow-hidden border border-gray-100"
        >
            
            {/* 1. Image & Status Label */}
            {/* The Image is now clipped by the parent div's rounded corners */}
            <div className="relative w-full h-40 flex-shrink-0 overflow-hidden">
                <Image
                    src={campaign.image_url || '/placeholder.jpg'}
                    alt={campaign.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    priority
                />
                
                {/* Status Label - Top Right Corner */}
                <span 
                    className={`absolute top-2 right-2 text-[12px] px-2 py-0.5 rounded-[4px] font-medium z-10 
                    ${campaign.status === 'Ongoing' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`
                    }
                >
                    {campaign.status}
                </span>
            </div>

            <div className="flex-1 p-4 flex flex-col">
                {/* 2. Title & NGO */}
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold line-clamp-2 leading-tight pr-2">{campaign.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-1">{campaign.ngo_name || 'Anonymous NGO'}</p>

                {/* 3. Progress Bar */}
                <div className="mt-auto pt-2">
                    {/* Line 1 (Above Bar): % Funded (Left) | Collected/Goal (Right) */}
                    <div className="flex justify-between text-xs mb-1 font-semibold text-gray-800">
                        <span>{progress.toFixed(0)}% Funded</span>
                        <span className="text-gray-500">
                            RM {collected.toLocaleString()} / RM {goal.toLocaleString()} 
                        </span>
                    </div>
                    
                    {/* The Progress Bar itself */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    
                    {/* Line 2 (Under Bar): Days Left on the far right */}
                    <div className="flex justify-end text-xs text-gray-500 mt-2 font-medium">
                        <span className={`font-medium ${daysLeft === 'Ended' ? 'text-red-500' : 'text-gray-600'}`}>
                            {daysLeft}
                        </span>
                    </div>
                </div>

                {/* 4. Donate Button */}
                <Link
                    href={`/campaigns/${campaign.id}`}
                    className="mt-4 block w-full text-center bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold py-2 rounded transition-all"
                >
                    Donate Now
                </Link>
            </div>
        </div>
    );
};

export default CampaignCard;