"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { BaseUser } from "@/types/ngo";
import { useRouter } from "next/navigation";
import createClient from "@/lib/supabase/client";

interface DangerZoneProps {
    profile: BaseUser;  
}

export default function DeleteAccount({ profile }: DangerZoneProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDeleteAccount = async () => {
    try{
      setIsDeleting(true);
      const res = await fetch("/api/delete-user", {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorMsg = await res.json();
        throw new Error(errorMsg.error || "Failed to delete account");
      }

      await supabase.auth.signOut();

      router.push("/");
    } catch (error: any) {
      alert(`Error deleting account: ${error.message}`);
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Main Card */}
      <div className="border border-red-200 rounded-xl shadow-sm overflow-hidden bg-white">

        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Delete Account</p>
            <p className="text-xs text-gray-500">Permanently remove your account and all associated data.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="whitespace-nowrap px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 hover:bg-red-50 rounded-lg transition-colors shadow-sm"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-100 rounded-full text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Account?</h2>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. All data will be lost.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 px-4 py-2 border rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount} 
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}