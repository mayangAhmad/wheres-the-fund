"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  campaignFormInputSchema,
  campaignSchema,
  CampaignFormInput,
  CampaignFormData,
} from "@/lib/validation/campaignSchema";
import { useState } from "react";
import { useRouter } from "next/navigation";
import createClient from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import CampaignStepOne from "./CampaignStepOne";
import CampaignStepTwo from "./CampaignStepTwo";
import CampaignStepThree from "./CampaignStepThree";
import LoadingModal from "./LoadingModal";
import { useNgoUser } from "@/context/NgoUserContext";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type ApiPayload = Omit<CampaignFormData, "photo"> & { image_url: string };

export default function CreateCampaignForm() { 
  const router = useRouter();
  const { user } = useNgoUser();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  if (!user) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const form = useForm<CampaignFormInput>({
    resolver: zodResolver(campaignFormInputSchema),
    defaultValues: {
      category: undefined,
      title: "",
      description: "",
      photo: undefined,
      goal_amount: "",
      end_date: "",
      background: "",
      problems: [""],
      solutions: [""],
      contact_email: user.email || "",
      campaign_address: "",
      pic1: { name: "", contact: "" },
      pic2: { name: "", contact: "" },
      milestones: [
        { title: "", description: "" },
        { title: "", description: "" },
        { title: "", description: "" },
      ],
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  async function onSubmit(rawData: CampaignFormInput) {
    setIsSubmitting(true);
    let imagePath = "";
    let publicUrl = "";

    try {
      const data: CampaignFormData = campaignSchema.parse(rawData);
      const file = data.photo?.[0];
      if (!file) throw new Error("No photo uploaded.");

      const fileExt = file.name.split(".").pop();
      imagePath = `public/${user.id}/${uuidv4()}.${fileExt}`;

      const { error: storageError } = await supabase.storage
        .from("campaigns")
        .upload(imagePath, file);
      if (storageError) throw new Error(storageError.message);

      const { data: urlData } = supabase.storage
        .from("campaigns")
        .getPublicUrl(imagePath);
      if (!urlData.publicUrl) throw new Error("Could not get public URL.");
      publicUrl = urlData.publicUrl;

      const { photo, ...formData } = data;
      const payload: ApiPayload = { ...formData, image_url: publicUrl };

      const response = await fetch("/api/campaigns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create campaign.");

      toast.success("Campaign created successfully!");
      
      // ✅ FIX: Removed router.refresh() to prevent race conditions.
      // Simply push to the dashboard. The loading modal will persist until the new page loads.
      router.push("/ngo/dashboard");
      
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast.error(error.message);
      
      // Only stop loading if there was an error
      setIsSubmitting(false);

      if (publicUrl) {
        await supabase.storage.from("campaigns").remove([imagePath]);
      }
    }
  }

  const handleNextStep = async () => {
    let fields: (keyof CampaignFormInput)[] = [];
    if (step === 0) {
      fields = ["title", "description", "category", "photo", "goal_amount", "end_date", "milestones"];
    } else if (step === 1) {
      fields = ["contact_email", "contact_phone", "campaign_address", "pic1", "pic2"];
    } else if (step === 2) {
      fields = ["background", "problems", "solutions"];
    }

    const isValid = await form.trigger(fields);
    if (isValid) setStep((s) => s + 1);
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full p-6 space-y-12">
        {step === 0 && <CampaignStepOne form={form} />}
        {step === 1 && <CampaignStepTwo form={form} />}
        {step === 2 && <CampaignStepThree form={form} />}

        <div className={`flex w-full items-center ${step > 0 ? "justify-between" : "justify-end"}`}>
          {step > 0 && (
            <button 
              type="button" 
              onClick={() => setStep(step - 1)} 
              disabled={isSubmitting}
              className="group flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Back
            </button>
          )}
          
          {step < 2 ? (
            <button 
              type="button" 
              onClick={handleNextStep} 
              disabled={isSubmitting}
              className="group flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-orange-600 rounded-full hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              Next
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="group flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-orange-600 rounded-full hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {isSubmitting ? "Submitting..." : "Submit Campaign"}
            </button>
          )}
        </div>
      </form>

      <LoadingModal open={isSubmitting} />
    </>
  );
}