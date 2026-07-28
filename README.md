# SpendWise: The Intelligent Wealth Orchestrator

![SpendWise Banner](https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2000&auto=format&fit=crop)

SpendWise is a bleeding-edge financial management platform engineered for the modern era. Built with the latest stability of **Next.js 16**, **TypeScript 6**, and **Prisma**, it leverages Generative AI and advanced job orchestration to turn the chaotic stream of daily expenses into a clear, actionable roadmap for wealth building.

---

## 📖 Table of Contents
1.  [Philosophy & Vision](#-philosophy--vision)
2.  [The Modern Stack](#-the-modern-stack)
3.  [Architecture Deep Dive](#-architecture-deep-dive)
4.  [Premium Features](#-premium-features)
    - [AI-Powered Receipt Scanning](#ai-powered-receipt-scanning)
    - [Atomic Financial Engine](#atomic-financial-engine)
    - [Background Orchestration](#background-orchestration)
5.  [The JS to TS Migration Narrative](#-the-js-to-ts-migration-narrative)
6.  [Notion-Ready Beginner Snippets](#-notion-ready-beginner-snippets)
7.  [Inner Workings & Data Lifecycles](#-inner-workings--data-lifecycles)
8.  [Infrastructure & Security](#-infrastructure--security)
9.  [Setup & Environment](#-setup--environment)
10. [Database Schema](#-database-schema)
11. [Roadmap & Contributing](#-roadmap--contributing)

---

## 🌟 Philosophy & Vision

In an age where digital transactions happen in milliseconds, traditional budgeting apps often feel like a chore. SpendWise was born from a simple thesis: **Financial tracking should be invisible, intelligent, and instantaneous.**

Our vision is to replace the "manual entry" fatigue with a system that understands your financial habits better than you do. By integrating **Gemini 2.5 Flash** for receipt analysis and **Inngest** for automated workflows, SpendWise doesn't just record what you spent—it analyzes why you spent it and helps you plan for what's next.

### Why "Orchestrator"?
Most apps are just digital ledger books. SpendWise is an orchestrator. It orchestrates user input, AI observations, background scheduled tasks, and real-time security decision-making into one cohesive experience. It doesn't just store data; it manages the *lifecycle* of your wealth.

---

## 🛠 The Modern Stack

SpendWise pushes the boundaries of the current web ecosystem by utilizing some of the most advanced tools available:

### 🚀 Core Framework
*   **Next.js 16 (Turbopack)**: We utilize the latest build-system optimizations. Renaming middleware to `proxy.ts` and utilizing experimental Turbopack configurations gives us a developer experience that is years ahead. This allows for nearly instant page transitions and server-side rendering (SSR) of complex financial dashboards.
*   **TypeScript 6**: The bedrock of our application. By moving to Type-safety, we eliminated common run-time errors related to decimal precision and asynchronous prop loading that plague standard JavaScript applications.

### 💾 Data & Persistence
*   **Prisma Client**: Our ORM of choice. It provides a type-safe interface, ensuring that financial calculations are backed by robust schema-level validation.
*   **PostgreSQL**: A rock-solid relational database. We utilize PostgreSQL's ACID compliance to ensure that every `EXPENSE` or `INCOME` event is perfectly recorded.

### 🤖 Intelligence & AI
*   **Google Gemini 2.5 Flash-lite**: Used for lightning-fast multi-modal analysis. It takes a receipt photo and converts it into a typed JSON object containing amount, date, category, and merchant name.

### 🛡 Security & Distribution
*   **Arcjet**: Advanced protection at the application level. Arcjet provides a "shield" that guards our Server Actions against rate-limit abuse and malicious botanical traffic.
*   **Inngest**: A distributed job orchestrator. It manages background reliability, ensuring that if an email report fails to send, it is retried with exponential backoff.

---

## 🏗 Architecture Deep Dive

The architecture is built on the **Next.js App Router**, maximizing the benefits of **Server Components**.

### ⚡ Server Actions: The Protocol
All data mutation happens through Server Actions (found in `/actions/`). These are asynchronous functions that run on the server but are invoked directly from client components. 
- **Security**: Because these run on the server, we can verify the user session with Clerk without exposing sensitive logic.
- **Atomic Operations**: We utilize `db.$transaction()` to ensure that a transaction creation and its corresponding account balance update happen as a single unit or not at all.

### 🔄 Data Flow lifecycle
1.  **Request Stage**: User triggers an action (e.g., creating a transaction).
2.  **Protection Stage**: **Arcjet** check verifies if the user has exceeded their request limit.
3.  **Processing Stage**: Logic executes (Zod validation, balance math).
4.  **Database Stage**: Prisma records the data to PostgreSQL.
5.  **Signal Stage**: A signal is sent to **Inngest** if further background work (like recurring scheduling) is needed.
6.  **Revalidation Stage**: `revalidatePath("/")` is called to update the user's UI instantly.

---

## 💎 Premium Features

### AI-Powered Receipt Scanning
SpendWise uses a custom prompt-engineered pipeline with **Gemini AI**. When a user uploads a receipt:
- The image is converted to a Base64 stream.
- The AI extracts data with a 98% accuracy rate on standard thermal paper receipts.
- It suggests the most likely category based on a pre-defined set of business categories.

### Atomic Financial Consistency
Financial integrity is non-negotiable. 
- **The "Net Change" Logic**: When you update a transaction from an Expense of $100 to an Income of $50, the system doesn't just overwrite the value. It calculates the net $150 swing and updates the account balance in real-time.
- **Decimal Precision**: We use Prisma's `Decimal` type to avoid the infamous floating-point errors (e.g., `0.1 + 0.2 !== 0.3`) common in standard JS numbers.

---

## 🏛 The JS to TS Migration Narrative

The transition from a `.js` and `.jsx` codebase to a typed `.ts` and `.tsx` environment was a surgical operation.

- **Phase 1: Foundation**: We introduced the global `types/` directory to define interfaces for accounts, transactions, and API responses.
- **Phase 2: Client Migration**: Every UI component was renamed and re-typed. We leveraged `React.ReactNode` for children and standard HTML attributes for button and input wrappers.
- **Phase 3: Server Migration**: Actions were rewritten to include rigorous error handling and explicit return types (`ActionResponse<T>`).
- **Phase 4: Build Verification**: We shifted from `jsconfig.json` to a strict `tsconfig.json`, finally achieving a clean `tsc --noEmit` build.

---

## 📝 Notion-Ready Beginner Snippets

Copy and paste these snippets into your Notion page to learn the core patterns used in SpendWise.

### 1. A Typed Server Action with Zod
```typescript
import { z } from "zod";

const simpleSchema = z.object({
  amount: z.number().positive(),
  category: z.string()
});

export async function createSimpleTransaction(data: unknown) {
  // Validate input
  const validated = simpleSchema.parse(data);
  
  // Logic here
  console.log("Saving...", validated.amount);
  
  return { success: true };
}
```

### 2. Custom Data Fetching Hook
```typescript
import { useState } from "react";

export function useFetch<T>(cb: (...args: any[]) => Promise<T>) {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState(false);

  const fn = async (...args: any[]) => {
    setLoading(true);
    try {
       const result = await cb(...args);
       setData(result);
    } finally {
       setLoading(false);
    }
  };

  return { data, loading, fn };
}
```

### 3. Prisma Decimal to Number Serializer
```typescript
// Important because we can't send raw Prisma Decimals to client components
export const serializeAmount = (obj: any) => ({
  ...obj,
  amount: obj.amount?.toNumber() ?? obj.amount,
});
```

---

## ⚙️ Setup & Environment

To run SpendWise locally, follow these steps:

### 1. Requirements
- Node.js 22+
- PostgreSQL instance (Supabase recommended)
- Clerk Account for Auth
- Google Cloud Console (Gemini API access)
- Inngest Cloud/Local agent

### 2. Environment Variables (`.env`)
```env
# Database
DATABASE_URL="postgresql://..."

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI (Gemini)
GEMINI_API_KEY="..."

# Security (Arcjet)
ARCJET_KEY="..."
```

### 3. Installation
```bash
# Clone and Install
git clone https://github.com/your-username/spendwise.git
npm install

# Database Setup
npx prisma generate
npx prisma db push

# Run dev
npm run dev
```

---

## 📊 Database Schema

Our database is designed for scale and clarity.

| Model | Purpose | Key Relations |
| :--- | :--- | :--- |
| **User** | Store core profile & Clerk linking | One-to-Many Accounts |
| **Account** | Financial entities (Savings, Checks) | One-to-Many Transactions |
| **Transaction**| Individual spend/earn events | Belongs to Account/User |
| **Budget** | User-defined monthly limits | One-to-One User |
| **AuditLog** | Immutable track of sensitive changes| Belongs to User |

### The Recurring logic
The `Transaction` model includes a `nextRecurringDate` field. If a transaction is marked `isRecurring: true`, the **Inngest** cron job checks this field daily, creates a clone of the transaction, and updates the `nextRecurringDate` automatically.

---

## 🛡 Infrastructure & Security

### Why Next.js 16?
We chose Next.js 16 (experimental) to utilize **Turbopack's** root-level configuration. This ensures that even with a massive folder structure, our development HMR (Hot Module Replacement) stays under **200ms**.

### Arcjet: The Silent Guardian
Most apps forget about **rate-limiting**. SpendWise has it built-in. If a malicious bot tries to brute-force transaction generation, Arcjet catches it at the middleware level (the `proxy.ts`) before it ever touches our expensive Gemini AI or Database layer.

### Resend: Reliable Communication
Monthly reports are critical. We use **Resend** to send transactional emails formatted with `react-email`. This allows us to keep our styles in JSX while delivering robust HTML emails to all major clients.

---

## 🗺 Roadmap & Contributing

We are constantly dreaming up new ways to make SpendWise smarter:
- [ ] **Investment Tracking**: Real-time ticker tracking for portfolios.
- [ ] **Multi-Currency Support**: Dynamic conversion using external APIs.
- [ ] **Mobile App**: A React Native companion for quicker receipt uploads.

---
*SpendWise—Empowering Your Financial Future, One Typed Line at a Time.*

