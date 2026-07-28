// @ts-nocheck
"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { updateDefaultAccount } from "@/actions/account";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const accountTypeColors = {
  CURRENT: {
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
  },
  SAVINGS: {
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  DEFAULT: {
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
  },
};

import type { SerializedAccount } from "@/types";

export function AccountCard({ account }: { account: SerializedAccount }) {
  const { name, type, balance, id, isDefault } = account;

  const colors =
    accountTypeColors[type] || accountTypeColors.DEFAULT;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault();
    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }
    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-800/80 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-300 hover:-translate-y-1">
      {/* Top gradient accent */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
          colors.gradient
        )}
      />

      <Link href={`/account/${id}`} className="block">
        <CardHeader className="flex flex-row items-start justify-between pb-3 pt-5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                colors.bg
              )}
            >
              {type === "SAVINGS" ? (
                <Wallet className={cn("h-5 w-5", colors.text)} />
              ) : (
                <CreditCard className={cn("h-5 w-5", colors.text)} />
              )}
            </div>
            <div>
              <CardTitle className="text-sm font-semibold capitalize text-slate-900 dark:text-slate-100">
                {name}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {type.charAt(0) + type.slice(1).toLowerCase()} Account
              </p>
            </div>
          </div>
          <div onClick={(e) => e.preventDefault()}>
            <Switch
              checked={isDefault}
              onClick={handleDefaultChange}
              disabled={updateDefaultLoading}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-indigo-500"
            />
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              ${parseFloat(balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {isDefault && (
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              Default
            </span>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
            Income
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400">
            <div className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <ArrowDownRight className="h-3.5 w-3.5" />
            </div>
            Expenses
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
