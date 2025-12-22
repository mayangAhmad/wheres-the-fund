"use client";

import { useState } from "react";
import { User, Edit2 } from "lucide-react";
import createClient from "@/lib/supabase/client";
import { BaseUser } from "@/types/ngo";
import { useRouter } from "next/navigation";

interface ProfileSectionProps {
    profile: BaseUser;  
}
export default function ProfileSection({ profile }: ProfileSectionProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState(profile.name || "");
  const [phone, setPhone] = useState(profile.phoneNum || "");

  const handleSave = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from("users")
      .update({ name })
      .eq("id", profile.id);

    if (error) {
      alert("Error updating profile");
    } else {
      await fetch ("/api/setting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profile.id,
          type: "profile_update",
        }),
      });
      setIsEditing(false);
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border border-orange-100 rounded-lg text-orange-600 shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-gray-900">Personal Details</h3>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-xs font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 shadow-sm flex items-center gap-2"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {isEditing ? (
          <div className="animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all text-sm font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  disabled
                  className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed text-sm font-medium"
                />
              </div>
            </div>

            {/* ✅ UPDATED: Buttons moved here to match Password section */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
               <button 
                 onClick={() => setIsEditing(false)} 
                 className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSave} 
                 disabled={isLoading} 
                 className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
               >
                 {isLoading ? "Saving..." : "Save Changes"}
               </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">Display Name</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
            </div>
            
            <div>
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">Email Address</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{profile.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}