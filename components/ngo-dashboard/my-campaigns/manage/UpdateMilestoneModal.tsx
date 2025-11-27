"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, UploadCloud, X, Image as ImageIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import createClient from "@/lib/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  milestone: any;
  campaignId: string;
}

export default function UpdateMilestoneModal({ isOpen, onClose, milestone, campaignId }: Props) {
  const [description, setDescription] = useState("");
  const [activityFiles, setActivityFiles] = useState<File[]>([]);
  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleActivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setActivityFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setInvoiceFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (type: 'activity' | 'invoice', index: number) => {
    if (type === 'activity') {
      setActivityFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setInvoiceFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const uploadFiles = async (files: File[], folder: 'proofs' | 'invoices') => {
    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const filePath = `public/${campaignId}/${milestone.id}/${folder}/${Date.now()}_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("campaigns")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("campaigns").getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!description || description.length < 10) return toast.error("Please describe your progress.");
    
    if (activityFiles.length === 0 && invoiceFiles.length === 0) {
      return toast.error("Please provide at least one photo or invoice.");
    }

    setUploading(true);

    try {
      const activityUrls = await uploadFiles(activityFiles, 'proofs');
      const invoiceUrls = await uploadFiles(invoiceFiles, 'invoices');

      const res = await fetch("/api/milestones/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestone_id: milestone.id,
          campaign_id: campaignId,
          proof_description: description,
          proof_images: activityUrls,
          proof_invoices: invoiceUrls
        }),
      });

      if (!res.ok) throw new Error("Failed to update milestone");

      toast.success("Progress submitted!");
      onClose();
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl flex flex-col max-h-[85vh]">
        
        {/* Header: Fixed */}
        <DialogHeader>
          <DialogTitle>Submit Progress: Phase {milestone.milestone_index + 1}</DialogTitle>
          <DialogDescription>
            Upload evidence to unlock the next funding tranche.
          </DialogDescription>
        </DialogHeader>

        {/* Content: Scrollable Area */}
        <div className="flex-1 overflow-y-auto pr-2 py-2 space-y-6 custom-scrollbar">
          
          {/* 1. Description */}
          <div className="space-y-2">
            <Label>Progress Report</Label>
            <Textarea
              placeholder="Describe what was achieved, challenges faced, and how funds were utilized..."
              // FIX: Set explicit min-height and max-height to control expansion within scroll view
              className="min-h-[120px] resize-none" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2. Activity Photos */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <ImageIcon size={16} className="text-orange-500" /> 
                Activity Photos <span className="text-gray-400 font-normal text-xs">(Visual)</span>
              </Label>
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 border-gray-300 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">Upload Photos</p>
                </div>
                <Input type="file" multiple className="hidden" onChange={handleActivityChange} accept="image/*" />
              </label>

              {/* Activity Previews */}
              <div className="grid grid-cols-3 gap-2">
                {activityFiles.map((file, idx) => (
                  <div key={idx} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden border">
                    <Image src={URL.createObjectURL(file)} alt="preview" fill className="object-cover" />
                    <button onClick={() => removeFile('activity', idx)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md hover:bg-red-600 transition-colors">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Financial Documents */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <FileText size={16} className="text-green-600" /> 
                Bills & Invoices <span className="text-gray-400 font-normal text-xs">(PDF/IMG)</span>
              </Label>
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-green-50 border-green-200 bg-green-50/30 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 text-green-400 mb-2" />
                  <p className="text-xs text-gray-500">Upload Docs</p>
                </div>
                <Input type="file" multiple className="hidden" onChange={handleInvoiceChange} accept="image/*,.pdf" />
              </label>

              {/* Invoice Previews */}
              <div className="space-y-2">
                {invoiceFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white border rounded text-xs shadow-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={14} className="text-gray-400 shrink-0" />
                      <span className="truncate max-w-[100px]">{file.name}</span>
                    </div>
                    <button onClick={() => removeFile('invoice', idx)} className="text-red-500 hover:text-red-700">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Fixed at Bottom */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-2 bg-white">
          <Button variant="outline" onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={uploading} className="bg-orange-600 hover:bg-orange-700 text-white min-w-[140px]">
            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Submit for Audit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}