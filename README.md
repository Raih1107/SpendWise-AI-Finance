# SpendWise

A personal finance app I built to actually understand how server-first Next.js apps are put together in production — accounts, transactions, budgets, recurring payments, and an AI layer on top, instead of another CRUD-with-a-database-attached tutorial project.

Live logic runs almost entirely through **Server Actions**. Prisma talks to Postgres. Inngest owns everything that has to happen without a user in the loop — recurring transactions, budget alerts, monthly reports. Gemini reads receipts and writes the monthly insight text.

**Stack:** Next.js 16 (App Router) · TypeScript · PostgreSQL + Prisma · Clerk · Inngest · Gemini · Arcjet · Resend

![Landing page](public/LandingPage.png)
*Landing page — nothing unusual here, but note the copy is honest about what the app does rather than generic marketing filler. "Get Started" goes straight into Clerk auth, no gated waitlist.*

---

## What it does

- Multiple accounts per user (current/savings), each with its own balance and currency, one flagged default
- Transactions with categories, receipts, and soft deletes — nothing is hard-deleted, `deletedAt` gates every query
- Recurring transactions (daily/weekly/monthly/yearly) that regenerate themselves via a scheduled job, not a client-side timer
- One monthly budget per user, with email alerts once spend crosses 80%
- Receipt scanning: upload a photo, Gemini extracts amount, date, merchant, and a suggested category, pre-fills the transaction form
- Monthly financial reports — Gemini looks at the month's income/expense/category breakdown and writes three plain-language insights, emailed out on the 1st
- Idempotency keys on transaction creation so a retried form submission can't double-charge an account
- Audit log on every account/transaction/budget mutation

![Sign in](public/AuthPage.png)
*Auth is fully delegated to Clerk — no custom password handling, session logic, or "forgot password" flow written by hand. Google OAuth and email/password both go through the same hosted component. That "Development mode" banner is Clerk's own — it disappears once real API keys are set in production.*

## Dashboard

![Dashboard](public/Dashboard.png)
*Budget progress bar, recent transactions, and a category breakdown all pull from the same `getCurrentBudget` and `getDashboardData` server actions — no client-side fetch waterfall. The transaction list here is real seeded data, not placeholder rows.*

![Analytics](public/Analytics.png)
*Per-account view with an income/expense chart built on Recharts. The numbers above the chart (Total Income, Total Expenses, Net) are computed server-side from the same `Transaction` rows the chart renders, not two separate sources of truth.*

## Adding a transaction

![Add transaction](public/AddTransaction.png)
*The "Scan Receipt with AI" button is the actual Gemini vision integration described below, not a decorative label — it calls `scanReceipt()`, which sends the image to Gemini and pre-fills amount, category, and description. The recurring-transaction toggle at the bottom is what feeds the Inngest scheduler.*

![Transaction log](public/TransactionLogs.png)
*Full transaction table with search, type/category filters, and pagination — backed by `getAccountWithTransactions`, which does the pagination math (`skip`/`take`) in the query itself rather than fetching everything and slicing client-side. Recurring entries are visibly tagged.*

## Why it's built this way

**Server Actions instead of a REST layer.** Every mutation (`createTransaction`, `updateBudget`, `bulkDeleteTransactions`, etc.) lives in `actions/` and is called directly from Server Components and forms. There's no separate API surface to keep in sync with the frontend, and Zod validation runs in the same function that touches the database. The only two real API routes are `/api/inngest`, which exists because Inngest needs an HTTP endpoint to invoke functions, and `/api/seed`, a dev-only route for seeding demo transactions.

**Inngest instead of cron-on-a-server.** Four functions handle everything that shouldn't block a request:

| Function | Trigger | Job |
|---|---|---|
| `triggerRecurringTransactions` | daily cron | Finds transactions due today, fans out one event per transaction |
| `processRecurringTransaction` | event, throttled 10/min per user | Creates the new transaction, updates the account balance, advances `nextRecurringDate` |
| `checkBudgetAlerts` | every 6 hours | Sums this month's expenses against the user's budget, emails a warning past 80%, gated by `lastAlertSent` so it doesn't spam |
| `generateMonthlyReports` | 1st of the month | Pulls last month's stats per user, asks Gemini for three insights, sends the report by email |

Splitting the recurring-transaction trigger from the processor (rather than one function doing both) means a spike in due transactions fans out into individually throttled, retryable events instead of one function looping over everything and failing as a unit.

