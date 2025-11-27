"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, Upload, User, Building2, CreditCard, Globe, ShieldCheck 
} from "lucide-react";
import { toast } from "sonner";
import createClient from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  description: string | null;
  ssm_number: string;
  stripe_connected: boolean;
  website_url: string | null;
}

export default function SettingsClient({ initialData }: { initialData: UserData }) {
  const [formData, setFormData] = useState(initialData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData.avatar_url);
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // 1. Handle Image Selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("Image size must be less than 2MB");
      }

      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Immediate preview
    }
  };

  // 2. Handle Save
  const handleSave = async () => {
    setSaving(true);
    try {
      let finalAvatarUrl = formData.avatar_url;

      // A. Upload Image if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const filePath = `avatars/${formData.id}/profile_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("campaigns") // Or 'avatars' bucket if you created one
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("campaigns").getPublicUrl(filePath);
        finalAvatarUrl = data.publicUrl;
      }

      // B. Update Database
      // Update 'ngo_profiles'
      const { error: profileError } = await supabase
        .from("ngo_profiles")
        .update({
          avatar_url: finalAvatarUrl,
          description: formData.description,
          website_url: formData.website_url,
        })
        .eq("ngo_id", formData.id);

      if (profileError) throw profileError;

      // Update 'users' table (Name) if necessary
      if (formData.name !== initialData.name) {
        const { error: userError } = await supabase
          .from("users")
          .update({ name: formData.name })
          .eq("id", formData.id);
        if (userError) throw userError;
      }

      toast.success("Profile updated successfully!");
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT COLUMN: Profile Card */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center text-center">
          
          {/* Avatar Uploader */}
          <div className="relative group mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner bg-gray-100 relative">
              {previewUrl ? (
                <Image 
                  src={previewUrl} 
                  alt="Profile" 
                  fill 
                  className="object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User size={48} />
                </div>
              )}
            </div>
            
            {/* Hover Overlay */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
              <Upload size={24} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>

          <h2 className="font-bold text-xl text-gray-900">{formData.name}</h2>
          <p className="text-sm text-gray-500 mb-4">{formData.email}</p>

          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            formData.stripe_connected 
              ? "bg-green-100 text-green-700 border border-green-200" 
              : "bg-yellow-100 text-yellow-700 border border-yellow-200"
          }`}>
            {formData.stripe_connected ? (
              <><CreditCard size={12} className="mr-1.5" /> Payouts Active</>
            ) : (
              <><CreditCard size={12} className="mr-1.5" /> Payouts Setup Needed</>
            )}
          </div>
        </div>

        {/* Verification Status (Read Only) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-600" /> Verification
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">SSM Number</span>
              <span className="font-mono font-medium text-gray-900">{formData.ssm_number}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Account Type</span>
              <span className="font-medium text-gray-900">Verified NGO</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Edit Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Public Details</h3>
          
          <div className="space-y-5">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="name"
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Website URL */}
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="website"
                  placeholder="https://www.your-ngo.org"
                  value={formData.website_url || ""} 
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Bio / Description */}
            <div className="space-y-2">
              <Label htmlFor="bio">About Organization</Label>
              <Textarea 
                id="bio"
                placeholder="Tell donors about your mission..."
                className="min-h-[120px] resize-none"
                value={formData.description || ""} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="text-xs text-gray-500 text-right">
                {(formData.description || "").length} characters
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.refresh()} disabled={saving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
            >
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}