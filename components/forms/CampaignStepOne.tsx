// @/components/forms/steps/CampaignStepOne.tsx
"use client";

import { UseFormReturn } from "react-hook-form";
import { CampaignFormInput } from "@/lib/validation/campaignSchema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CampaignStepOne({ form }: { form: UseFormReturn<CampaignFormInput> }) {
  const campaignCategory = form.watch("category");
  const isStandard = campaignCategory === "standard";
  const { errors } = form.formState;

  const today = new Date();
  today.setDate(today.getDate() + 7);

  return (
    <>
      <h1 className="text-2xl font-bold max-w-6xl mx-auto">📢 Publish New Campaign</h1>
      <p className="text-muted-foreground mb-4 max-w-6xl mx-auto">
        Fill in the details and milestones for your campaign.
      </p>

      <div className="mt-8 grid gap-10 w-full max-w-6xl mx-auto grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
        
        {/* Campaign Details */}
        <div className="rounded-md border min-h-[250px] md:min-h-[350px] lg:min-h-[450px] overflow-hidden">
          <div className="bg-[#193046] p-4">
            <h2 className="text-lg font-semibold text-white">📇 Campaign Details</h2>
          </div>
          <div className="p-6 space-y-4 bg-gray-50">
            
            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm">Type of Campaign</Label>
              <RadioGroup
                onValueChange={(val: "disaster" | "standard") => form.setValue("category", val)}
                value={campaignCategory}
                defaultValue="standard"
                className="flex gap-4 bg-white"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="disaster" id="r-disaster" />
                  <Label htmlFor="r-disaster">Disaster Relief</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="standard" id="r-standard" />
                  <Label htmlFor="r-standard">Standard</Label>
                </div>
              </RadioGroup>
              {errors.category && typeof errors.category.message === "string" && (
                <p className="text-red-500 text-sm">{errors.category.message}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-sm">Campaign Title</Label>
              <Input
                {...form.register("title")}
                placeholder="e.g., Clean Water for Rural Schools"
                className={`bg-white ${errors.title ? "border-red-500" : ""}`}
              />
              {errors.title && typeof errors.title.message === "string" && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm">Campaign Description</Label>
              <Textarea
                {...form.register("description")}
                placeholder="Brief overview of the campaign"
                maxLength={1000}
                className={`w-full bg-white break-words whitespace-pre-wrap h-24 md:h-32 lg:h-40 ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{(form.watch("description") || "").length} / 1000 characters</span>
                <span>{1000 - (form.watch("description") || "").length} left</span>
              </div>
              {errors.description && typeof errors.description.message === "string" && (
                <p className="text-red-500 text-sm">{errors.description.message}</p>
              )}
            </div>

            {/* Photo */}
            <div className="space-y-2">
              <Label className="text-sm">Campaign Photo</Label>
              <Input type="file" {...form.register("photo")} className={`bg-white ${errors.photo ? "border-red-500" : ""}`} />
              {errors.photo && typeof errors.photo.message === "string" && (
                <p className="text-red-500 text-sm">{errors.photo.message}</p>
              )}
            </div>

            {/* Goal Amount */}
            <div className="space-y-2">
              <Label className="text-sm">Targeted Amount (MYR)</Label>
              <Input
                type="number"
                {...form.register("goal_amount")}
                placeholder="e.g., 5000"
                className={`bg-white ${errors.goal_amount ? "border-red-500" : ""}`}
              />
              {errors.goal_amount && typeof errors.goal_amount.message === "string" && (
                <p className="text-red-500 text-sm">{errors.goal_amount.message}</p>
              )}
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label className="text-sm">Campaign Deadline</Label>
              <Input
                type="date"
                {...form.register("end_date")}
                className={`bg-white ${errors.end_date ? "border-red-500" : ""}`}
                min={today.toISOString().split("T")[0]} // disables all dates before 7 days from now
              />
              {errors.end_date && typeof errors.end_date.message === "string" && (
                <p className="text-red-500 text-sm">{errors.end_date.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Milestones */}
        <div className="rounded-md border min-h-[250px] md:min-h-[350px] lg:min-h-[450px] overflow-hidden">
          <div className="bg-[#193046] p-4">
            <h2 className="text-lg font-semibold text-white">🎯 Campaign Milestones</h2>
          </div>
          <div className="p-6 space-y-4 bg-gray-50">
            {!isStandard && (
              <>
                <p className="text-sm text-muted-foreground">Define the primary goal of your relief effort.</p>
                <div className="space-y-2">
                  <Label className="text-sm">Goal</Label>
                  <Input
                    {...form.register("milestones.0")}
                    placeholder="Disbursement of aid"
                    className={`bg-white ${errors.milestones?.[0] ? "border-red-500" : ""}`}
                  />
                  {errors.milestones?.[0] && typeof errors.milestones[0]?.message === "string" && (
                    <p className="text-red-500 text-sm">{errors.milestones[0]?.message}</p>
                  )}
                </div>
              </>
            )}

            {isStandard && (
              <>
                <p className="text-sm text-muted-foreground">Break down your campaign into 3 key goals.</p>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Label className="text-sm">Milestone {i + 1}</Label>
                    <Input
                      {...form.register(`milestones.${i}` as const)}
                      placeholder={`Milestone ${i + 1} Title`}
                      className={`bg-white ${errors.milestones?.[i] ? "border-red-500" : ""}`}
                    />
                    {errors.milestones?.[i] && typeof errors.milestones[i]?.message === "string" && (
                      <p className="text-red-500 text-sm">{errors.milestones[i]?.message}</p>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
