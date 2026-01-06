"use client";

import { LoaderCircle } from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/icons/GoogleIcon";

interface Props {
  supabase: SupabaseClient;
  next: string | null;
  setError: (msg: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
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
      const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
      if (next) {
        callbackUrl.searchParams.set('next', next);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });
      
      if (error) throw error;

    } catch (err) {
      console.error("Google login error:", err);
      setError("Error logging in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex justify-center items-center gap-2"
      onClick={loginWithGoogle}
      disabled={isLoading}
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