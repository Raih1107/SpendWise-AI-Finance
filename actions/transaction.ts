"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { transactionSchema } from "@/lib/schema";
import logger from "@/lib/logger";
import { withActive } from "@/lib/db-utils";
import type { Prisma } from "@prisma/client";
import type { SerializedTransaction, ActionResponse, ScannedReceiptData } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface DecimalObj {
  amount?: Prisma.Decimal | number;
  [key: string]: unknown;
}

const serializeAmount = <T extends DecimalObj>(obj: T): T => ({
  ...obj,
  amount: obj.amount && typeof obj.amount === "object" && "toNumber" in obj.amount
    ? (obj.amount as Prisma.Decimal).toNumber()
    : obj.amount,
});

// Create Transaction
export async function createTransaction(
  data: Record<string, unknown>
): Promise<ActionResponse<SerializedTransaction>> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        logger.error("RATE_LIMIT_EXCEEDED", null, {
          userId,
          remaining,
          reset,
        });
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked");
    }

    // Input Validation
    const validatedData = transactionSchema.parse(data);

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Idempotency Check
    if (validatedData.idempotencyKey) {
      const existingTransaction = await db.transaction.findUnique({
        where: { idempotencyKey: validatedData.idempotencyKey },
      });

      if (existingTransaction) {
        logger.info("IDEMPOTENT_REQUEST_HIT", {
          idempotencyKey: validatedData.idempotencyKey,
          userId,
        });
        return { success: true, data: serializeAmount(existingTransaction) as unknown as SerializedTransaction };
      }
    }

    const account = await db.account.findUnique({
      where: {
        id: validatedData.accountId,
        userId: user.id,
      },
    });

    if (!account) throw new Error("Account not found");

    // Calculate new balance
    const balanceChange =
      validatedData.type === "EXPENSE"
        ? -validatedData.amount
        : validatedData.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // Execute atomic transaction
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...validatedData,
          userId: user.id,
          status: "COMPLETED",
          nextRecurringDate:
            validatedData.isRecurring && validatedData.recurringInterval
              ? calculateNextRecurringDate(
                  validatedData.date,
                  validatedData.recurringInterval
                )
              : null,
        },
      });

      await tx.account.update({
        where: { id: validatedData.accountId },
        data: { balance: newBalance },
      });

      // Audit Logging
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CREATE_TRANSACTION",
          metadata: {
            transactionId: newTransaction.id,
            accountId: validatedData.accountId,
            amount: validatedData.amount,
            type: validatedData.type,
          },
        },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) as unknown as SerializedTransaction };
  } catch (error) {
    logger.error("CREATE_TRANSACTION_FAILED", error, { data });
    throw new Error((error as Error).message);
  }
}

export async function getTransaction(id: string): Promise<SerializedTransaction> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction) as unknown as SerializedTransaction;
}

export async function updateTransaction(
  id: string,
  data: Record<string, unknown>
): Promise<ActionResponse<SerializedTransaction>> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      (data.type as string) === "EXPENSE" ? -(data.amount as number) : (data.amount as number);

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...(data as Prisma.TransactionUpdateInput),
          nextRecurringDate:
            (data.isRecurring as boolean) && (data.recurringInterval as string)
              ? calculateNextRecurringDate(data.date as Date, data.recurringInterval as string)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId as string },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      // Audit Logging
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "UPDATE_TRANSACTION",
          metadata: {
            transactionId: updated.id,
            accountId: data.accountId as string,
            netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) as unknown as SerializedTransaction };
  } catch (error) {
    logger.error("UPDATE_TRANSACTION_FAILED", error, { id, data });
    throw new Error((error as Error).message);
  }
}

// Get User Transactions
export async function getUserTransactions(
  query: Record<string, unknown> = {}
): Promise<ActionResponse<SerializedTransaction[]>> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: withActive({
        userId: user.id,
        ...query,
      }),
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions as unknown as SerializedTransaction[] };
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

// Scan Receipt
export async function scanReceipt(file: File): Promise<ScannedReceiptData> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt");
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate: Date, interval: string): Date {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
