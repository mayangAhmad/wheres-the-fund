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
import { User } from "@supabase/supabase-js";
import createClient from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import CampaignStepOne from "./CampaignStepOne";
import CampaignStepTwo from "./CampaignStepTwo";
import CampaignStepThree from "./CampaignStepThree";
import { Button } from "../ui/button";
import LoadingModal from "./LoadingModal";

type ApiPayload = Omit<CampaignFormData, "photo"> & { image_url: string };

export default function CreateCampaignForm({ user }: { user: User }) { 
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  // ✅ Use input schema for resolver
  const form = useForm<CampaignFormInput>({
    resolver: zodResolver(campaignFormInputSchema),
    defaultValues: {
      category: "standard",
      title: "",
      description: "",
      photo: undefined,
      goal_amount: "", // string
      end_date: "",
      milestones: ["", "", ""],
      background: "",
      problems: [""],
      solutions: [""],
      contact_email: "",
      contact_phone: "",
      campaign_address: "",
      pic1: { name: "", contact: "" },
      pic2: { name: "", contact: "" },
    },
    mode: "onChange",
    reValidateMode: "onChange"
  });

  async function onSubmit(rawData: CampaignFormInput) {
    setIsSubmitting(true);
    let imagePath = "";
    let publicUrl = "";

    try {
      // ✅ Transform raw input into parsed data
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
      router.push(`/ngo/dashboard`);
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast.error(error.message);
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

      <div className={`flex w-full ${step > 0 ? "justify-between" : "justify-end"}`}>
        {step > 0 && (
          <Button type="button" variant="outline" onClick={() => setStep(step - 1)} disabled={isSubmitting}>
            ← Back
          </Button>
        )}
        {step < 2 ? (
          <Button type="button" onClick={handleNextStep} disabled={isSubmitting}>
            Next →
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Campaign"}
          </Button>
        )}
      </div>
    </form>

    {/* ✅ Loading modal */}
      <LoadingModal open={isSubmitting} />
    </>
  );
}
