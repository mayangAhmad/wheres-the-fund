// components/ngo-dashboard/my-campaigns/manage/UpdateMilestoneModal.tsx

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, UploadCloud, X, Image as ImageIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  milestone: any;
  campaignId: string;
}

type UploadItem = {
  file: File;
  name: string;
  size: number;
  progress: number; // 0-100
  status: "idle" | "uploading" | "uploaded" | "error";
  error?: string;
  cid?: string;
  url?: string;
};

export default function UpdateMilestoneModal({ isOpen, onClose, milestone, campaignId }: Props) {
  const [description, setDescription] = useState("");
  const [activityFiles, setActivityFiles] = useState<UploadItem[]>([]);
  const [invoiceFiles, setInvoiceFiles] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // Validation constants
  const MAX_FILES_PER_TYPE = 10;
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  const toUploadItem = (file: File): UploadItem => ({
    file,
    name: file.name,
    size: file.size,
    progress: 0,
    status: "idle",
  });

  const handleActivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    // Client-side validations
    if (activityFiles.length + incoming.length > MAX_FILES_PER_TYPE) {
      toast.error(`Max ${MAX_FILES_PER_TYPE} activity files allowed`);
      return;
    }

    for (const f of incoming) {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        continue;
      }
      setActivityFiles(prev => [...prev, toUploadItem(f)]);
    }
  };

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    if (invoiceFiles.length + incoming.length > MAX_FILES_PER_TYPE) {
      toast.error(`Max ${MAX_FILES_PER_TYPE} invoice files allowed`);
      return;
    }

    for (const f of incoming) {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        continue;
      }
      setInvoiceFiles(prev => [...prev, toUploadItem(f)]);
    }
  };

  const removeFile = (type: 'activity' | 'invoice', index: number) => {
    if (type === 'activity') {
      setActivityFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setInvoiceFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Inside UpdateMilestoneModal.tsx handleSubmit
const handleSubmit = async () => {
  setUploading(true);
  try {
    // Build queue (use UploadItem entries so we can track progress and errors)
    const items: { item: UploadItem; type: 'activity' | 'invoice' }[] = [];
    activityFiles.forEach(it => items.push({ item: it, type: 'activity' }));
    invoiceFiles.forEach(it => items.push({ item: it, type: 'invoice' }));

    // Client-side: upload sequentially to provide accurate progress and per-file error handling
    const uploadedCIDs: Array<{ name: string; cid: string; type: string; size: number; url?: string }> = [];

    for (let idx = 0; idx < items.length; idx++) {
      const { item, type } = items[idx];
      // Skip already uploaded
      if (item.status === 'uploaded') {
        uploadedCIDs.push({ name: item.name, cid: item.cid!, type, size: item.size, url: item.url });
        continue;
      }

      // Update status to uploading
      const setStatus = (s: UploadItem['status'], progress = item.progress, error?: string, cid?: string, url?: string) => {
        const updater = (prev: UploadItem[]) => prev.map(p => p.name === item.name ? { ...p, status: s, progress, error, cid, url } : p);
        if (type === 'activity') setActivityFiles(updater);
        else setInvoiceFiles(updater);
      };

      setStatus('uploading', 0);

      try {
        // 1. Get signed URL
        const urlRequest = await fetch('/api/files/url');
        if (!urlRequest.ok) throw new Error('Failed to get signed URL');
        const { url: signedUrl } = await urlRequest.json();

        // 2. Upload with progress via XHR
        const cidAndUrl = await new Promise<{ cid: string; url?: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', signedUrl);
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const percent = Math.round((ev.loaded / ev.total) * 100);
              setStatus('uploading', percent);
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const resp = JSON.parse(xhr.responseText);
                // Pinata upload may return IpfsHash or cid
                const cid = resp.IpfsHash ?? resp.cid ?? resp.data?.cid ?? resp.ipfsHash ?? null;
                if (!cid) return reject(new Error('Missing CID in upload response'));
                resolve({ cid, url: undefined });
              } catch (err) {
                return reject(new Error('Failed to parse upload response'));
              }
            } else {
              reject(new Error('Upload failed with status ' + xhr.status));
            }
          };
          xhr.onerror = () => reject(new Error('Upload network error'));

          const fd = new FormData();
          fd.append('file', item.file);
          xhr.send(fd);
        });

        // Convert to gateway URL on the server side (optional). We'll try to convert client-side via public gateway
        const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || '';
        const fileUrl = gateway ? `https://${gateway}/ipfs/${cidAndUrl.cid}` : undefined;

        setStatus('uploaded', 100, undefined, cidAndUrl.cid, fileUrl);
        uploadedCIDs.push({ name: item.name, cid: cidAndUrl.cid, type, size: item.size, url: fileUrl });
      } catch (err: any) {
        const message = err?.message ?? 'Upload failed';
        setStatus('error', item.progress, message);
      }
    }

    // 3. Send CIDs + metadata to your update API
    const res = await fetch('/api/milestones/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        milestone_id: milestone.id,
        campaign_id: campaignId,
        proof_description: description,
        cids: uploadedCIDs,
      }),
    });

    if (!res.ok) throw new Error('Failed to save records');

    toast.success("Success!");
    onClose();
    router.refresh();
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setUploading(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Submit Progress: Phase {milestone.milestone_index + 1}</DialogTitle>
          <DialogDescription>
            Evidence will be uploaded directly to IPFS for decentralized verification.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 py-2 space-y-6 custom-scrollbar">
          <div className="space-y-2">
            <Label>Progress Report</Label>
            <Textarea
              placeholder="Describe what was achieved and how funds were utilized..."
              className="min-h-[120px] resize-none" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <ImageIcon size={16} className="text-orange-500" /> 
                Activity Photos <span className="text-gray-400 font-normal text-xs">(IPFS)</span>
              </Label>
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 border-gray-300 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">Add Photos</p>
                </div>
                <Input type="file" multiple className="hidden" onChange={handleActivityChange} accept="image/*" />
              </label>

              <div className="grid grid-cols-3 gap-2">
                {activityFiles.map((item, idx) => (
                  <div key={idx} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden border">
                    <Image src={URL.createObjectURL(item.file)} alt="preview" fill className="object-cover" />
                    <div className="absolute left-0 right-0 bottom-0 h-8 bg-black/30 flex items-center px-2 text-xs text-white">
                      {item.status === 'uploading' && (
                        <div className="w-full">
                          <div className="h-1 bg-white/30 rounded overflow-hidden mb-1">
                            <div className="h-1 bg-green-400" style={{ width: `${item.progress}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span>{item.progress}%</span>
                            <span>{(item.size / (1024 * 1024)).toFixed(1)}MB</span>
                          </div>
                        </div>
                      )}
                      {item.status === 'uploaded' && <span className="text-green-300">Uploaded</span>}
                      {item.status === 'error' && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-300">{item.error}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Mark as idle so next submit will retry
                              setActivityFiles(prev => prev.map(p => p.name === item.name ? { ...p, status: 'idle', progress: 0, error: undefined } : p));
                            }}
                            className="text-xs px-2 py-0.5 bg-white/10 rounded text-white"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeFile('activity', idx)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md hover:bg-red-600 transition-colors">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <FileText size={16} className="text-green-600" /> 
                Bills & Invoices <span className="text-gray-400 font-normal text-xs">(IPFS)</span>
              </Label>
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-green-50 border-green-200 bg-green-50/30 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 text-green-400 mb-2" />
                  <p className="text-xs text-gray-500">Add Documents</p>
                </div>
                <Input type="file" multiple className="hidden" onChange={handleInvoiceChange} accept="image/*,.pdf" />
              </label>

              <div className="space-y-2">
                {invoiceFiles.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white border rounded text-xs shadow-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={14} className="text-gray-400 shrink-0" />
                      <span className="truncate max-w-[120px]">{item.name}</span>
                      {item.status === 'uploading' && <span className="ml-2 text-[11px] text-gray-500">{item.progress}%</span>}
                      {item.status === 'uploaded' && <span className="ml-2 text-[11px] text-green-600">Done</span>}
                      {item.status === 'error' && <span className="ml-2 text-[11px] text-red-600">{item.error}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">{(item.size / (1024 * 1024)).toFixed(2)}MB</span>
                      <button onClick={() => removeFile('invoice', idx)} className="text-red-500 hover:text-red-700">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-2 bg-white">
          <Button variant="outline" onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={uploading} className="bg-orange-600 hover:bg-orange-700 text-white min-w-[140px]">
            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Pinning to IPFS...</> : "Submit for Audit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}