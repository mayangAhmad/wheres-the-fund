"use client";

import { useState, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NgoSignupFormValues, ngoSignupSchema } from "@/lib/validation/ngoSignupSchema";
import { registerNgoAction } from "@/app/api/auth/auth"; 
import SubmitButton from "../auth/SubmitButton";

export default function NgoSignupForm() {
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(registerNgoAction, undefined);

  const {
    register,
    formState: { errors },
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

  return (
    <form action={formAction} className="space-y-4">
      
      {/* 3. Display Server-Side Errors (e.g. "User already exists") */}
      {state?.error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {state.error}
        </div>
      )}

      {/* ORGANIZATION NAME */}
      <div className="space-y-2">
        <Label htmlFor="orgName">Organization Name</Label>
        <Input
          id="orgName"
          placeholder="Helping Hands Foundation"
          {...register("orgName")}
          name="orgName" // ✅ REQUIRED for Server Action
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
          name="ssmNumber" // ✅ REQUIRED for Server Action
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
          name="email" // ✅ REQUIRED for Server Action
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
            name="password" 
            className={errors.password ? "border-red-500" : ""}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 transition-colors"
            type="button"
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
          name="confirmPassword" // ✅ REQUIRED for Server Action
          className={errors.confirmPassword ? "border-red-500" : ""}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <SubmitButton 
                isLoading={isPending} 
                loadingText="Signing in..."
                className="mt-8" 
              >
                  Sign Up
              </SubmitButton>
    </form>
  );
}