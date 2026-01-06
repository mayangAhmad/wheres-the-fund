"use client";

import { useState } from "react";
import { User, Edit2, Upload } from "lucide-react";
import Image from "next/image";
import createClient from "@/lib/supabase/client";
import { BaseUser } from "@/types/ngo";
import { useRouter } from "next/navigation";
import { uploadProfileImage } from "@/lib/services/profileService";

interface ProfileSectionProps {
    profile: BaseUser;
    profileImageUrl?: string | null; // ⭐ Pass this separately
}

export default function ProfileSection({ profile, profileImageUrl }: ProfileSectionProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [name, setName] = useState(profile.name || "");
  const [phone, setPhone] = useState(profile.phoneNum || "");
  const [profileImage, setProfileImage] = useState(profileImageUrl || null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    
    try {
      const { url, error } = await uploadProfileImage(profile.id, file);
      
      if (error) {
        alert(`Upload failed: ${error}`);
      } else {
        setProfileImage(url);
        
        // Send notification
        await fetch("/api/setting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: profile.id,
            type: "profile_picture_update",
          }),
        });
        
        router.refresh();
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from("users")
      .update({ name })
      .eq("id", profile.id);

    if (error) {
      alert("Error updating profile");
    } else {
      await fetch("/api/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      <div className="bg-gray-50 border-b border-gray-200 p-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border border-orange-100 rounded-lg text-orange-600 shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-gray-900 text-sm md:text-base">Personal Details</h3>
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
      <div className="p-4 md:p-6">
        {/* Profile Picture Section - Always Visible */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <label className="block text-xs font-bold uppercase text-gray-400 mb-3">Profile Picture</label>
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
              {profileImage ? (
                <Image 
                  src={profileImage} 
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <User size={32} className="text-gray-400" />
              )}
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex-1">
              <input
                type="file"
                id="profile-image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploadingImage}
              />
              <label
                htmlFor="profile-image-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                  isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-4 h-4" />
                {isUploadingImage ? "Uploading..." : "Upload Photo"}
              </label>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>
        </div>

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

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
               <button 
                 onClick={() => setIsEditing(false)} 
                 className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSave} 
                 disabled={isLoading} 
                 className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex justify-center"
               >
                 {isLoading ? "Saving..." : "Save Changes"}
               </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">Display Name</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
            </div>
            
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">Email Address</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{profile.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}