import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-50">
            <div className="flex-1 p-8 space-y-6">
        <Skeleton className="h-24 w-full rounded-xl" /> {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <Skeleton className="h-32 rounded-xl" />
           <Skeleton className="h-32 rounded-xl" />
           <Skeleton className="h-32 rounded-xl" />
           <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}