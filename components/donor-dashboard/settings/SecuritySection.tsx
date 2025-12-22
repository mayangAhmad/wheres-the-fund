"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import createClient from "@/lib/supabase/client";
import { BaseUser } from "@/types/ngo";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface SecuritySectionProps {
  profile: BaseUser;
}

export default function SecuritySection({ profile }: SecuritySectionProps) {
  const supabase = createClient();
  const [isChanging, setIsChanging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdate = async () => {
    if (!currentPassword || newPassword !== confirmPassword) return;
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    });

    if (signInError) {
      alert("Incorrect current password");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) alert(error.message);
    else {
      alert("Password updated");

      await fetch ("/api/setting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profile.id,
          type: "password_change",
        }),
      });

      setIsChanging(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 px-6 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-white border border-blue-200 rounded-lg text-blue-700 shadow-sm">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900">Password & Security</h3>
           </div>
           
           {!isChanging && (
             <button 
               onClick={() => setIsChanging(true)}
               className="text-xs font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
             >
               Change Password
             </button>
           )}
        </div>

        {/* Content */}
        <div className="p-6 transition-all duration-300">
          {!isChanging ? (
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-gray-900">Password</p>
                   <p className="text-xs text-gray-500">Secure your account with a strong password.</p>
                </div>
                <div className="text-sm font-mono text-gray-400 bg-gray-50 px-3 py-1 rounded border border-gray-100">••••••••••••</div>
             </div>
          ) : (
             <div className="max-w-2xl mx-auto py-2 animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                  <h4 className="text-lg font-bold text-gray-900">Update Password</h4>
                  <p className="text-sm text-gray-500">Please enter your current password to verify your identity.</p>
                </div>

                <div className="space-y-6">
                  {/* Current Password - Full Width */}
                  <div>
                     <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Current Password</label>
                     <input 
                       type="password" 
                       value={currentPassword}
                       onChange={(e) => setCurrentPassword(e.target.value)}
                       className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all text-sm"
                     />
                  </div>

                  <div className="h-px bg-gray-100" />

                  {/* New Passwords - Side by Side on MD */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8 justify-end border-t border-gray-100 pt-6">
                  <button 
                    onClick={() => setIsChanging(false)} 
                    className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdate} 
                    disabled={isLoading || !newPassword || !currentPassword} 
                    className="px-6 py-2.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 shadow-sm"
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
             </div>
          )}
        </div>
      </div>
  );
}