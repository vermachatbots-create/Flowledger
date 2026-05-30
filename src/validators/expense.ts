import { z } from "zod";

export const expenseSchema = z.object({
  category: z.enum([
    "SOFTWARE",
    "MARKETING",
    "TRAVEL",
    "OFFICE",
    "CONTRACTORS",
    "UTILITIES",
    "INSURANCE",
    "TAXES",
    "OTHER",
  ]),
  description: z.string().min(1).max(500),
  amount: z.coerce.number().positive("Amount must be positive"),
  vendor: z.string().max(200).optional(),
  date: z.coerce.date(),
  isRecurring: z.boolean().default(false),
  recurrence: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
