import { z } from "zod";

export const campaignSchema = z.object({
  type: z.enum(["disaster", "standard"]),
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(500),
  milestones: z.array(z.string().min(3)).length(3),
  photo: z.any(),
  amount: z.number().min(1),

  background: z.string().min(20).max(500),
  problems: z.array(z.string().min(5)).min(1),
  solutions: z.array(z.string().min(5)).min(1),

  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(10),
  pic1: z.object({
    name: z.string().min(2),
    contact: z.string().min(10),
  }),
  pic2: z.object({
    name: z.string().min(2),
    contact: z.string().min(10),
  }),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;
