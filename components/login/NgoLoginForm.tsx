"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SupabaseClient } from "@supabase/supabase-js";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginFormValues, loginSchema } from "@/lib/validation/userLoginSchema";


interface Props {
  supabase: SupabaseClient;
  next: string | null;
  setError: (msg: string | null) => void;
  setIsLoading: (loading: boolean) => void; // 1. Add type
  isLoading: boolean;                       // 2. Add type
}

export default function NgoLoginForm({ 
  supabase, 
  next, 
  setError, 
  setIsLoading, 
  isLoading 
}: Props) { // 3. Destructure
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: LoginFormValues) => {
    setError(null);
    setIsLoading(true); // 4. Start Overlay

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const userRole = data.user?.user_metadata?.role || "donor";
      
      let destination = "/ngo/dashboard";
      
      if (userRole !== "ngo") {
        destination = "/donor/dashboard";
      }

      router.refresh();
      router.push(next || destination);

      // 5. Success: Keep overlay running

    } catch (err: any) {
      setIsLoading(false); // 6. Error: Stop overlay
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ngo-email">Email</Label>
        <Input
          id="ngo-email"
          type="email"
          placeholder="ngo@example.com"
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ngo-password">Password</Label>
        <div className="relative">
          <Input
            id="ngo-password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            {...register("password")}
            className={errors.password ? "border-red-500" : ""}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full mt-2" 
        disabled={isSubmitting || isLoading} // 7. Disable on global load
      >
        {isSubmitting || isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In as NGO"
        )}
      </Button>
    </form>
  );
}