"use client";

import { UseFormReturn } from "react-hook-form";
import { CampaignFormInput } from "@/lib/validation/campaignSchema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormError from "./FormError";

export default function CampaignStepOne({ form }: { form: UseFormReturn<CampaignFormInput> }) {
  const { errors } = form.formState;
  
  const goalAmountStr = form.watch("goal_amount"); 
  const goalAmount = parseFloat(goalAmountStr as unknown as string) || 0;

  const today = new Date();
  today.setDate(today.getDate() + 7);

  const phases = [
    { label: 'Phase 1: Mobilization', percent: 20, color: 'green', desc: 'Initial disbursement (20%) to start operations.' },
    { label: 'Phase 2: Execution', percent: 40, color: 'blue', desc: 'Major project implementation (40%).' },
    { label: 'Phase 3: Completion', percent: 40, color: 'blue', desc: 'Final finishing and handover (40%).' }
  ];

  return (
    <>
      <h1 className="text-2xl font-bold max-w-6xl mx-auto">📢 Publish New Campaign</h1>
      <p className="text-muted-foreground mb-4 max-w-6xl mx-auto">
        Fill in the details. All campaigns follow a strict 3-milestone transparency structure.
      </p>

      <div className="mt-8 grid gap-10 w-full max-w-6xl mx-auto grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT COLUMN: Campaign Details */}
        <div className="rounded-md border overflow-hidden h-fit">
          <div className="bg-[#193046] p-4">
            <h2 className="text-lg font-semibold text-white">📇 Campaign Details</h2>
          </div>
          <div className="p-6 space-y-4 bg-gray-50">
            
            {/* Category Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm">Category</Label>
              <Select 
                  onValueChange={(val) => {
                    form.setValue("category", val as CampaignFormInput["category"]); 
                  }}
                  defaultValue={form.watch("category")}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Disaster Relief">Disaster Relief</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Hunger">Hunger & Food Security</SelectItem>
                    <SelectItem value="Medical">Medical Aid</SelectItem>
                    <SelectItem value="Community">Community Development</SelectItem>
                  </SelectContent>
                </Select>
              <FormError form={form} name="category" /> {/* ✅ replaced inline error */}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-sm">Campaign Title</Label>
              <Input
                {...form.register("title")}
                placeholder="e.g., Clean Water for Rural Schools"
                className={`bg-white ${errors.title ? "border-red-500" : ""}`}
              />
              <FormError form={form} name="title" /> {/* ✅ replaced inline error */}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm">Campaign Description</Label>
              <Textarea
                {...form.register("description")}
                placeholder="Brief overview of the campaign..."
                className={`w-full bg-white h-32 ${errors.description ? "border-red-500" : ""}`}
              />
              <FormError form={form} name="description" /> {/* ✅ replaced inline error */}
            </div>

            {/* Photo & Goal & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label className="text-sm">Target Amount (MYR)</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  {...form.register("goal_amount", {
                    onChange: (e) => {
                      const val = e.target.value;
                      if (parseFloat(val) <= 0) {
                        form.setValue("goal_amount", "");
                      }
                    }
                  })}
                  min="50"
                  onKeyDown={(e) => {
                    if (["-", "e", "E", "+"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className={`bg-white ${errors.goal_amount ? "border-red-500" : ""}`}
                />
                <FormError form={form} name="goal_amount" /> {/* ✅ replaced inline error */}
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Deadline</Label>
                <Input
                  type="date"
                  {...form.register("end_date")}
                  className={`bg-white ${errors.end_date ? "border-red-500" : ""}`}
                  min={today.toISOString().split("T")[0]}
                />
                <FormError form={form} name="end_date" /> {/* ✅ added error */}
              </div>
            </div>
             <div className="space-y-2">
              <Label className="text-sm">Cover Image</Label>
              <Input type="file" 
              {...form.register("photo")} 
              className="bg-white" 
              accept="image/jpeg,image/png,image/jpg"
              />
              <FormError form={form} name="photo" /> {/* ✅ added error */}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Milestones */}
        <div className="rounded-md border overflow-hidden h-fit">
          <div className="bg-[#193046] p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">🎯 Milestones & Budget</h2>
          </div>
          
          <div className="p-6 bg-gray-50 space-y-6">
            {!goalAmount ? (
              <div className="text-center p-6 border-2 border-dashed rounded-lg bg-gray-100 text-gray-400">
                Please enter a <strong>Target Amount</strong> on the left to unlock the milestone planner.
              </div>
            ) : (
              phases.map((phase, i) => {
                const amount = (goalAmount * (phase.percent / 100)).toLocaleString();
                const isFirst = i === 0;

                return (
                  <div 
                    key={i} 
                    className={`relative p-4 rounded-lg border-l-4 shadow-sm bg-white ${
                      isFirst ? 'border-green-500' : 'border-indigo-500'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs uppercase text-gray-500">{phase.label}</span>
                        <span className={`text-xs ${isFirst ? 'text-green-600' : 'text-gray-500'}`}>
                          {phase.desc}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        isFirst ? 'bg-green-100 text-green-800' : 'bg-indigo-50 text-indigo-800'
                      }`}>
                        Unlocks RM {amount}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Input
                          {...form.register(`milestones.${i}.title`)}
                          placeholder={`e.g. ${isFirst ? 'Procurement' : 'Construction'}`}
                          className="text-sm font-medium"
                        />
                        <FormError form={form} name={`milestones.${i}.title`} /> {/* ✅ replaced inline error */}
                      </div>
                      <div>
                        <Textarea
                          {...form.register(`milestones.${i}.description`)}
                          placeholder="Describe exactly what you will do with this fund tranche..."
                          className="h-16 text-sm resize-none"
                        />
                        <FormError form={form} name={`milestones.${i}.description`} /> {/* ✅ replaced inline error */}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
