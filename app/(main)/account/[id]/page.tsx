import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";

import { formatCurrency } from "@/lib/currencies";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function AccountPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { page } = await searchParams;
    const currentPage = parseInt(page as string) || 1;

    const accountData = await getAccountWithTransactions(id, currentPage);

  if (!accountData) {
    notFound();
  }

  const { transactions, pagination, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account • {account.currency || "INR"}
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            {formatCurrency(Number(account.balance), account.currency || "INR")}
          </div>
          <p className="text-sm text-muted-foreground">
            {pagination.total} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountChart transactions={transactions} currency={account.currency || "INR"} />
      </Suspense>

      {/* Transactions Table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <TransactionTable
          transactions={transactions}
          pagination={pagination}
          currency={account.currency || "INR"}
        />
      </Suspense>
    </div>
  );
}
