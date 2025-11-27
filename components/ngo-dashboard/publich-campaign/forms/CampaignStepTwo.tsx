// @/components/forms/steps/CampaignStepTwo.tsx
"use client";

import { UseFormReturn } from "react-hook-form";
import { CampaignFormInput } from "@/lib/validation/campaignSchema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CampaignStepTwo({ form }: { form: UseFormReturn<CampaignFormInput> }) {
  const { errors } = form.formState;

  return (
    <>
      <h1 className="text-2xl font-bold max-w-6xl mx-auto">📢 How can donors connect with you?</h1>
      <p className="text-muted-foreground mb-4 max-w-6xl mx-auto">
        Provide accurate contact details and PICs.
      </p>

      {/* Responsive grid: auto-fit with minmax */}
      <div className="mt-8 grid gap-10 w-full max-w-6xl mx-auto grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
        
        {/* General Contact Container */}
        <div className="rounded-md border min-h-[250px] md:min-h-[350px] lg:min-h-[450px] overflow-hidden">
          <div className="bg-[#193046] p-4">
            <h2 className="text-lg font-semibold text-white">📇 General Contact</h2>
          </div>
          <div className="p-6 space-y-4 bg-gray-50">
            <div className="space-y-2">
              <Label className="text-sm">Email</Label>
              <Input
                type="email"
                {...form.register("contact_email")}
                placeholder="Email"
                className="bg-white"
              />
              {typeof errors.contact_email?.message === "string" && (
                <p className="text-red-500 text-sm">{errors.contact_email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Telephone Number</Label>
              <Input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                {...form.register("contact_phone")}
                placeholder="Telephone Number"
                className="bg-white"
              />
              {typeof errors.contact_phone?.message === "string" && (
                <p className="text-red-500 text-sm">{errors.contact_phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Campaign Address</Label>
              <Textarea
                {...form.register("campaign_address")}
                placeholder="Physical Address of Campaign"
                className="w-full bg-white break-words whitespace-pre-wrap h-24 md:h-32 lg:h-40"
              />
              {typeof errors.campaign_address?.message === "string" && (
                <p className="text-red-500 text-sm">{errors.campaign_address.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Person in Charge 1 Container */}
        <div className="rounded-md border min-h-[250px] md:min-h-[350px] lg:min-h-[450px] overflow-hidden">
          <div className="bg-[#193046] p-4">
            <h2 className="text-lg font-semibold text-white">👤 Person in Charge 1</h2>
          </div>
          <div className="p-6 space-y-4 bg-gray-50">
            <div className="space-y-2">
              <Label className="text-sm">Name</Label>
              <Input {...form.register("pic1.name")} placeholder="Name" className="bg-white" />
              {typeof errors.pic1?.name?.message === "string" && (
                <p className="text-red-500 text-sm">{errors.pic1.name?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Contact Number</Label>
              <Input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                {...form.register("pic1.contact")}
                placeholder="Contact Number"
                className="bg-white"
              />
              {typeof errors.pic1?.contact?.message === "string" && (
                <p className="text-red-500 text-sm">{errors.pic1.contact?.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Person in Charge 2 Container */}
        <div className="rounded-md border min-h-[250px] md:min-h-[350px] lg:min-h-[450px] overflow-hidden">
          <div className="bg-[#193046] p-4">
            <h2 className="text-lg font-semibold text-white">👤 Person in Charge 2</h2>
          </div>
          <div className="p-6 space-y-4 bg-gray-50">
            <div className="space-y-2">
              <Label className="text-sm">Name</Label>
              <Input {...form.register("pic2.name")} placeholder="Name" className="bg-white" />
              {typeof errors.pic2?.name?.message === "string" && (
                <p className="text-red-500 text-sm">{errors.pic2.name?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Contact Number</Label>
              <Input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                {...form.register("pic2.contact")}
                placeholder="Contact Number"
                className="bg-white"
              />
              {typeof errors.pic2?.contact?.message === "string" && (
                <p className="text-red-500 text-sm">{errors.pic2.contact?.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
