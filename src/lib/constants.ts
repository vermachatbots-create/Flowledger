import { SubscriptionTier } from "@prisma/client";

export const APP_NAME = "FlowLedger";

export const PLANS = {
  FREE: {
    tier: SubscriptionTier.FREE,
    name: "Free",
    price: 0,
    limits: {
      invoices: 5,
      clients: 3,
      expenses: 20,
      aiInsights: 3,
    },
  },
  PRO: {
    tier: SubscriptionTier.PRO,
    name: "Pro",
    price: 29,
    limits: {
      invoices: 100,
      clients: 50,
      expenses: 500,
      aiInsights: 50,
    },
  },
  TEAM: {
    tier: SubscriptionTier.TEAM,
    name: "Team",
    price: 79,
    limits: {
      invoices: -1,
      clients: -1,
      expenses: -1,
      aiInsights: -1,
    },
  },
} as const;

export const EXPENSE_CATEGORIES = [
  { value: "SOFTWARE", label: "Software" },
  { value: "MARKETING", label: "Marketing" },
  { value: "TRAVEL", label: "Travel" },
  { value: "OFFICE", label: "Office" },
  { value: "CONTRACTORS", label: "Contractors" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "TAXES", label: "Taxes" },
  { value: "OTHER", label: "Other" },
] as const;

export const INVOICE_STATUSES = [
  { value: "DRAFT", label: "Draft", color: "bg-muted" },
  { value: "SENT", label: "Sent", color: "bg-blue-500/20 text-blue-400" },
  { value: "VIEWED", label: "Viewed", color: "bg-purple-500/20 text-purple-400" },
  { value: "PAID", label: "Paid", color: "bg-emerald-500/20 text-emerald-400" },
  { value: "OVERDUE", label: "Overdue", color: "bg-red-500/20 text-red-400" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-muted" },
] as const;
