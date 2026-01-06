// lib/services/profileService.ts
import createClient from "@/lib/supabase/client";

export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<{ url: string; error?: string }> {
  const supabase = createClient();
  
  // Create unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;
  
  try {
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        upsert: true, // Replace if exists
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    // Update donor_profiles table
    const { error: updateError } = await supabase
      .from('donor_profiles')
      .update({ profile_image_url: publicUrl })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return { url: publicUrl };
  } catch (error) {
    console.error('Profile image upload error:', error);
    return { 
      url: '', 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}