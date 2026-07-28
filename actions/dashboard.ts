"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { withActive } from "@/lib/db-utils";
import logger from "@/lib/logger";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import type { SerializedAccount, SerializedTransaction, ActionResponse } from "@/types";

const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.string().or(z.number()), // Can come as string from form
  isDefault: z.boolean().default(false),
});

interface DecimalObj {
  balance?: Prisma.Decimal | number;
  amount?: Prisma.Decimal | number;
  [key: string]: unknown;
}

const serializeTransaction = <T extends DecimalObj>(obj: T): T => {
  const serialized = { ...obj };
  if (obj.balance && typeof obj.balance === "object" && "toNumber" in obj.balance) {
    (serialized as Record<string, unknown>).balance = (obj.balance as Prisma.Decimal).toNumber();
  }
  if (obj.amount && typeof obj.amount === "object" && "toNumber" in obj.amount) {
    (serialized as Record<string, unknown>).amount = (obj.amount as Prisma.Decimal).toNumber();
  }
  return serialized;
};

export async function getUserAccounts(): Promise<SerializedAccount[] | undefined> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    const accounts = await db.account.findMany({
      where: withActive({ userId: user.id }),
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    // Serialize accounts before sending to client
    const serializedAccounts = accounts.map(serializeTransaction);

    return serializedAccounts as unknown as SerializedAccount[];
  } catch (error) {
    console.error((error as Error).message);
  }
}

export async function createAccount(
  data: z.infer<typeof accountSchema>
): Promise<ActionResponse<SerializedAccount>> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        logger.error("RATE_LIMIT_EXCEEDED", null, { userId, remaining, reset });
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked");
    }

    // Validation
    const validatedData = accountSchema.parse(data);

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Convert balance to float before saving
    const balanceFloat = parseFloat(String(validatedData.balance));
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // Check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // If it's the first account, make it default regardless of user input
    // If not, use the user's preference
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : validatedData.isDefault;

    // Atomic operation using Transaction
    const account = await db.$transaction(async (tx) => {
      // If this account should be default, unset other default accounts
      if (shouldBeDefault) {
        await tx.account.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      // Create new account
      const newAccount = await tx.account.create({
        data: {
          ...validatedData,
          balance: balanceFloat,
          userId: user.id,
          isDefault: shouldBeDefault,
        },
      });

      // Audit Logging
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CREATE_ACCOUNT",
          metadata: {
            accountId: newAccount.id,
            name: newAccount.name,
            type: newAccount.type,
          },
        },
      });

      return newAccount;
    });

    // Serialize the account before returning
    const serializedAccount = serializeTransaction(account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount as unknown as SerializedAccount };
  } catch (error) {
    logger.error("CREATE_ACCOUNT_FAILED", error, { data });
    throw new Error((error as Error).message);
  }
}

export async function getDashboardData(): Promise<SerializedTransaction[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get all user transactions (active only)
  const transactions = await db.transaction.findMany({
    where: withActive({ userId: user.id }),
    orderBy: { date: "desc" },
  });

  return transactions.map(serializeTransaction) as unknown as SerializedTransaction[];
}
