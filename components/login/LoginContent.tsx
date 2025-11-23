//components/login/LoginContent.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import createClient from "@/lib/supabase/client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import RoleToggle from "@/components/auth/RoleToggle";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import ErrorMessage from "@/components/auth/ErrorMessage";
import AuthLink from "@/components/auth/AuthLink";
import DonorLoginForm from "@/components/login/DonorLoginForm";
import NgoLoginForm from "@/components/login/NgoLoginForm";

export default function LoginContent() {
  const searchParams = useSearchParams();

  // Initialize role from URL
  const initialRole = searchParams.get("role") === "ngo" ? "ngo" : "donor";
  
  const [role, setRole] = useState<"donor" | "ngo">(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 1. Central Loading State
  
  const next = searchParams.get("next") || (initialRole === "ngo" ? "/ngo/dashboard" : "/donor/dashboard");
  const supabase = createClient();

  return (
    <>
      {/* 2. Full Screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm text-white">
          <Loader2 className="h-12 w-12 animate-spin mb-4" />
          <p className="text-lg font-semibold">Logging you in...</p>
        </div>
      )}

      <Card className="w-full max-w-md p-8 min-h-[550px] flex flex-col relative bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Welcome Back!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 flex-1">
          {error && <ErrorMessage message={error} />}

          {/* Disable toggle while loading */}
          <div className={isLoading ? "pointer-events-none opacity-50" : ""}>
            <RoleToggle role={role} setRole={setRole} />
          </div>

          {/* Only show Google Login for Donors */}
          {role === "donor" && (
            <>
              <GoogleLoginButton
                supabase={supabase}
                next={next}
                setError={setError}
                setIsLoading={setIsLoading} // Pass setter
                isLoading={isLoading}       // Pass state
              />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Pass loading props to forms */}
          {role === "donor" ? (
            <DonorLoginForm />
          ) : (
            <NgoLoginForm />
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
            <div className={isLoading ? "pointer-events-none opacity-50" : ""}>
                <AuthLink mode="login" currentRole={role}/>
            </div>
        </CardFooter>
      </Card>
    </>
  );
}

// Skeleton for the Server Page Suspense fallback
export function LoginSkeleton() {
    return (
        <Card className="w-full max-w-md p-8 h-[600px]">
            <CardHeader><Skeleton className="h-8 w-3/4 mx-auto" /></CardHeader>
            <CardContent className="space-y-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
    )
}