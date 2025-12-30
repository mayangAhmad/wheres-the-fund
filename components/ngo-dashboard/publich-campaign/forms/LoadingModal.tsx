// components/ui/LoadingModal.tsx
"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Loader2 } from "lucide-react";

export default function LoadingModal({ open }: { open: boolean }) {
  return (
    <Dialog open={open}>
      <DialogContent className="flex flex-col items-center justify-center space-y-4">
        <VisuallyHidden>
          <DialogTitle>Submitting Campaign</DialogTitle>
        </VisuallyHidden>

        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Submitting campaign, please wait...
          It may take a few minutes
        </p>
      </DialogContent>
    </Dialog>
  );
}
