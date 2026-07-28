import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  date: z.date(),
  category: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account is required"),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional().nullable(),
  idempotencyKey: z.string().optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
