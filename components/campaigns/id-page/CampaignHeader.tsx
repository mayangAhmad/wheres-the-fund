'use client'
import { useState } from "react";
import { User, Tag, HeartHandshake } from "lucide-react";
import { AmountProgress } from "../AmountProgress";
import Image from "next/image";
import DonationModal from "../donation/DonationModal";

interface HeaderProps {
  data: {
    id:string;
    category: string;
    ngoName: string;
    createdAt: string | null;
    image: string;
    title: string;
    description: string;
    tags: string[];
    targetAmount: number;
    collectedAmount: number;
  };
}

export default function CampaignHeader({ data }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-GB")
    : "Recent";

  const percentage = Math.min(
    (data.collectedAmount / (data.targetAmount || 1)) * 100,
    100
  ).toFixed(0);

  

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-12 w-full">
      {/* Left: Image */}
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

      {/* Right: Info */}
      <div className="w-full md:w-7/12 flex flex-col justify-between">
        {/* Top Info */}
        <div>
          <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold uppercase tracking-wide mb-3">
            <span>{data.category || "General"}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User size={14} /> {data.ngoName || "NGO"}
            </span>
          </div>

          <h1
            className="mb-4 text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight"
            title={data.title}
          >
            {data.title}
          </h1>

          <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
            {data.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col gap-3 pt-3 border-t border-gray-100">
          {/* Tags */}
          {data.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1"
                >
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats & Progress */}
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
              <span className="text-lg font-bold text-orange-600">
                {percentage}%
              </span>
            </div>
            <AmountProgress
              currentAmount={data.collectedAmount}
              targetAmount={data.targetAmount}
            />
          </div>

          {/* Donate Button */}
          <button
            onClick={() => setIsModalOpen(true)} // 5. Direct Trigger
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-base py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <HeartHandshake size={18} />
            Donate Now
          </button>
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
