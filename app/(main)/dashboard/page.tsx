// @ts-nocheck
import { Suspense } from "react";
import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DashboardOverview } from "./_components/transaction-overview";

export default async function DashboardPage() {
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  const defaultAccount = accounts?.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-6">
      {/* Budget Progress */}
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
        currency={defaultAccount?.currency || "USD"}
      />

      {/* Dashboard Overview */}
      <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
      />

      {/* Accounts Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          Your Accounts
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed border-2 border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full min-h-[160px] pt-5 gap-3">
                <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 group-hover:border-blue-400 dark:group-hover:border-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 flex items-center justify-center transition-all duration-300">
                  <Plus className="h-5 w-5 group-hover:text-blue-500 transition-colors duration-300" />
                </div>
                <p className="text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  Add New Account
                </p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>
          {accounts.length > 0 &&
            accounts?.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>
      </div>
    </div>
  );
}
