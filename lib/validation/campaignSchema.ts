import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const picSchema = z.object({
  name: z.string().min(2, { message: "Name cannot be empty" }).max(100),
  contact: z
  .string()
  .regex(/^\d+$/, { message: "Phone number must contain only digits." })
  .min(10, { message: "Phone number must be at least 10 digits." }),

});

export const categoryEnum = z.enum([
  "Disaster Relief",
  "Education",
  "Hunger",
  "Medical", 
  "Community"
]);

// Define the shape of a single milestone
const milestoneSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  description: z.string().min(10, "Please provide a brief description of this stage"),
});

export const campaignFormInputSchema = z.object({
  title: z.string().min(5, { message: "Campaign title must be at least 5 characters." }).max(100),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }).max(1000,  { message: "Background cannot exceed 1000 characters." }),
  category: categoryEnum,
  milestones: z.array(milestoneSchema).min(1, "At least one milestone is required"),

  photo: z
    .any()
    .refine((files) => files?.length === 1, "Campaign photo is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "Max file size is 5MB.")
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .png, and .jpeg formats are supported."
    ),

  goal_amount: z.string().min(1, "Target amount is required."),
  end_date: z.string().nonempty("Deadline is required"),

  background: z.string().min(20, { message: "Background must be at least 20 characters." }).max(1000, { message: "Description cannot exceed 1000 characters." }),
  problems: z.array(z.string().min(5, { message: "Problems cannot be empty." })).min(1, { message: "At least one problem is required." }),
  solutions: z.array(z.string().min(5, { message: "Solutions cannot be empty." })).min(1, { message: "At least one solution is required." }),

  contact_email: z.email({message: "Please enter valid email address"}),
  contact_phone: z
  .string()
  .regex(/^\d+$/, { message: "Phone number must contain only digits." })
  .min(10, { message: "Phone number must be at least 10 digits." }),

  campaign_address: z.string().min(10, { message: "Address cannot be empty." }),

  pic1: picSchema,
  pic2: picSchema,
}).superRefine((data, ctx) => {


  const num = Number(data.goal_amount);
  if (isNaN(num) || num <= 0) {
    ctx.addIssue({
      code: "custom",
      message: "Target amount must be a positive number.",
      path: ["goal_amount"],
    });
  }

   const deadline = new Date(data.end_date);
  const today = new Date();
  const minDeadline = new Date(today);
  minDeadline.setDate(today.getDate() + 7);

  if (deadline < minDeadline) {
    ctx.addIssue({
      code: "custom",
      message: "Deadline must be at least 7 days from today.",
      path: ["end_date"],
    });
  }
});

// --- Output schema (parsed values) ---
export const campaignSchema = campaignFormInputSchema.transform((data) => ({
  ...data,
  goal_amount: Number(data.goal_amount),
  end_date: new Date(data.end_date),
}));

export type CampaignFormInput = z.input<typeof campaignFormInputSchema>; // raw
export type CampaignFormData = z.output<typeof campaignSchema>; // parsed
