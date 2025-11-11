import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "@/lib/validation/campaignSchema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CampaignStepTwo({ form }: { form: UseFormReturn<CampaignFormData> }) {
  return (
    <>
      <h1 className="text-2xl font-bold">📬 How can donors connect with you?</h1>
      <p className="text-muted-foreground mb-4">Provide contact details and PICs.</p>

      {/* 💡 The parent container is correctly set to grid-cols-1 by default, 
             and grid-cols-3 from the 'md' breakpoint and up. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        
        {/* Column 1: Contact Info */}
        {/* 💡 FIX: Removed min-w-[400px]. The grid handles the width (1/3). */}
        <div className="space-y-8">
              <h2 className="form-block-header">General Contact</h2>
                        <hr className="mt-1 border-t border-gray-300" />

          <div className="space-y-2">
            <Label className="text-sm">Email</Label>
            <Input {...form.register("email")} placeholder="Email" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Telephone Number</Label>
            <Input {...form.register("phone")} placeholder="Telephone Number" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Campaign Address</Label>
            <Textarea {...form.register("address")} placeholder="Physical Address of Campaign" />
          </div>
        </div>

        {/* Column 2: PIC 1 */}
        {/* 💡 FIX: Removed min-w-[400px]. The grid handles the width (1/3). */}
        <div className="space-y-8">
          <h2 className="form-block-header">Person in Charge 1</h2>
                    <hr className="mt-1 border-t border-gray-300" />

          <div className="space-y-2">
            <Label className="text-sm">Name</Label>
            <Input {...form.register("pic1.name")} placeholder="Name" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Contact Number</Label>
            <Input {...form.register("pic1.contact")} placeholder="Contact Number" />
          </div>
        </div>

        {/* Column 3: PIC 2 */}
        {/* 💡 FIX: Removed min-w-[400px]. The grid handles the width (1/3). */}
        <div className="space-y-8">
          <h2 className="form-block-header">Person in Charge 2</h2>
                    <hr className="mt-1 border-t border-gray-300" />

          <div className="space-y-2">
            <Label className="text-sm">Name</Label>
            <Input {...form.register("pic2.name")} placeholder="Name" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Contact Number</Label>
            <Input {...form.register("pic2.contact")} placeholder="Contact Number" />
          </div>
        </div>
      </div>
    </>
  );
}