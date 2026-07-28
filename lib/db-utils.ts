import type { Prisma } from "@prisma/client";

/**
 * Helper to automatically add soft-delete filtering to Prisma queries.
 * Wraps any `where` clause to only include records where `deletedAt` is null.
 */
export function withActive<T extends Prisma.TransactionWhereInput | Prisma.AccountWhereInput>(
  where: T
): T & { deletedAt: null } {
  return {
    ...where,
    deletedAt: null,
  };
}
