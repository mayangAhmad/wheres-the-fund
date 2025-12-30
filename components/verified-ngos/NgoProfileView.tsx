"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Globe, 
  Mail, 
  BadgeCheck, 
  Calendar, 
  Building2 
} from "lucide-react";
import CampaignCard from "../campaigns/CampaignCard";
import wsrvLoader from "@/lib/services/image-service";
// Adjust this import path if your card is in a different folder

// --- Types (Defined locally to avoid circular dependencies) ---
export interface NgoProfileData {
  ngo_id: string;
  description: string | null;
  avatar_url: string | null;
  website_url: string | null;
  ssm_number: string;
  created_at: string;
  users: {
    name: string;
    email: string;
  } | null;
}

export interface CampaignSimple {
  id: string;
  title: string;
  image_url: string | null;
  category: string;
  collected_amount: number;
  goal_amount: number;
  status: string;
  end_date: string | null;
}

interface ViewProps {
  profile: NgoProfileData;
  activeCampaigns: CampaignSimple[];
}

export default function NgoProfileView({ profile, activeCampaigns }: ViewProps) {
  const router = useRouter();

  // Safety check for array
  const campaigns = activeCampaigns || [];

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        <div className="p-2 rounded-full bg-gray-50 group-hover:bg-gray-200 transition-all group-hover:-translate-x-1">
          <ArrowLeft size={20} />
        </div>
        <span className="font-semibold text-sm">Back to List</span>
      </button>

      {/* Header Section */}
      <div className="bg-white rounded-2xl border p-8 shadow-sm mb-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-32 w-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 relative">
              {profile.avatar_url ? (
                <Image
                  loader={wsrvLoader}
                  src={profile.avatar_url}
                  alt={profile.users?.name || "NGO"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <Building2 size={40} />
                </div>
              )}
            </div>
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm z-10">
               <BadgeCheck className="text-orange-500 w-6 h-6 fill-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-blue-950 mb-2">
                  {profile.users?.name || "Verified Organization"}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    <Building2 size={14} />
                    Reg: {profile.ssm_number}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    Joined {new Date(profile.created_at).getFullYear()}
                  </span>
                </div>
              </div>
              
              {/* Contact Actions */}
              <div className="flex gap-3">
                {profile.website_url && (
                  <a 
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <Globe size={16} />
                    Website
                  </a>
                )}
                {profile.users?.email && (
                  <a 
                    href={`mailto:${profile.users.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900 transition-colors text-sm font-medium"
                  >
                    <Mail size={16} />
                    Contact
                  </a>
                )}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed text-lg">
              {profile.description || "No description provided for this organization."}
            </p>
          </div>
        </div>
      </div>

      {/* Active Campaigns Section */}
      <div className="space-y-10">
        <div>
          <h2 className="text-2xl font-bold text-blue-950 mb-6 flex items-center gap-2">
            Active Campaigns
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {campaigns.length}
            </span>
          </h2>

          {campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((camp) => {
                // Prepare data to match CampaignCard expectations
                const campaignData = {
                    ...camp,
                    ngo_name: profile.users?.name || "Verified NGO",
                    // Explicitly cast to Number to prevent data issues
                    collected_amount: Number(camp.collected_amount),
                    goal_amount: Number(camp.goal_amount),
                };

                return (
                   // 'as any' is used here because CampaignCard likely expects a full Campaign object
                   // but we are passing a "CampaignSimple" which works for the card display.
                   <CampaignCard key={camp.id} campaign={campaignData as any} />
                );
              })}
            </div>
          ) : (
            <div className="p-10 border border-dashed rounded-xl text-center bg-gray-50">
              <p className="text-gray-500">This organization has no active campaigns at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}