"use client";

import { LoaderCircle } from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/icons/GoogleIcon";

interface Props {
  supabase: SupabaseClient;
  next: string | null;
  setError: (msg: string | null) => void;
  setIsLoading: (loading: boolean) => void; // 1. Add setter
  isLoading: boolean;                       // 2. Add boolean state for UI
}

export default function GoogleLoginButton({ 
  supabase, 
  next, 
  setError, 
  setIsLoading,
  isLoading 
}: Props) {

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Ensure the URL is constructed correctly
          redirectTo: `${window.location.origin}/auth/callback${
            next ? `?next=${encodeURIComponent(next)}` : ""
          }`,
        },
      });
      if (error) throw error;
      
      // 3. SUCCESS: Do NOT set isLoading(false). 
      // Let the loader spin while the browser redirects to Google.

    } catch (err) {
      console.error(err);
      setError("Error logging in with Google. Please try again.");
      setIsLoading(false); // 4. ERROR: Only stop loading if it failed.
    } 
    // 5. REMOVED 'finally'. It would kill the loader too early on success.
  };

  return (
    <Button
      variant="outline"
      className="w-full flex justify-center items-center gap-2"
      onClick={loginWithGoogle}
      disabled={isLoading} // Use the prop here
    >
      {isLoading ? (
        <LoaderCircle className="animate-spin size-5" />
      ) : (
        <GoogleIcon />
      )}
      Continue with Google
    </Button>
  );
}