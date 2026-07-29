
<div align="center">
  
#  SpendWise

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**A modern, AI-powered personal finance platform built to help you track expenses, manage budgets, and gain actionable insights into your spending habits.**

<img src="./public/Dashboard.png" alt="Dashboard Preview" width="800" />

</div>

---

## ✨ Features

- 🤖 **AI-Powered Receipt Scanning**: Upload receipt images and instantly extract merchant details, amounts, and automatic categorization using **Google Gemini 2.5 Flash-lite**.
- 🔁 **Smart Recurring Transactions**: Setup daily, weekly, monthly, or yearly recurring expenses. Processed seamlessly via **Inngest** background cron jobs.
- 🧠 **Intelligent Financial Insights**: Receive automated, personalized monthly financial reports right to your inbox, with AI-generated spending advice.
- 💸 **Proactive Budget Alerts**: Get notified via email the moment your expenses hit 80% of your predefined budget limits.
- 🛡️ **Enterprise-Grade Integrity**: Built with strict rate-limiting (**Arcjet**), idempotent operations, audit logging, and atomic database transactions (`db.$transaction`) to guarantee financial accuracy.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Core Framework** | Next.js (App Router), React 19, TypeScript |
| **Styling & UI** | Tailwind CSS, Radix UI Primitives, Recharts, Sonner |
| **Database & ORM** | PostgreSQL (Supabase), Prisma ORM |
| **Authentication** | Clerk |
| **Security & Limits**| Arcjet |
| **Background Jobs** | Inngest |
| **AI & ML** | Google Generative AI (Gemini) |
| **Email Delivery** | Resend, React Email |

---

## 🏗️ Architecture & Data Flow

SpendWise embraces a serverless, RPC-style architecture maximizing performance and security:

1. **Server Actions (`actions/`)**: Replaces traditional REST APIs. Handles everything from receipt parsing to atomic transaction creation.
2. **Event-Driven Workflows**: Heavy lifting (monthly reporting, recurring logic) is offloaded to **Inngest** using a fan-out webhook model, keeping the main thread blazingly fast.
3. **Data Integrity First**: Every financial mutation utilizes Prisma transaction blocks to simultaneously update account balances and log operations to an `AuditLog` table, preventing race conditions.

---

<details>
<summary><h2>⚙️ Installation & Setup</h2></summary>

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/spendwise.git
cd spendwise
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Duplicate `.env.example` to `.env` (or create one) and fill in your keys:

```env
# Database (Supabase)
DATABASE_URL="postgresql://[user]:[password]@[host]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://[user]:[password]@[host]:5432/postgres"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI & APIs
GEMINI_API_KEY=AIzaSy...
RESEND_API_KEY=re_...
ARCJET_KEY=ajkey_...
```

### 4. Database Setup
Push the Prisma schema to your database:
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Application
```bash
npm run dev
```
Your application will be available at `http://localhost:3000`.

### 6. Run Inngest Dev Server (For Background Jobs)
In a separate terminal, start the Inngest development server:
```bash
npx inngest-cli@latest dev
```
</details>

<details>
<summary><h2>🗂️ Folder Structure</h2></summary>

```text
spendAI/
├── actions/         # Server Actions (Mutations & Data Fetching)
├── app/             
│   ├── (auth)/      # Clerk Authentication Routes
│   ├── (main)/      # Dashboard, Accounts, and Transaction Pages
│   └── api/         # Inngest webhooks & seed routes
├── components/      # Modular UI components (Radix + Tailwind)
├── emails/          # React Email Templates
├── lib/             # Utils, DB instances, Inngest configs, Zod schemas
└── prisma/          # Database schemas and migrations
```
</details>

---

