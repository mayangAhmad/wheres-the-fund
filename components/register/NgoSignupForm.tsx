"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NgoSignupFormValues, ngoSignupSchema } from "@/lib/validation/ngoSignupSchema";

interface Props {
  supabase: SupabaseClient;
  setError: (msg: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean; // ✅ Added this
}

export default function NgoSignupForm({ 
  supabase, 
  setError, 
  setIsLoading,
  isLoading // ✅ Destructured this
}: Props) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NgoSignupFormValues>({
    resolver: zodResolver(ngoSignupSchema),
    mode: "onBlur",
    defaultValues: {
      orgName: "",
      ssmNumber: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (formData: NgoSignupFormValues) => {
    setError(null);
    setIsLoading(true); // ✅ START LOADING

    try {
      // 1. Verify SSM
      const verifyRes = await fetch("/api/user/ssm", {
        method: "POST",
        body: JSON.stringify({ ssmNumber: formData.ssmNumber }),
      });
      
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.valid) {
        throw new Error(verifyData.message || "Invalid SSM Number");
      }

      // 2. Sign up in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { 
            name: formData.orgName, 
            role: "ngo",
            ssm_number: formData.ssmNumber
          },
        },
      });

      if (error) throw error;
      if (!data.user?.id) throw new Error("User creation failed");

      // 3. Handle DB Registration
      const registerRes = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.user.id,
          name: formData.orgName,
          email: formData.email,
          role: "ngo",
          ssm_number: formData.ssmNumber,
        }),
      });

      if (!registerRes.ok) {
        const resJson = await registerRes.json();
        throw new Error(resJson.error || "Database registration failed");
      }

      // 4. Setup Wallet
      await fetch("/api/user/setup-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id }),
      });

      // Success: Keep isLoading(true) while redirecting
      router.push("/auth/login");
    } catch (err: any) {
      setIsLoading(false); // ✅ STOP LOADING ONLY ON ERROR
      setError(err.message || "An unexpected error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ORGANIZATION NAME */}
      <div className="space-y-2">
        <Label htmlFor="orgName">Organization Name</Label>
        <Input
          id="orgName"
          placeholder="Helping Hands Foundation"
          {...register("orgName")}
          className={errors.orgName ? "border-red-500" : ""}
        />
        {errors.orgName && (
          <p className="text-sm text-red-500">{errors.orgName.message}</p>
        )}
      </div>

      {/* SSM NUMBER */}
      <div className="space-y-2">
        <Label htmlFor="ssmNumber">SSM Number</Label>
        <Input
          id="ssmNumber"
          placeholder="e.g. 202301000000"
          {...register("ssmNumber")}
          className={errors.ssmNumber ? "border-red-500" : ""}
        />
        {errors.ssmNumber && (
          <p className="text-sm text-red-500">{errors.ssmNumber.message}</p>
        )}
      </div>

      {/* EMAIL */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="ngo@example.com"
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* PASSWORD */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            {...register("password")}
            className={errors.password ? "border-red-500" : ""}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* CONFIRM PASSWORD */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Re-enter Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="********"
          {...register("confirmPassword")}
          className={errors.confirmPassword ? "border-red-500" : ""}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full mt-4" 
        disabled={isSubmitting || isLoading} // ✅ Updated Logic
      >
        {isSubmitting || isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying & Registering...
          </>
        ) : (
          "Register NGO"
        )}
      </Button>
    </form>
  );
}