// @ts-nocheck
"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currencies";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#06b6d4",
  "#ef4444",
];

const CustomTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {payload[0].name}
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
          {formatCurrency(payload[0].value, currency)}
        </p>
      </div>
    );
  }
  return null;
};

import type { SerializedAccount, SerializedTransaction } from "@/types";

export function DashboardOverview({ accounts, transactions }: { accounts: SerializedAccount[], transactions: SerializedTransaction[] }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const currency = selectedAccount?.currency || "INR";

  const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );

  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) acc[category] = 0;
    acc[category] += transaction.amount;
    return acc;
  }, {});

  const pieChartData = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({ name: category, value: amount })
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Recent Transactions */}
      <Card className="rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-800/80 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 pt-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recent Transactions
            </CardTitle>
          </div>
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs rounded-xl border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {accounts.map((account) => (
                <SelectItem
                  key={account.id}
                  value={account.id}
                  className="text-xs"
                >
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No recent transactions
                </p>
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        transaction.type === "EXPENSE"
                          ? "bg-red-50 dark:bg-red-500/10"
                          : "bg-emerald-50 dark:bg-emerald-500/10"
                      )}
                    >
                      {transaction.type === "EXPENSE" ? (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight">
                        {transaction.description || "Untitled Transaction"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(transaction.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-sm font-bold",
                      transaction.type === "EXPENSE"
                        ? "text-red-500"
                        : "text-emerald-500"
                    )}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}
                    {formatCurrency(transaction.amount, currency)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card className="rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-800/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 pt-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
              <svg
                className="h-4 w-4 text-purple-600 dark:text-purple-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
            </div>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Monthly Expense Breakdown
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-4">
          {pieChartData.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                No expenses this month
              </p>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
