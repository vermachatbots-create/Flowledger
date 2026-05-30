import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  sendInvoiceReminder,
  processRecurringInvoices,
  generateWeeklyReport,
} from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendInvoiceReminder, processRecurringInvoices, generateWeeklyReport],
});
