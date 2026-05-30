# FlowLedger

AI-powered invoice and cash flow management for freelancers, creators, agencies, and SMBs.

## Features

- **Smart Invoicing** — Create, duplicate, mark paid, recurring invoices
- **Client Management** — Profiles with invoice history and payment tracking
- **Expense Tracking** — Categorized expenses with recurring support
- **Cash Flow Dashboard** — KPIs, Recharts analytics, health score
- **AI CFO Insights** — GPT-4.1-mini powered financial analysis
- **Stripe Billing** — Free / Pro / Team tiers with webhooks and portal
- **Background Jobs** — Inngest for reminders, recurring invoices, weekly reports
- **Email** — Resend for invoice reminders and reports

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui, Framer Motion, Recharts |
| Backend | Server Actions, Prisma, PostgreSQL |
| Auth | Auth.js (Google OAuth + credentials) |
| AI | OpenAI SDK (gpt-4.1-mini) |
| Payments | Stripe Subscriptions |
| Jobs | Inngest |
| Email | Resend |
| Cache / Rate limit | Upstash Redis |

## Getting Started

### 1. Clone and install

```bash
cd flowledger
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — Neon or Supabase PostgreSQL
- `AUTH_SECRET` — `openssl rand -base64 32`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
- `OPENAI_API_KEY`
- `STRIPE_*` keys and price IDs
- `UPSTASH_REDIS_*` (optional, disables rate limiting if omitted)
- `RESEND_API_KEY` (optional)
- `INNGEST_*` (for background jobs)

### 3. Database

```bash
npx prisma db push
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Stripe webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Inngest dev server

```bash
npx inngest-cli@latest dev
```

## Project Structure

```
src/
├── app/           # Routes (App Router)
├── actions/       # Server actions
├── components/    # UI components
├── lib/           # Auth, DB, Stripe, OpenAI, Inngest
├── server/        # Auth helpers, guards
├── services/      # Analytics, AI insights
├── validators/    # Zod schemas
├── types/         # TypeScript extensions
└── styles/        # Global CSS
prisma/
└── schema.prisma
```

## Security

- Multi-tenant data isolation via `userId` on every query
- `assertResourceOwnership` on all mutations
- Zod validation on server actions
- Upstash rate limiting on auth and AI endpoints
- Stripe webhook signature verification

## Deployment

Deploy to Vercel with Neon PostgreSQL. Set all environment variables in the Vercel dashboard.

## License

MIT
