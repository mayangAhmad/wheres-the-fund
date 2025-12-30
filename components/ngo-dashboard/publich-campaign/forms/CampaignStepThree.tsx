"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { CampaignFormInput } from "@/lib/validation/campaignSchema";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import FormError from "./FormError";

interface CampaignStepThreeProps {
  form: UseFormReturn<CampaignFormInput>;
}

export default function CampaignStepThree({ form }: CampaignStepThreeProps) {
  const { control, register } = form;

  const {
    fields: problemFields,
    append: appendProblem,
    remove: removeProblem,
  } = useFieldArray({
    control,
    name: "problems",
  });

  const {
    fields: solutionFields,
    append: appendSolution,
    remove: removeSolution,
  } = useFieldArray({
    control,
    name: "solutions",
  });

  return (
    <>
      <h1 className="text-2xl font-bold max-w-6xl mx-auto">
        📢 Tell us more about your campaign
      </h1>
      <p className="text-muted-foreground mb-4 max-w-6xl mx-auto">
        This section is important for public to know what exactly you are tackling on and how you will execute them.
      </p>

      <div className="mt-8 grid gap-10 w-full max-w-6xl mx-auto grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
        
        {/* Background Container */}
        <div className="rounded-md border min-h-[250px] md:min-h-[300px] lg:min-h-[450px] overflow-hidden">
          <div className="bg-[#193046] p-4">
            <h2 className="text-lg font-semibold text-white">📖 What is your story?</h2>
          </div>
          <div className="p-6 space-y-4 bg-gray-50">
            <Label>Background</Label>
            <Textarea
              {...form.register("background")}
              placeholder="Background of the campaign"
              maxLength={1000}
              className="w-full bg-white wrap-break-word whitespace-pre-wrap h-24 md:h-32 lg:h-40"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{(form.watch("background") || "").length} / 1000 characters</span>
              <span>{1000 - (form.watch("background") || "").length} left</span>
            </div>
            {/* ✅ Use FormError instead of inline error */}
            <FormError form={form} name="background" />
          </div>
        </div>

        {/* Problems Container */}
        <div className="rounded-md border min-h-[250px] md:min-h-[300px] lg:min-h-[450px] overflow-hidden">
          <div className="bg-[#193046] p-4">
            <h2 className="text-lg font-semibold text-white">⚠️ Problems</h2>
          </div>
          <div className="p-6 space-y-4 bg-gray-50">
            {problemFields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-1 w-full">
                <div className="flex items-start gap-2 w-full">
                  <Textarea
                    {...register(`problems.${index}` as const)}
                    placeholder={`• Problem ${index + 1}`}
                    className="w-full bg-white wrap-break-word whitespace-pre-wrap h-20 md:h-28 lg:h-32"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    type="button"
                    onClick={() => removeProblem(index)}
                    className="shrink-0 mt-1"
                  >
                    -
                  </Button>
                </div>
                {/* ✅ Use FormError for each problem */}
                <FormError form={form} name={`problems.${index}`} />
              </div>
            ))}
            <Button
              variant="outline"
              type="button"
              onClick={() => appendProblem("")}
              className="w-full"
            >
              + Add Problem
            </Button>
          </div>
        </div>

        {/* Solutions Container */}
        <div className="rounded-md border min-h-[250px] md:min-h-[300px] lg:min-h-[450px] overflow-hidden">
          <div className="bg-[#193046] p-4">
            <h2 className="text-lg font-semibold text-white">💡 Solutions</h2>
          </div>
          <div className="p-6 space-y-4 bg-gray-50">
            {solutionFields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-1 w-full">
                <div className="flex items-start gap-2 w-full">
                  <Textarea
                    {...register(`solutions.${index}` as const)}
                    placeholder={`• Solution ${index + 1}`}
                    className="w-full bg-white wrap-break-word whitespace-pre-wrap h-20 md:h-28 lg:h-32"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    type="button"
                    onClick={() => removeSolution(index)}
                    className="shrink-0 mt-1"
                  >
                    -
                  </Button>
                </div>
                {/* ✅ Use FormError for each solution */}
                <FormError form={form} name={`solutions.${index}`} />
              </div>
            ))}
            <Button
              variant="outline"
              type="button"
              onClick={() => appendSolution("")}
              className="w-full"
            >
              + Add Solution
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
