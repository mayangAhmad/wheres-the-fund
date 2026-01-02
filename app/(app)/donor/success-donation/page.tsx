// app/donor/success-donation/page.tsx
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SuccessView from "@/components/donation/SuccessView"; 

export default function DonationSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-orange-600" />}>
        <SuccessView />
      </Suspense>
    </div>
  );
}