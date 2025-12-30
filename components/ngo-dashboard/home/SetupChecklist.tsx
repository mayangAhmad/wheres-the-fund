"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, CreditCard, User, Megaphone } from "lucide-react";
import { useNgoUser } from "@/context/NgoUserContext";
import { Button } from "@/components/ui/button";

interface SetupChecklistProps{
    campaignCount: number;
}

export default function SetupChecklist({campaignCount}: SetupChecklistProps) {
  const { user, isLoading } = useNgoUser();

  if (isLoading || !user) return null;

  // --- 1. CHECK STATUS (This now works because of the mapper fix) ---
  const hasProfile = !!(user.description && user.website_url);
  const hasStripe = !!user.stripe_account_id;
  const hasCampaigns = user.campaigns && user.campaigns.length > 0;

  // If everything is done, hide the widget
  if (hasProfile && hasStripe && hasCampaigns) return null;

  // --- 2. CALCULATE PERCENTAGE ---
  const totalSteps = 2;
  const completedSteps = (hasProfile ? 1 : 0) + (hasStripe ? 1 : 0);
  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 mb-8">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

<div className="relative flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">        
        {/* Header Text */}
        <div className="min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-gray-900">Get Ready 🚀</h2>
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {progress}% Done
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Complete these 2 steps to start launch a campaign.
          </p>
        </div>

        {/* THE 2 STEPS */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          
          {/* STEP 1: Profile */}
          <Link 
            href="/ngo/settings"
            className={`flex-1 flex items-center gap-3 p-3 rounded-lg border transition-all ${
              hasProfile 
                ? "bg-green-50 border-green-200" 
                : "bg-white border-orange-300 shadow-sm ring-1 ring-orange-100 hover:border-orange-500"
            }`}
          >
            {hasProfile ? <CheckCircle2 className="text-green-600" size={20} /> : <User className="text-orange-500" size={20} />}
            <div>
              <p className={`text-sm font-semibold ${hasProfile ? "text-green-800" : "text-gray-900"}`}>Complete Profile</p>
              {!hasProfile && <p className="text-xs text-orange-600">Bio & Website required</p>}
            </div>
          </Link>

          {/* Arrow */}
          <ArrowRight className="hidden md:block text-gray-300 self-center" size={16} />

          {/* STEP 2: Stripe */}
          {/* We just check the status here. The button is in the header, so we link to dashboard/header implicitly or keep it visual */}
          <div 
            className={`flex-1 flex items-center gap-3 p-3 rounded-lg border transition-all ${
              hasStripe 
                ? "bg-green-50 border-green-200" 
                : hasProfile 
                  ? "bg-white border-blue-300 shadow-sm ring-1 ring-blue-100" // Active
                  : "bg-gray-50 border-gray-100 opacity-60" // Locked
            }`}
          >
            {hasStripe ? <CheckCircle2 className="text-green-600" size={20} /> : <CreditCard className={hasProfile ? "text-blue-500" : "text-gray-400"} size={20} />}
            <div>
              <p className={`text-sm font-semibold ${hasStripe ? "text-green-800" : "text-gray-900"}`}>Connect Bank</p>
              {!hasStripe && hasProfile && <p className="text-xs text-blue-600">Use button above ↗</p>}
              {!hasStripe && !hasProfile && <p className="text-xs text-gray-400">Locked</p>}
            </div>
          </div>

          {/* Arrow */}
          <ArrowRight className="hidden md:block text-gray-300 self-center" size={16} />

          {/* STEP 3: Campaign */}
          <Link 
            href="/ngo/campaigns/create"
            className={`flex-1 flex items-center gap-3 p-3 rounded-lg border transition-all ${
              hasCampaigns 
                ? "bg-green-50 border-green-200"
                : (hasProfile && hasStripe)
                  ? "bg-white border-purple-300 shadow-sm ring-1 ring-purple-100 hover:border-purple-500"
                  : "bg-gray-50 border-gray-100 opacity-60 pointer-events-none"
            }`}
          >
            {hasCampaigns ? (
              <CheckCircle2 className="text-green-600" size={20} />
            ) : (
              <Megaphone className={(hasProfile && hasStripe) ? "text-purple-500" : "text-gray-400"} size={20} />
            )}
            <div>
              <p className={`text-sm font-semibold ${hasCampaigns ? "text-green-800" : "text-gray-900"}`}>
                Publish Campaign
              </p>
              {!hasCampaigns && (hasProfile && hasStripe) && <p className="text-xs text-purple-600">Ready to launch!</p>}
              {!hasCampaigns && (!hasProfile || !hasStripe) && <p className="text-xs text-gray-400">Locked</p>}
            </div>
          </Link>
        </div>

        {/* Action Button (Shortcuts) */}
        <div className="hidden xl:block">
          {!hasProfile ? (
             <Link href="/ngo/settings"><Button className="bg-orange-600 hover:bg-orange-700 text-white">Start Step 1</Button></Link>
          ) : !hasStripe ? (
             // No button here, relies on the header button you already have
             <Button variant="outline" disabled className="text-blue-600 border-blue-200 bg-blue-50">Step 2 Above ↗</Button>
          ) : !hasCampaigns ? (
             <Link href="/ngo/campaigns/create"><Button className="bg-purple-600 hover:bg-purple-700 text-white">Start Step 3</Button></Link>
          ) : null}
        </div>

      </div>
    </div>
  );
}