"use client";

import { Wallet } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import { CrudList } from "@/components/crud/crud-list";
import type { Expense } from "@/lib/types";

const FIELDS = [
  { name: "description", label: "Descrição", type: "text" as const, required: true },
  { name: "amount", label: "Valor (€)", type: "number" as const, required: true },
  { name: "category", label: "Categoria", type: "text" as const },
  { name: "expense_date", label: "Data", type: "date" as const, required: true },
];

export default function DespesasPage() {
  const { items, loading, error, create, update, remove } = useCrud<Expense>("expenses", "expense_date");

  const total = items.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Despesas</h1>
      <p className="text-slate-500 text-sm mb-1">Controle seus gastos por categoria.</p>
      <p className="text-sm font-mono text-brand-cyan mb-6">Total registrado: €{total.toFixed(2)}</p>

      <CrudList
        title="Todas as despesas"
        icon={<Wallet size={18} className="text-brand-cyan" />}
        fields={FIELDS}
        items={items}
        loading={loading}
        error={error}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
        renderItem={(e) => (
          <div className="flex justify-between w-full pr-2">
            <div>
              <p className="text-sm text-slate-800 font-medium">{e.description}</p>
              <p className="text-xs text-slate-400">{e.category} · {e.expense_date}</p>
            </div>
            <p className="text-sm font-mono text-slate-700">€{Number(e.amount).toFixed(2)}</p>
          </div>
        )}
      />
    </div>
  );
}