**Two layers of Arcjet, not one.** `proxy.ts` (Next 16's replacement for `middleware.ts`) runs Shield and bot detection on every request before Clerk even checks the session. Separately, `lib/arcjet.ts` applies a token-bucket rate limit (10/hour, keyed on Clerk user ID) inside the account- and transaction-creation server actions themselves. Edge-level protection catches obvious abuse early; the per-action limiter catches a legitimate, authenticated user hammering a specific mutation.

**Soft deletes everywhere.** `withActive()` in `lib/db-utils.ts` wraps every read query with `deletedAt: null`. Deleting a transaction or account just stamps a timestamp — balances get recalculated from the still-present row, and nothing in the audit trail goes missing.

## AI features

Two separate Gemini integrations, doing different jobs:

![AI insights card](public/AIInsight1.png)
*Rendered inside the app — three insights generated from that month's actual income/expense/category totals passed into the prompt, not a canned response. If Gemini's output fails to parse as JSON, `generateFinancialInsights` falls back to three generic but still useful lines rather than crashing the email job — a small detail, but it's the difference between "handled a failure mode" and "hoped it wouldn't happen."*

![Monthly report email](public/AIInsight2.png)
*The other end of the same pipeline — this is a real email sent through Resend by the `generateMonthlyReports` Inngest function, not a static mockup. The numbers in the email match what the dashboard shows for the same month.*

## Architecture

```
Browser
  │
  ▼
proxy.ts  →  Arcjet Shield + bot detection  →  Clerk session check
  │
  ▼
Next.js App Router  (Server Components + Server Actions)
  │
  ├─→ actions/*.ts  →  Zod validation  →  Arcjet rate limit  →  Prisma  →  PostgreSQL
  │
  ├─→ scanReceipt()  →  Gemini (vision)  →  pre-fills transaction form
  │
  └─→ /api/inngest  →  4 background functions  →  PostgreSQL
                          │
                          ├─ recurring transaction engine
                          ├─ budget alert checker (Resend)
                          └─ monthly report generator  →  Gemini  →  Resend
```

## Data model

Five Prisma models: `User`, `Account`, `Transaction`, `Budget`, `AuditLog`.

There's no separate table for recurring transactions — a `Transaction` just carries `isRecurring`, `recurringInterval`, `nextRecurringDate`, and `lastProcessed`, and the Inngest scheduler reads those fields directly. `Budget` is one-per-user (`userId` is `@unique`) and tracks `lastAlertSent` so the alert job knows whether it's already warned someone this month. `Transaction.idempotencyKey` is unique and optional — set it and a duplicate submission returns the original record instead of creating a second one.

## Project structure

```
app/
├─ (auth)/                    sign-in, sign-up — Clerk
├─ (main)/
│  ├─ dashboard/              accounts overview, budget progress, spend chart
│  ├─ account/[id]/           per-account transaction table, pagination
│  └─ transaction/
│     ├─ create/               transaction form + receipt scanner
│     └─ [id]/                 edit
└─ api/
   ├─ inngest/                 Inngest function handler
   └─ seed/                    dev-only demo data seeding

actions/                      Server Actions — this is where the logic lives
├─ account.ts                 account queries, bulk delete, default-account switching
├─ transaction.ts             create/update/list transactions, receipt scanning
├─ dashboard.ts                account creation, dashboard data fetch
├─ budget.ts                  budget CRUD + current-month spend calculation
└─ seed.ts

lib/
├─ prisma.ts                  Prisma client singleton
├─ arcjet.ts                  token-bucket rate limiter for server actions
├─ db-utils.ts                withActive() — soft-delete query helper
├─ checkUser.ts               syncs a Clerk session to a User row on first login
└─ inngest/
   ├─ client.ts
   └─ function.ts             all 4 background jobs

prisma/
├─ schema.prisma
└─ migrations/

emails/                       React Email templates (budget alert, monthly report)
components/                   dashboard widgets, forms, shadcn/ui primitives
proxy.ts                      Arcjet + Clerk middleware (Next 16 naming)
```

## Running it locally

```bash
git clone https://github.com/Raih1107/SpendWise-AI-Finance.git
cd SpendWise-AI-Finance
npm install
npx prisma migrate dev
npm run dev
```

Background jobs won't fire without the Inngest dev server running alongside it:

```bash
npx inngest-cli@latest dev
```

### Environment variables

```env
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

GEMINI_API_KEY=

ARCJET_KEY=

INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

RESEND_API_KEY=
```

`DIRECT_URL` is required alongside `DATABASE_URL` if you're on Neon or Supabase's pooled connection — Prisma migrations need the direct (unpooled) connection string.

## Deploying

Runs on Vercel.

1. Set every variable above in the project's environment settings
2. `DATABASE_URL` / `DIRECT_URL` should point at a pooled Postgres instance (Neon or Supabase both work)
3. Register the deployed `/api/inngest` URL with Inngest Cloud — without this, none of the four scheduled jobs run in production
4. Run `npx prisma migrate deploy` against the production database before the first deploy

```bash
vercel
```

## Known gaps / what I'd do next

- `eslint-config-next` is still pinned at 15.0.3 while the app runs Next 16 — needs bumping
- No test suite yet
- Multi-currency is stored (`Account.currency`) but never converted — a USD and INR account just show raw numbers side by side
- Bank account integration (Plaid/Setu) would remove manual entry entirely
- CSV/PDF export of transaction history

## License

MIT
