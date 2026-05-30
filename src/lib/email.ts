import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const from = process.env.RESEND_FROM_EMAIL ?? "FlowLedger <noreply@flowledger.app>";

export async function sendInvoiceReminderEmail(params: {
  to: string;
  userName: string;
  invoiceNumber: string;
  amount: string;
  clientName?: string | null;
}) {
  if (!resend) return;

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Reminder: Invoice ${params.invoiceNumber} is overdue`,
    html: `
      <p>Hi ${params.userName},</p>
      <p>Invoice <strong>${params.invoiceNumber}</strong> for $${params.amount} is overdue${
        params.clientName ? ` from ${params.clientName}` : ""
      }.</p>
      <p>Log in to FlowLedger to follow up or mark as paid.</p>
    `,
  });
}

export async function sendWeeklyReportEmail(params: {
  to: string;
  userName: string;
  revenue: string;
  expenses: string;
}) {
  if (!resend) return;

  await resend.emails.send({
    from,
    to: params.to,
    subject: "Your weekly FlowLedger financial report",
    html: `
      <p>Hi ${params.userName},</p>
      <p>Here's your weekly snapshot:</p>
      <ul>
        <li>Revenue collected: $${params.revenue}</li>
        <li>Expenses: $${params.expenses}</li>
      </ul>
      <p>View your full dashboard at FlowLedger.</p>
    `,
  });
}

export async function sendInvoiceEmail(params: {
  to: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
}) {
  if (!resend) return;

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Invoice ${params.invoiceNumber} from FlowLedger`,
    html: `
      <p>You have received invoice <strong>${params.invoiceNumber}</strong>.</p>
      <p>Amount due: $${params.amount}</p>
      <p>Due date: ${params.dueDate}</p>
    `,
  });
}
