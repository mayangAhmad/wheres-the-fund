import { IconCopy } from "@tabler/icons-react";
import { useState } from "react";

export function WalletDisplay({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const truncateMiddle = (addr: string, start = 7, end = 6) =>
    addr.length > start + end ? `${addr.slice(0, start)}...${addr.slice(-end)}` : addr;

  return (
    <div className="group relative flex items-center gap-1">
      <span
        className="text-xs text-gray-500 font-mono max-w-[120px] truncate"
        title={address}
      >
        {truncateMiddle(address)}
      </span>
      <button
        onClick={handleCopy}
        className="text-gray-400 hover:text-gray-600 transition"
        aria-label="Copy wallet address"
      >
        <IconCopy className="h-4 w-4" />
      </button>
      {copied && (
        <span className="absolute top-full mt-1 text-[10px] text-green-600">
          Copied!
        </span>
      )}
    </div>
  );
}
