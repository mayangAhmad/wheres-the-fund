export function formatToMalaysiaTime(date: string | Date | null | undefined): string {
  if (!date) return "-";

  const d = new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "short", // e.g. "Nov"
    day: "numeric", // e.g. "30"
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,    // e.g. "5:00 PM"
  }).format(d);
}

// For relative time (e.g. "2 hours ago")
// You can use this if you want relative times fixed to MY perception
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  // If older than a week, show full date
  return formatToMalaysiaTime(date);
}
