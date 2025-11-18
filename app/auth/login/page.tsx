import Image from "next/image";
import { Suspense } from "react";
import LoginContent, { LoginSkeleton } from "@/components/login/LoginContent";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left hero image - Server Side Rendered */}
      <div className="hidden md:flex w-1/2 relative bg-black">
        <Image 
            src="/hero-image.jpg" 
            alt="Charity Impact" 
            fill 
            className="object-cover opacity-90" 
            priority 
        />
      </div>

      {/* Right form - Client Side Interactive */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 bg-gray-50">
        <Suspense fallback={<LoginSkeleton />}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}