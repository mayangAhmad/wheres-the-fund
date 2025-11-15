import { CircleAlert } from "lucide-react";

export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md border px-4 py-3 text-red-600 flex items-center gap-2">
      <CircleAlert size={16} />
      <span>{message}</span>
    </div>
  );
}
