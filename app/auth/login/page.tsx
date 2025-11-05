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
import DonorLoginForm from "@/components/DonorLoginForm";
import NgoLoginForm from "@/components/NgoLoginForm";

export default function LoginPage() {
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

      {/* Right form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 bg-gray-50">
        <Card className="w-full max-w-md p-8 min-h-[600px] flex flex-col justify-start">
          <CardHeader>
            <CardTitle className="text-center">Welcome Back!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 flex flex-col justify-start">
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
            <DonorLoginForm 
                supabase={supabase}
                next={next}
                setError={setError}
            />
            ) : (
            <NgoLoginForm 
                supabase={supabase} 
                next={next} 
                setError={setError}
             />
            )}



          </CardContent>
           <AuthLink mode="login" />
        </Card>
      </div>

           

    </div>
  );
}
