// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";
import { cn } from "@/lib/utils";

import type { SerializedBudget } from "@/types";

interface BudgetProgressProps {
  initialBudget: SerializedBudget | null;
  currentExpenses: number;
}

export function BudgetProgress({ initialBudget, currentExpenses }: BudgetProgressProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const percentUsed = initialBudget
    ? Math.min((currentExpenses / initialBudget.amount) * 100, 100)
    : 0;

  const budgetStatus =
    percentUsed >= 90 ? "danger" : percentUsed >= 75 ? "warning" : "safe";

  const statusConfig = {
    danger: {
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-500/10",
      borderColor: "border-red-200 dark:border-red-500/20",
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Over budget!",
    },
    warning: {
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-500/10",
      borderColor: "border-amber-200 dark:border-amber-500/20",
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Approaching limit",
    },
    safe: {
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
      borderColor: "border-emerald-200 dark:border-emerald-500/20",
      icon: <CheckCircle className="h-4 w-4" />,
      label: "On track",
    },
  };

  const status = statusConfig[budgetStatus];

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  return (
    <Card className="rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-800/80 shadow-sm overflow-hidden">
      {/* Top progress strip */}
      {initialBudget && (
        <div className="h-1.5 bg-slate-100 dark:bg-slate-700/50">
          <div
            className={cn("h-full transition-all duration-700", status.color)}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      )}

      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Monthly Budget
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Default account spending limit
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {initialBudget && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                status.bgColor,
                status.textColor,
                status.borderColor
              )}
            >
              {status.icon}
              {status.label}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget amount row */}
        <div className="flex items-center justify-between">
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-[200px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="pl-7 h-9 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                  placeholder="0.00"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUpdateBudget}
                disabled={isLoading}
                className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={isLoading}
                className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {initialBudget
                    ? `$${currentExpenses.toFixed(2)}`
                    : "No budget set"}
                </div>
                {initialBudget && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    of{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      ${initialBudget.amount.toFixed(2)}
                    </span>{" "}
                    budget
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {initialBudget && !isEditing && (
            <div className="text-right">
              <div className={cn("text-2xl font-extrabold tracking-tight", status.textColor)}>
                {percentUsed.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">used</div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {initialBudget && (
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  status.color
                )}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>${initialBudget.amount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
