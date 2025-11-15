//app/auth/register/page.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";


import createClient from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import RoleToggle from "@/components/RoleToggle";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import ErrorMessage from "@/components/ErrorMessage";
import AuthLink from "@/components/AuthLink";
import DonorSignupForm from "@/components/DonorSignupForm";
import NgoSignupForm from "@/components/NgoSignupForm";

export default function SignUpPage() {
  const [role, setRole] = useState<"donor" | "ngo">("donor");
  const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const next = searchParams.get("next");

  const supabase = createClient();

  return (
    <div className="flex min-h-screen">
      {/* Left hero image */}
      <div className="hidden md:flex w-1/2 relative">
        <Image src="/hero-image.jpg" alt="Hero" fill className="object-cover" />
      </div>

      {/* Right signup form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 bg-gray-50">
        <Card className="w-full max-w-md p-8 min-h-[650px] flex flex-col justify-start">
          <CardHeader>
            <CardTitle className="text-center">Create Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col justify-start">
            {error && <ErrorMessage message={error} />}

            <RoleToggle role={role} setRole={setRole} />

            {role === "donor" && (
              <GoogleLoginButton
                supabase={supabase}
                next={next}
                setError={setError}
              />
            )}

           {role === "donor" ? (
                       <DonorSignupForm 
                           supabase={supabase}
                           setError={setError}
                       />
                       ) : (
                       <NgoSignupForm 
                           supabase={supabase} 
                           setError={setError}
                        />
                       )}

            <AuthLink mode="signup" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
