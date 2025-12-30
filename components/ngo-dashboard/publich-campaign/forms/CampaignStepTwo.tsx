"use client";

import { UseFormReturn } from "react-hook-form";
import { CampaignFormInput } from "@/lib/validation/campaignSchema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import FormError from "./FormError";

export default function CampaignStepTwo({ form }: { form: UseFormReturn<CampaignFormInput> }) {
  return (
    <>
      <h1 className="text-2xl font-bold max-w-6xl mx-auto">📢 How can donors connect with you?</h1>
      <p className="text-muted-foreground mb-4 max-w-6xl mx-auto">
        Provide accurate contact details and PICs.
      </p>

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
              <FormError form={form} name="contact_email" /> {/* ✅ replaced inline error */}
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
              <FormError form={form} name="contact_phone" /> {/* ✅ replaced inline error */}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Campaign Address</Label>
              <Textarea
                {...form.register("campaign_address")}
                placeholder="Physical Address of Campaign"
                className="w-full bg-white wrap-break-word whitespace-pre-wrap h-24 md:h-32 lg:h-40"
              />
              <FormError form={form} name="campaign_address" /> {/* ✅ replaced inline error */}
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
              <FormError form={form} name="pic1.name" /> {/* ✅ replaced inline error */}
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
              <FormError form={form} name="pic1.contact" /> {/* ✅ replaced inline error */}
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
              <FormError form={form} name="pic2.name" /> {/* ✅ replaced inline error */}
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
              <FormError form={form} name="pic2.contact" /> {/* ✅ replaced inline error */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
