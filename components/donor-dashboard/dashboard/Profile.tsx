import { Calendar, Edit, Wallet, Mail, User, Phone,TrendingUp, Heart, DollarSign } from "lucide-react";
import Link from "next/link";
import { calculateBadges, calculateImpactLevel } from "./ProfileBadges";
import { BaseUser } from "@/types/ngo";
import { useRouter } from "next/navigation";

interface DonorStats {
    amount: number;
}

interface Props {
    profile: BaseUser;
    stats: DonorStats[] | null;
}

export function Profile({ profile, stats }: Props) {
    const router = useRouter();
    const totalAmounts = stats 
    ? stats.reduce((sum, record) => sum + record.amount, 0) 
    : 0;
    const donationCount = stats ? stats.length : 0;

    const statsSummary = {
        totalAmounts: totalAmounts,
        donationsCount: donationCount,
    };

    const earnedBadges = calculateBadges(profile, statsSummary);
    const impactLevel = calculateImpactLevel(donationCount);
    const shortenAddress = (address: string) => {
        if (!address) return "No Wallet Connected";
        return `${address.slice(0, 12)}...${address.slice(-6)}`;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-10 shadow-sm h-full flex flex-col justify-between gap-6">
            
            {/* 1. TOP SECTION: Identity */}
        <div className="flex flex-col xl:flex-row items-center xl:items-start justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto text-center md:text-left ">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-30 h-30 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white shadow-sm">
                        <User className="w-9 h-9 text-orange-600" />
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 bg-green-500 border-4 border-white w-6 h-6 rounded-full" />
                </div>

                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                    
                    <div className="flex flex-col gap-2 text-sm text-gray-500">
                        <div className="flex flex-col md:flex-row flex-wrap justify-start gap-2">
                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {profile.email}</span>
                            {profile.phoneNum && <span className="flex items-center gap-1.5 border-gray-300 md:border-l md:pl-3"><Phone className="w-3.5 h-3.5" /> {profile.phoneNum}</span>}
                        </div>
                        
                        {/* Wallet Address */}
                        <div className="flex items-center gap-2">
                            {profile.wallet_address && (
                                <span className="text-xs text-gray-500 flex gap-1.5">
                                    <Wallet className="w-3.5 h-3.5" /> {shortenAddress(profile.wallet_address)}
                                </span>
                            )}
                        </div>

                        {/* JOIN DATE */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Calendar className="w-3.5 h-3.5" /> 
                            <span>Joined {new Date(profile.created_at).toLocaleString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            }) || "Recently"}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <Link 
                href="/donor/settings" 
                className="shrink-0 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 self-center xl:self-start"
            >
                <Edit className="w-3.5 h-3.5" /> 
                Edit Profile
            </Link>
        </div>

            {/* 2. MIDDLE SECTION: Stats */}
            <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-100 grid grid-col-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center justify-center border-r border-gray-200">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <div className="p-1 bg-green-100 rounded-full text-green-600">
                            <DollarSign className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Donated</span>
                    </div>
                    <span className="text-2xl font-extrabold text-gray-900">RM {totalAmounts.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 font-medium mt-0.5">Lifetime contribution</span>
                </div>

                <div className="flex flex-col items-center justify-center border-r border-gray-200">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <div className="p-1 bg-red-100 rounded-full text-red-500">
                             <Heart className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Campaigns</span>
                    </div>
                    <span className="text-2xl font-extrabold text-gray-900">{donationCount}</span>
                    <span className="text-[10px] text-gray-400 font-medium mt-0.5">Projects supported</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                         <div className="p-1 bg-blue-100 rounded-full text-blue-500">
                            <TrendingUp className="w-3.5 h-3.5" />
                         </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Impact Level</span>
                    </div>
                    <span className="text-2xl font-extrabold text-gray-900">{impactLevel}</span>
                    <span className="text-[10px] text-gray-400 font-medium mt-0.5">Based on activity</span>
                </div>
            </div>

            {/* 3. BOTTOM SECTION: Badges */}
            <div className="text-center">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Earned Achievements</h3>
                <div className="flex flex-wrap gap-4 justify-center">
                    {earnedBadges.length > 0 ? (
                        earnedBadges.map((badge, index) => (
                            <div 
                                key={index}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-opacity-50 ${badge.color}`}
                            >
                                <badge.icon className={`w-4 h-4 ${badge.iconColor}`} />
                                <span className="text-xs font-semibold">{badge.label}</span>
                            </div>
                        ))
                    ) : (
                        <span className="text-xs text-gray-400 italic">No badges earned yet.</span>
                    )}
                </div>
            </div>
            
        </div> 
    );
}