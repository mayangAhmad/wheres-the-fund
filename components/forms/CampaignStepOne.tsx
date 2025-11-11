import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "@/lib/validation/campaignSchema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CampaignStepOne({ form }: { form: UseFormReturn<CampaignFormData> }) {
  
  // 💡 1. Watch the 'type' field to conditionally render components
  const campaignType = form.watch("type");
  const isStandard = campaignType === "standard";
  
  return (
    <>
      <h1 className="text-2xl font-bold">Publish New Campaign</h1>

      <div className="mt-8 flex flex-wrap gap-14 w-full">
        {/* Campaign Details Section */}
        <div className="flex-grow flex-shrink-0 min-w-[400px] max-w-[550px] space-y-8">
          <p className="text-lg font-semibold bg-gray-200 p-8 rounded-md border border-b-2">Campaign&apos;s details</p>
          <hr className="mt-1 border-t border-gray-300" />

          <div className="space-y-2">
            <Label className="text-sm">Type of Campaign</Label>
            <RadioGroup
              // The default value ensures campaignType is defined on load
              defaultValue="standard" 
              onValueChange={(val: "disaster" | "standard") => form.setValue("type", val)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="disaster" />
                <span>Disaster Relief</span>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="standard" />
                <span>Standard</span>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Campaign Title</Label>
            <Input {...form.register("title")} placeholder="e.g., Clean Water for Rural Schools" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Campaign Description</Label>
            <Textarea {...form.register("description")} placeholder="Brief overview of the campaign" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Campaign Photo</Label>
            <Input type="file" {...form.register("photo")} />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Targeted Amount (MYR)</Label>
            <Input type="number" {...form.register("amount")} placeholder="e.g., 5000" />
          </div>
        </div>

        {/* Campaign Milestones Section */}
        <div className="flex-grow flex-shrink-0 min-w-[300px] space-y-8 max-w-[550px]">
          <h2 className="text-lg font-semibold bg-gray-200 p-8 rounded-md border border-b-2">
             Campaign Milestones
          </h2>
          <hr className="mt-1 border-t border-gray-300" />

          {/* 💡 Conditional Rendering for Disaster Relief (1 Milestone) */}
          {!isStandard && (
            <>
              <p className="text-sm text-muted-foreground">Define the primary goal of your relief effort.</p>
              <div className="space-y-2">
                <Label className="text-sm">Goal</Label>
                {/* Always use index 0 for the single goal */}
                <Input {...form.register("milestones.0")} placeholder="Disbursement of aid" />
              </div>
            </>
          )}

          {/* 💡 Conditional Rendering for Standard Campaign (3 Milestones) */}
          {isStandard && (
            <>
              <p className="text-sm text-muted-foreground">Break down your campaign into 3 key goals.</p>

              <div className="space-y-2">
                <Label className="text-sm">Milestone 1</Label>
                <Input {...form.register("milestones.0")} placeholder="Milestone 1 Title" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Milestone 2</Label>
                <Input {...form.register("milestones.1")} placeholder="Milestone 2 Title" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Milestone 3</Label>
                <Input {...form.register("milestones.2")} placeholder="Milestone 3 Title" />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}