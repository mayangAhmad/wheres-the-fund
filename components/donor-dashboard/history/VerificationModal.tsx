// components/donor-dashboard/history/VerificationModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldCheck, ExternalLink, Box, FileText, CreditCard } from "lucide-react";

export default function VerificationModal({ donation, isOpen, onClose }: { donation: any, isOpen: boolean, onClose: () => void }) {
  if (!donation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="text-green-600" />
            Verification Trace
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 1. Payment Origin */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-400 uppercase">
              <CreditCard size={14} /> Fiat Origin (Stripe)
            </div>
            <p className="text-sm font-mono break-all text-gray-600">{donation.stripe_payment_id}</p>
          </div>

          {/* 2. Decentralized Proof
          <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold text-orange-600 uppercase">
              <Box size={14} /> Evidence (IPFS)
            </div>
            <p className="text-xs text-gray-500 mb-2 italic">"{donation.milestones?.proof_description?.slice(0, 100)}..."</p>
            <a 
              href={`https://gateway.pinata.cloud/ipfs/${donation.milestones?.ipfs_cid}`}
              target="_blank"
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              Verify Invoices on IPFS <ExternalLink size={12} />
            </a>
          </div> */}

          {/* 3. Immutable Record */}
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold text-blue-600 uppercase">
              <FileText size={14} /> Audit Trail (Blockchain)
            </div>
            <p className="text-xs font-mono text-gray-600 break-all mb-2">{donation.on_chain_tx_hash}</p>
            <a 
              href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL}/tx/${donation.on_chain_tx_hash}`}
              target="_blank"
              className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-1"
            >
              View Chainlens Explorer <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}