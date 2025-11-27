"use client";

import React from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming you use shadcn/ui
import { cn } from "@/lib/utils"; // Standard shadcn utility for class merging

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export default function SubmitButton({ 
  isLoading = false, 
  loadingText = "Processing...", 
  children, 
  className,
  ...props 
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isLoading || props.disabled}
      className={cn(
        "group relative w-full h-10 overflow-hidden rounded-md bg-[#182F44] text-white shadow-md transition-all disabled:opacity-100 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* 1. BACKGROUND LAYER: Orange Slide */}
      {/* Logic: If Loading OR Hovering, fill with Orange. */}
      <div
        className={cn(
          "absolute inset-0 bg-orange-500 transition-all duration-300 ease-out",
          isLoading ? "w-full" : "w-0 group-hover:w-full"
        )}
      />

      {/* 2. CONTENT LAYER */}
      <span className="relative z-10 flex items-center justify-center font-bold tracking-wide">
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            {loadingText}
          </span>
        ) : (
          <span className="flex items-center transition-all duration-300">
            {/* Main Text */}
            <span>{children}</span>

            {/* Arrow Wrapper - Expands width on hover */}
            <div className="w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:w-6 group-hover:opacity-100 group-hover:ml-2">
              <ArrowRight className="h-5 w-5" />
            </div>
          </span>
        )}
      </span>
    </Button>
  );
}