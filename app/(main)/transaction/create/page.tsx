import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

interface PageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function AddTransactionPage({ searchParams }: PageProps) {
  // ⬅ await searchParams to avoid the sync access error
  const { edit } = await searchParams;

  const accounts = await getUserAccounts();

  let initialData = null;

  if (edit) {
    const transaction = await getTransaction(edit);
    initialData = transaction;
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title">Add Transaction</h1>
      </div>

      <AddTransactionForm
        accounts={accounts || []}
        categories={defaultCategories}
        editMode={!!edit}
        initialData={initialData}
      />
    </div>
  );
}
