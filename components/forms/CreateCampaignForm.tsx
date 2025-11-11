// components/forms/CreateCampaignForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { campaignSchema, CampaignFormData } from "@/lib/validation/campaignSchema";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CampaignStepOne from "./CampaignStepOne";
import CampaignStepTwo from "./CampaignStepTwo";
import CampaignStepThree from "./CampaignStepThree";
import createClient from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "../ui/button";

export default function CreateCampaignForm({ user }: { user: User }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const supabase = createClient();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      type: "standard",
      milestones: ["", "", ""],
      problems: [""],
      solutions: [""],
      pic1: { name: "", contact: "" },
      pic2: { name: "", contact: "" },
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const file = data.photo?.[0];
    let imageUrl = null;

    if (file) {
      const path = `campaigns/${user.id}/${file.name}`;
      const upload = await supabase.storage.from("campaign-photos").upload(path, file);
      if (upload.error) {
        console.error("Photo upload failed:", upload.error.message);
        return;
      }
      imageUrl = supabase.storage.from("campaign-photos").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("campaigns").insert([
      {
        ngo_id: user.id,
        ngo_name: user.user_metadata?.name,
        title: data.title,
        description: data.description,
        category: data.type,
        milestones: data.milestones,
        image_url: imageUrl,
        goal_amount: data.amount,
        background: data.background,
        problems: data.problems,
        solutions: data.solutions,
        contact_email: data.email,
        contact_phone: data.phone,
        campaign_address: data.address,
        pic1: data.pic1,
        pic2: data.pic2,
        wallet_address: user.user_metadata?.wallet_address,
      },
    ]);

    if (error) {
      console.error("Insert failed:", error.message);
      return;
    }

    router.push("/ngo/dashboard");
  });

  return (
    <form onSubmit={onSubmit} className="w-full p-6 space-y-6">
      {step === 0 && <CampaignStepOne form={form} />}
      {step === 2 && <CampaignStepTwo form={form} />}
      {step === 1 && <CampaignStepThree form={form} />}

     <div className={`flex w-full ${step > 0 ? 'justify-between' : 'justify-end'}`}>
      
      {/* Back Button */}
      {step > 0 && (
        <Button 
          variant="customAction" 
          size="action"
          className="w-32" 
          type="button" 
          onClick={() => setStep(step - 1)}
        >
          ← Back
        </Button>
      )}
      
      {/* Next Button */}
      {step < 2 ? (
        <Button 
          variant="customAction" 
          size="action"
          className="w-32" 
          type="button" 
          onClick={() => setStep(step + 1)}
        >
          Next →
        </Button>
      ) : (
        // 🚨 FIX APPLIED: Removed the surrounding curly braces ({}) 🚨
        <> 
        {/* Submit Button (use the same variant but omit w-32 or use a larger width) */}
        <Button 
          variant="destructive" 
          size="action"
          type="submit"
        >
          Submit Campaign
        </Button>
        </>
      )}
    </div>
    </form>
  );
}