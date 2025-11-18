// lib/validation/authSchema.ts
import { z } from "zod";

export const ngoSignupSchema = z.object({
  orgName: z.string().min(3, "Organization name is required"),
  ssmNumber: z.string().min(12, "SSM Number must be at least 12 characters"), // Adjust regex as needed
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type NgoSignupFormValues = z.infer<typeof ngoSignupSchema>;