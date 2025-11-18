// components/register/RegisterContent.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import createClient from "@/lib/supabase/client";

// UI Imports
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Auth Components
import RoleToggle from "@/components/auth/RoleToggle";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import ErrorMessage from "@/components/auth/ErrorMessage";
import AuthLink from "@/components/auth/AuthLink";
import DonorSignupForm from "@/components/register/DonorSignupForm";
import NgoSignupForm from "@/components/register/NgoSignupForm";

export default function RegisterContent() {
  const searchParams = useSearchParams();
  
  // Initialize role based on URL
  const initialRole = searchParams.get("role") === "ngo" ? "ngo" : "donor";
  const [role, setRole] = useState<"donor" | "ngo">(initialRole);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const next = searchParams.get("next") || "/dashboard"; 
  const supabase = createClient();

  return (
    <>
      {/* Full Screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm text-white">
          <Loader2 className="h-12 w-12 animate-spin mb-4" />
          <p className="text-lg font-semibold">Creating your account...</p>
        </div>
      )}

      <Card className="w-full max-w-md p-8 min-h-[650px] flex flex-col relative bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create Account</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 flex-1">
          {error && <ErrorMessage message={error} />}

          {/* Disable interactions while loading */}
          <div className={isLoading ? "pointer-events-none opacity-50" : ""}>
            <RoleToggle role={role} setRole={setRole} />
          </div>

          {role === "donor" && (
            <>
              <GoogleLoginButton
                supabase={supabase}
                next={next}
                setError={setError}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or sign up with email
                  </span>
                </div>
              </div>
            </>
          )}

          {role === "donor" ? (
            <DonorSignupForm 
              supabase={supabase}
              setError={setError}
              setIsLoading={setIsLoading}
              isLoading={isLoading}
            />
          ) : (
            <NgoSignupForm 
              supabase={supabase} 
              setError={setError}
              setIsLoading={setIsLoading}
              isLoading={isLoading}
            />
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
            <div className={isLoading ? "pointer-events-none opacity-50" : ""}>
                <AuthLink mode="signup" currentRole={role} />
            </div>
        </CardFooter>
      </Card>
    </>
  );
}

// Export the Skeleton so the parent page can use it for Suspense
export function RegisterSkeleton() {
    return (
        <Card className="w-full max-w-md p-8 h-[650px]">
            <CardHeader><Skeleton className="h-8 w-3/4 mx-auto" /></CardHeader>
            <CardContent className="space-y-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
    )
}