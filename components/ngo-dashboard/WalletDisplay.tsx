"use client";

import { useState } from "react";
import { Copy, Check, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WalletDisplayProps {
  address?: string | null; // 1. Allow null or undefined types
}

export default function WalletDisplay({ address }: WalletDisplayProps) {
  const [copied, setCopied] = useState(false);

  // 2. GUARD CLAUSE: Prevent crash if data is missing
  if (!address) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Wallet className="h-4 w-4" />
        <span>No Wallet Connected</span>
      </div>
    );
  }

  // 3. Safe Function: logic only runs if address exists
  const truncateMiddle = (addr: string, start = 6, end = 4) => {
    if (!addr) return "";
    return addr.length > start + end 
      ? `${addr.slice(0, start)}...${addr.slice(-end)}` 
      : addr;
  };

  const copyToClipboard = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex items-center gap-2 py-1.5 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${address ? "bg-green-500" : "bg-gray-300 pointer-events-none"}`} />        <span className="font-mono text-sm font-medium text-foreground">
          {truncateMiddle(address)}
        </span>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-muted"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="sr-only">Copy address</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? "Copied!" : "Copy Address"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}