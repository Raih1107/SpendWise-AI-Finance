import type {
  Account,
  Transaction,
  Budget,
  User,
  AuditLog,
  TransactionType,
  AccountType,
  TransactionStatus,
  RecurringInterval,
  UserRole,
} from "@prisma/client";

// Re-export Prisma enums for convenience
export type {
  TransactionType,
  AccountType,
  TransactionStatus,
  RecurringInterval,
  UserRole,
};

// Re-export Prisma models
export type { Account, Transaction, Budget, User, AuditLog };

// ─── Serialized Types (Decimals → number) ────────────────────────

export interface SerializedAccount {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  _count?: {
    transactions: number;
  };
}

export interface SerializedTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  date: Date;
  category: string;
  receiptUrl: string | null;
  isRecurring: boolean;
  recurringInterval: RecurringInterval | null;
  nextRecurringDate: Date | null;
  lastProcessed: Date | null;
  status: TransactionStatus;
  userId: string;
  accountId: string;
  idempotencyKey: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  account?: SerializedAccount;
}

export interface SerializedBudget {
  id: string;
  amount: number;
  lastAlertSent: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── API Response Types ──────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedAccountResponse extends SerializedAccount {
  transactions: SerializedTransaction[];
  pagination: PaginationMeta;
}

// ─── Category Types ──────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  icon: string;
  subcategories?: string[];
}

// ─── Landing Page Types ──────────────────────────────────────────

export interface StatItem {
  value: string;
  label: string;
}

export interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface HowItWorksItem {
  icon: React.ReactElement;
  title: string;
  description: string;
}

export interface TestimonialItem {
  name: string;
  role: string;
  image: string;
  quote: string;
}

// ─── Email Template Types ────────────────────────────────────────

export interface MonthlyReportData {
  month: string;
  stats: {
    totalIncome: number;
    totalExpenses: number;
    byCategory: Record<string, number>;
  };
  insights: string[];
}

export interface BudgetAlertData {
  percentageUsed: number;
  budgetAmount: number;
  totalExpenses: number;
  accountName?: string;
}

export interface EmailTemplateProps {
  userName: string;
  type: "monthly-report" | "budget-alert";
  data: MonthlyReportData | BudgetAlertData;
}

// ─── Component Prop Types ────────────────────────────────────────

export interface AccountCardProps {
  account: SerializedAccount;
}

export interface BudgetProgressProps {
  initialBudget: SerializedBudget | null;
  currentExpenses: number;
}

export interface DashboardOverviewProps {
  accounts: SerializedAccount[];
  transactions: SerializedTransaction[];
}

export interface TransactionTableProps {
  transactions: SerializedTransaction[];
  pagination: PaginationMeta;
}

export interface AccountChartProps {
  transactions: SerializedTransaction[];
}

export interface AddTransactionFormProps {
  accounts: SerializedAccount[];
  categories: Category[];
  editMode?: boolean;
  initialData?: SerializedTransaction | null;
}

export interface ReceiptScannerProps {
  onScanComplete: (data: ScannedReceiptData) => void;
}

export interface ScannedReceiptData {
  amount: number;
  date: Date;
  description?: string;
  category?: string;
  merchantName?: string;
}

// ─── Inngest Types ───────────────────────────────────────────────

export interface MonthlyStats {
  totalExpenses: number;
  totalIncome: number;
  byCategory: Record<string, number>;
  transactionCount: number;
}
