import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description required").max(500),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().min(0, "Price must be non-negative"),
});

export const invoiceSchema = z.object({
  clientId: z.string().cuid().optional().nullable(),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  notes: z.string().max(2000).optional(),
  currency: z.string().length(3).default("USD"),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  status: z
    .enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "CANCELLED"])
    .default("DRAFT"),
  isRecurring: z.boolean().default(false),
  recurrence: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one line item required"),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
