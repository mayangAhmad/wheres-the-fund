// app/auth/register/page.tsx
import Image from "next/image";
import { Suspense } from "react";
import Link from "next/link";

// Import the Client Component
import RegisterContent, { RegisterSkeleton } from "@/components/register/RegisterContent";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left hero image - Static Server Content */}
      <div className="hidden md:flex w-1/2 relative bg-black">
        <Image 
            src="/hero-image.jpg" 
            alt="Join our Cause" 
            fill 
            className="object-cover opacity-90" 
            priority 
        />
      </div>

      {/* Right signup form - Dynamic Client Content */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 bg-gray-50">
        {/* Back to home link for easy navigation */}
        <div className="w-full max-w-md mb-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-2" aria-label="Back to home">
            <span aria-hidden="true">←</span>
            <span>Back to Home</span>
          </Link>
        </div>
        {/* The Suspense boundary handles the initial loading state of the client component */}
        <Suspense fallback={<RegisterSkeleton />}>
            <RegisterContent />
        </Suspense>
      </div>
    </div>
  );
}