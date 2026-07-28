"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import logger from "@/lib/logger";
import { withActive } from "@/lib/db-utils";
import type { Prisma } from "@prisma/client";
import type {
  SerializedAccount,
  SerializedTransaction,
  PaginationMeta,
  PaginatedAccountResponse,
  ActionResponse,
} from "@/types";

interface DecimalObj {
  balance?: Prisma.Decimal | number;
  amount?: Prisma.Decimal | number;
  account?: { balance?: Prisma.Decimal | number; [key: string]: unknown };
  [key: string]: unknown;
}

const serializeDecimal = <T extends DecimalObj>(obj: T): T => {
  const serialized = { ...obj };
  if (obj.balance && typeof obj.balance === "object" && "toNumber" in obj.balance) {
    (serialized as Record<string, unknown>).balance = (obj.balance as Prisma.Decimal).toNumber();
  }
  if (obj.amount && typeof obj.amount === "object" && "toNumber" in obj.amount) {
    (serialized as Record<string, unknown>).amount = (obj.amount as Prisma.Decimal).toNumber();
  }
  // Handle nested account object (from include: { account: true })
  if (obj.account) {
    (serialized as Record<string, unknown>).account = {
      ...obj.account,
      balance: obj.account.balance && typeof obj.account.balance === "object" && "toNumber" in obj.account.balance
        ? (obj.account.balance as Prisma.Decimal).toNumber()
        : obj.account.balance,
    };
  }
  return serialized;
};

export async function getAccountWithTransactions(
  accountId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedAccountResponse | null> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const skip = (page - 1) * pageSize;

    const [account, transactions, totalCount] = await Promise.all([
      db.account.findUnique({
        where: withActive({
          id: accountId,
          userId: user.id,
        }),
      }),
      db.transaction.findMany({
        where: withActive({
          accountId,
          userId: user.id,
        }),
        orderBy: { date: "desc" },
        skip,
        take: pageSize,
        include: {
          account: true,
        },
      }),
      db.transaction.count({
        where: withActive({
          accountId,
          userId: user.id,
        }),
      }),
    ]);

    if (!account) return null;

    return {
      ...serializeDecimal(account),
      transactions: transactions.map(serializeDecimal),
      pagination: {
        total: totalCount,
        page,
        pageSize,
        hasMore: skip + transactions.length < totalCount,
      },
    } as unknown as PaginatedAccountResponse;
  } catch (error) {
    logger.error("GET_ACCOUNT_TRANSACTIONS_FAILED", error, { accountId, page });
    throw new Error((error as Error).message);
  }
}

export async function bulkDeleteTransactions(
  transactionIds: string[]
): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get transactions to calculate balance changes
    const transactions = await db.transaction.findMany({
      where: withActive({
        id: { in: transactionIds },
        userId: user.id,
      }),
    });

    // Group transactions by account to update balances
    const accountBalanceChanges = transactions.reduce(
      (acc: Record<string, number>, transaction) => {
        const change =
          transaction.type === "EXPENSE"
            ? transaction.amount.toNumber()
            : -transaction.amount.toNumber();
        acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
        return acc;
      },
      {}
    );

    // Update transactions (Soft Delete) and update account balances in a transaction
    await db.$transaction(async (tx) => {
      // Soft Delete transactions
      await tx.transaction.updateMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }

      // Audit Logging
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "BULK_DELETE_TRANSACTIONS",
          metadata: {
            transactionIds,
            count: transactionIds.length,
          },
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };
  } catch (error) {
    logger.error("BULK_DELETE_TRANSACTIONS_FAILED", error, { transactionIds });
    return { success: false, error: (error as Error).message };
  }
}

export async function updateDefaultAccount(
  accountId: string
): Promise<ActionResponse<SerializedAccount>> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // First, unset any existing default account
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Then set the new default account
    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeDecimal(account) as unknown as SerializedAccount };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
