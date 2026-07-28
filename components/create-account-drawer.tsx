// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wallet } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";

import type { ReactNode } from "react";

export function CreateAccountDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    error,
    data: newAccount,
  } = useFetch(createAccount);

  const onSubmit = async (data: any) => {
    await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="pb-2 pt-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <DrawerTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Create New Account
              </DrawerTitle>
            </div>
            <p className="text-sm text-muted-foreground ml-13 pl-1">
              Add a bank account or wallet to track your finances
            </p>
          </DrawerHeader>

          <div className="px-4 pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Account Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Account Name
                </label>
                <Input
                  id="name"
                  placeholder="e.g., Main Checking"
                  {...register("name")}
                  className="h-10 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.name.message}
                  </p>
                )}
              </div>

              {/* Account Type */}
              <div className="space-y-1.5">
                <label
                  htmlFor="type"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Account Type
                </label>
                <Select
                  onValueChange={(value) => setValue("type", value)}
                  defaultValue={watch("type")}
                >
                  <SelectTrigger
                    id="type"
                    className="h-10 rounded-xl border-slate-200 dark:border-slate-700"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="CURRENT">Current Account</SelectItem>
                    <SelectItem value="SAVINGS">Savings Account</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.type.message}
                  </p>
                )}
              </div>

              {/* Initial Balance */}
              <div className="space-y-1.5">
                <label
                  htmlFor="balance"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Initial Balance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                    $
                  </span>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("balance")}
                    className="pl-7 h-10 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {errors.balance && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.balance.message}
                  </p>
                )}
              </div>

              {/* Set as Default */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                <div className="space-y-0.5">
                  <label
                    htmlFor="isDefault"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Set as Default
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Used by default for transactions
                  </p>
                </div>
                <Switch
                  id="isDefault"
                  checked={watch("isDefault")}
                  onCheckedChange={(checked) => setValue("isDefault", checked)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 rounded-xl border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 font-semibold transition-all duration-200"
                  disabled={createAccountLoading}
                >
                  {createAccountLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
