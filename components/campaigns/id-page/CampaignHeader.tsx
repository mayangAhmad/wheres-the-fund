// components/campaigns/id-page/CampaignHeader.tsx
'use client'
import { useState } from "react";
import { User, Tag, HeartHandshake, Lock } from "lucide-react";
import { AmountProgress } from "../AmountProgress";
import Image from "next/image";
import DonationModal from "@/components/donation/DonationModal";

interface HeaderProps {
  data: {
    id: string;
    category: string;
    ngoName: string;
    createdAt: string | null;
    image: string;
    title: string;
    description: string;
    tags: string[];
    targetAmount: number;
    collectedAmount: number;
    status: string | null;
    isFullyFunded: boolean; // ⭐ ONLY ADD THIS LINE
  };
}

export default function CampaignHeader({ data }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ⭐ UPDATED: Check both conditions
  const isFinished = data.status === 'Completed' || data.status === 'Closed' || data.isFullyFunded;

  const percentage = Math.min(
    (data.collectedAmount / (data.targetAmount || 1)) * 100,
    100
  ).toFixed(0);

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-12 w-full">
      <div className="w-full md:w-5/12 h-[250px] md:h-[40vh] shrink-0">
        <div className="relative w-full h-full overflow-hidden rounded-md shadow-lg group">
          <Image
            src={data.image || "/placeholder.jpg"}
            alt={data.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
        </div>
      </div>

      <div className="w-full md:w-7/12 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold uppercase tracking-wide mb-3">
            <span>{data.category || "General"}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User size={14} /> {data.ngoName || "NGO"}
            </span>
          </div>

          <h1 className="mb-4 text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight">
            {data.title}
          </h1>

          <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
            {data.description}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 pt-3 border-t border-gray-100">
          <div>
            <div className="flex justify-between items-end mb-1">
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-bold text-gray-900 leading-none">
                  RM {data.collectedAmount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  / {data.targetAmount.toLocaleString()}
                </p>
              </div>
              <span className={`text-lg font-bold ${isFinished ? 'text-gray-500' : 'text-orange-600'}`}>
                {percentage}%
              </span>
            </div>
            <AmountProgress
              currentAmount={data.collectedAmount}
              targetAmount={data.targetAmount}
              status={data.status} 
            />
          </div>

          <button
            onClick={() => !isFinished && setIsModalOpen(true)}
            disabled={isFinished}
            className={`w-full font-bold text-base py-3 rounded-md transition-all flex items-center justify-center gap-2 
              ${isFinished 
                ? "bg-gray-200 text-gray-500 shadow-none" 
                : "bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
              }`}
          >
            {isFinished ? (
              <>
                <Lock size={18} />
                Campaign Ended
              </>
            ) : (
              <>
                <HeartHandshake size={18} />
                Donate Now
              </>
            )}
          </button>
          
          {isFinished && (
            <p className="text-center text-xs text-gray-400 font-medium italic">
              This campaign is no longer accepting donations.
            </p>
          )}
        </div>
      </div>

      <DonationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        campaignId={data.id}
      />
    </div>
  );
}