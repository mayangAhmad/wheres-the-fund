import { BaseUser } from "@/types/ngo";
import { ShieldCheck, Award, Zap, Star, LucideIcon, Heart, Trophy, Gem, Crown } from "lucide-react";

// --- TYPES ---
export interface Badge {
  label: string;
  icon: LucideIcon;
  color: string;     // The background/border style
  iconColor: string; // The specific icon color
}

interface UserStats {
  totalAmounts: number;
  donationsCount: number;
}

// --- LOGIC ENGINE ---
export const calculateBadges = (profile: BaseUser, stats: UserStats): Badge[] => {
  const badges: Badge[] = [];

  // 1. Verified Badge (Has Wallet)
  if (profile.wallet_address) {
    badges.push({
      label: "Verified",
      icon: ShieldCheck,
      color: "bg-green-50 text-green-700 border-green-200",
      iconColor: "text-green-600"
    });
  }

  // 2. Club Badge (Financial Milestone)
  if (stats.totalAmounts > 1000) {
    badges.push({
      label: "1K Club",
      icon: Crown, // King/Queen status
      color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
      iconColor: "text-fuchsia-600"
    });
  } 
  else if (stats.totalAmounts > 500) {
    badges.push({
      label: "500 Club",
      icon: Gem, // Diamond hands/High value
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      iconColor: "text-indigo-600"
    });
  } 
  else if (stats.totalAmounts > 100) {
    badges.push({
      label: "Top Supporter",
      icon: Trophy,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      iconColor: "text-blue-600"
    });
  } 
  else if (stats.totalAmounts > 10) {
    badges.push({
      label: "Active Donor",
      icon: Award,
      color: "bg-cyan-50 text-cyan-700 border-cyan-200",
      iconColor: "text-cyan-600"
    });
  } 
  else if (stats.totalAmounts > 0) {
    badges.push({
      label: "First Step",
      icon: Heart,
      color: "bg-rose-50 text-rose-700 border-rose-200",
      iconColor: "text-rose-500"
    });
  }

  // 3. Frequency Badge (Consistency)
  if (stats.donationsCount >= 3) {
    badges.push({
      label: "Frequent Donor",
      icon: Zap,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      iconColor: "text-purple-600"
    });
  }

  // 4. Early Adopter (Time-based)
  const joinYear = profile.created_at ? new Date(profile.created_at).getFullYear() : 9999;
  if (joinYear < 2026) {
    badges.push({
      label: "Early Adopter",
      icon: Star,
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      iconColor: "fill-yellow-500 text-yellow-600"
    });
  }

  return badges;
};

// --- HELPER: IMPACT LEVEL ---
export const calculateImpactLevel = (campaignsCount: number) => {
    // Level 1 starts at 0. Every 2 campaigns = +1 Level.
    return Math.floor(campaignsCount / 2) + 1;
};