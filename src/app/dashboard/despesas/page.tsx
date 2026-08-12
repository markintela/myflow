"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import { CrudList } from "@/components/crud/crud-list";
import { SplitButton } from "@/components/crud/split-button";
import { recurrenceFields } from "@/components/crud/entity-form";
import { createClient } from "@/lib/supabase/client";
import { EXPENSE_CATEGORIES, type Expense, type ExpenseSplit } from "@/lib/types";

const FIELDS = [
  { name: "description", label: "Descrição", type: "text" as const, required: true },
  { name: "amount", label: "Valor (€)", type: "number" as const, required: true },
  {
    name: "category",
    label: "Categoria",
    type: "select" as const,
    required: true,
    options: EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
  },
  {
    name: "expense_type",
    label: "Tipo",
    type: "select" as const,
    required: true,
    options: [
      { value: "variavel", label: "Variável" },
      { value: "fixa", label: "Fixa" },
    ],
  },
  { name: "expense_date", label: "Data", type: "date" as const, required: true },
  ...recurrenceFields(),
];

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.value, c.label])
);

export default function DespesasPage() {
  const { items, sharedItems, currentUserId, loading, error, create, update, remove } = useCrud<Expense>(
    "expenses",
    "expense_date",
    { includeShared: true }
  );

  const [splitsByExpense, setSplitsByExpense] = useState<Record<string, ExpenseSplit[]>>({});

  const allIds = [...items, ...sharedItems].map((e) => e.id);
  const idsKey = allIds.join(",");

  const fetchSplits = async (ids: string[]) => {
    if (ids.length === 0) {
      setSplitsByExpense({});
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.from("expense_splits").select("*").in("expense_id", ids);
    const grouped: Record<string, ExpenseSplit[]> = {};
    for (const split of (data as ExpenseSplit[]) ?? []) {
      (grouped[split.expense_id] ??= []).push(split);
    }
    setSplitsByExpense(grouped);
  };

  useEffect(() => {
    fetchSplits(allIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const total = items.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Despesas</h1>
      <p className="text-slate-500 text-sm mb-1">Controle seus gastos fixos e variáveis por categoria.</p>
      <p className="text-sm font-mono text-brand-cyan mb-6">Total registrado: €{total.toFixed(2)}</p>

      <CrudList
        title="Todas as despesas"
        icon={<Wallet size={18} className="text-brand-cyan" />}
        tableName="expenses"
        currentUserId={currentUserId}
        fields={FIELDS}
        items={items}
        sharedItems={sharedItems}
        loading={loading}
        error={error}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
        renderActions={(e) =>
          e.user_id === currentUserId ? (
            <SplitButton expenseId={e.id} onChange={() => fetchSplits(allIds)} />
          ) : null
        }
        renderItem={(e) => {
          const splits = splitsByExpense[e.id];
          const mine = splits?.find((s) => s.user_id === currentUserId);
          return (
            <div className="flex justify-between w-full pr-2">
              <div>
                <p className="text-sm text-slate-800 font-medium">{e.description}</p>
                <p className="text-xs text-slate-400">
                  {CATEGORY_LABEL[e.category] ?? e.category} · {e.expense_type === "fixa" ? "Fixa" : "Variável"} ·{" "}
                  {e.expense_date}
                </p>
                {splits && splits.length > 0 && (
                  <p className="text-xs text-brand-cyan mt-0.5">
                    Dividida com {splits.length} {splits.length === 1 ? "pessoa" : "pessoas"}
                    {mine ? ` · você deve €${Number(mine.amount).toFixed(2)}` : ""}
                  </p>
                )}
              </div>
              <p className="text-sm font-mono text-slate-700">€{Number(e.amount).toFixed(2)}</p>
            </div>
          );
        }}
      />
    </div>
  );
}
