import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

export default function StatusBadge({ status }: { status: string }) {
  // Normalize string to handle "Processing", "processing", "COMPLETED", etc.
  const s = status?.toLowerCase() || "processing";

  if (s === "completed" || s === "succeeded") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Success
      </span>
    );
  }
  
  if (s === "processing" || s === "pending") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <Clock className="w-3 h-3 mr-1 animate-pulse" />
        Processing
      </span>
    );
  }

  // Handle specific failure cases if you want to be detailed
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200">
      <XCircle className="w-3 h-3 mr-1" />
      {s.includes("failed") ? "Failed" : status} 
    </span>
  );
}