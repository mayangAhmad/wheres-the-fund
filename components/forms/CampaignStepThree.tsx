// components/forms/CampaignStepTwo.tsx
"use client"; 

import { UseFormReturn, useFieldArray } from "react-hook-form"; 
import { CampaignFormData } from "@/lib/validation/campaignSchema";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; 

interface CampaignStepTwoProps {
  form: UseFormReturn<CampaignFormData>;
}

export default function CampaignStepThree({ form }: CampaignStepTwoProps) {
  const { control, register } = form;
  
  // 1. Initialize Field Array for Problems (string[])
  const { 
    fields: problemFields, 
    append: appendProblem, 
    remove: removeProblem 
  } = useFieldArray({
    control,
    name: "problems" as const,
  });

  // 2. Initialize Field Array for Solutions (string[])
  const { 
    fields: solutionFields, 
    append: appendSolution, 
    remove: removeSolution 
  } = useFieldArray({
    control,
    name: "solutions" as const,
  });

  return (
    <>
      {/* Outer constraint wrapper */}
      <div className="w-full space-y-8"> 
        <p className="text-muted-foreground">Share the background and challenges.</p>
        <h1 className="form-block-header">What is your story?</h1>
        <hr className="mt-1 border-t border-gray-300" />

        {/* 💡 FIX: Main Flex Container for 2 Columns */}
        <div className="flex flex-col md:flex-row gap-6 w-full">
            
            {/* Column 1 (Left): Background Section */}
            <div className="flex-1 space-y-2"> 
                <Label>Background</Label>
                <Textarea 
                    {...register("background")} 
                    placeholder="Background of the campaign" 
                    className="h-40 resize-none" 
                />
            </div>

            {/* Column 2 (Right): Problems AND Solutions */}
            {/* 💡 FIX: This single flex-1 div now holds the entire second section. */}
            <div className="flex-1 space-y-8"> 
                
                {/* --- Dynamic Problems Section (Stacked Top) --- */}
                <div className="space-y-4">
                    <Label className="block">Problems</Label>
                    
                    {problemFields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2">
                            <Textarea 
                                {...register(`problems.${index}` as const)} 
                                placeholder={`• Problem ${index + 1}`} 
                            />
                            <Button 
                                variant="default" 
                                size="icon-sm"
                                type="button" 
                                onClick={() => removeProblem(index)}
                                className="shrink-0 mt-1"
                            >
                                -
                            </Button>
                        </div>
                    ))}

                    <Button 
                        variant="outline" 
                        type="button" 
                        onClick={() => appendProblem("")} 
                        className="w-full"
                    >
                        + Add Another Problem
                    </Button>
                </div>

                {/* --- Dynamic Solutions Section (Stacked Below Problems) --- */}
                <div className="space-y-4">
                    <Label className="block">Solutions</Label>
                    
                    {solutionFields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2">
                            <Textarea 
                                {...register(`solutions.${index}` as const)} 
                                placeholder={`• Solution ${index + 1}`} 
                            />
                            <Button 
                                variant="default" 
                                size="icon-sm"
                                type="button" 
                                onClick={() => removeSolution(index)}
                                className="shrink-0 mt-1"
                            >
                                -
                            </Button>
                        </div>
                    ))}
                    
                    <Button 
                        variant="outline" 
                        type="button" 
                        onClick={() => appendSolution("")} 
                        className="w-full"
                    >
                        + Add Another Solution
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}