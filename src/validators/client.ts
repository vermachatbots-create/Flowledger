import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  company: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
