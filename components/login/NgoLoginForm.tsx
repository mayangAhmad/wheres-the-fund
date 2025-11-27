"use client";

import { useState, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginFormValues, loginSchema } from "@/lib/validation/userLoginSchema";
import { loginNgoAction } from "@/app/actions/auth"; // Your Server Action
import SubmitButton from "../auth/SubmitButton";

export default function NgoLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  
  // 1. Hook up the Server Action
  const [state, formAction, isPending] = useActionState(loginNgoAction, undefined);

  // 2. Keep React Hook Form ONLY for UI validation (red borders)
  const {
    register,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // NOTE: 'onSubmit' is removed. The 'action' prop handles submission.

  return (
   <form action={formAction} className="space-y-4">
      
      {/* 3. Display Server-Side Errors */}
      {state?.error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="ngo-email">Email</Label>
        <Input
          id="ngo-email"
          type="email"
          placeholder="ngo@example.com"
          {...register("email")}
          // Register adds 'name="email"' automatically, which the Server Action needs.
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
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
            type="button" // Prevent this button from submitting the form
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

        <SubmitButton 
            isLoading={isPending} 
            loadingText="Signing in..."
            className="mt-8" 
          >
            Sign In as NGO
          </SubmitButton>
    </form>
  );
}