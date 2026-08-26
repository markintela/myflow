"use client";

import { Landmark } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import { useProfile } from "@/hooks/use-profile";
import { CrudList } from "@/components/crud/crud-list";
import { recurrenceFields } from "@/components/crud/entity-form";
import { isInFinancialMonth, formatFinancialMonthLabel } from "@/lib/utils";
import type { IncomeSource } from "@/lib/types";

const FIELDS = [
  { name: "name", label: "Nome (ex: Emprego CLT, Freelance X)", type: "text" as const, required: true },
  {
    name: "income_type",
    label: "Tipo",
    type: "select" as const,
    required: true,
    options: [
      { value: "fixo", label: "Fixo (salário-base, todo mês)" },
      { value: "variavel", label: "Variável (só no mês em que ocorreu)" },
    ],
  },
  { name: "amount", label: "Valor (€)", type: "number" as const, required: true },
  { name: "income_date", label: "Data", type: "date" as const, required: true },
  { name: "notes", label: "Notas", type: "textarea" as const },
  ...recurrenceFields(),
];

export default function RendaPage() {
  const { items, sharedItems, currentUserId, loading, error, create, update, remove } =
    useCrud<IncomeSource>("income_sources", "income_date", { includeShared: true });
  const { profile } = useProfile();
  const monthStartDay = profile?.month_start_day ?? 25;

  const monthlyBudget = items.reduce((sum, i) => {
    if (i.income_type === "fixo") return sum + Number(i.amount || 0);
    if (isInFinancialMonth(i.income_date, monthStartDay)) return sum + Number(i.amount || 0);
    return sum;
  }, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Receitas</h1>
      <p className="text-slate-500 text-sm mb-1">Empregos fixos e fontes de receita variável.</p>
      <p className="text-sm font-mono text-brand-green mb-6">
        Receita estimada do mês ({formatFinancialMonthLabel(monthStartDay)}): €{monthlyBudget.toFixed(2)}
      </p>

      <CrudList
        title="Todas as fontes de receita"
        icon={<Landmark size={18} className="text-brand-green" />}
        tableName="income_sources"
        currentUserId={currentUserId}
        fields={FIELDS}
        items={items}
        sharedItems={sharedItems}
        loading={loading}
        error={error}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
        renderItem={(i) => (
          <div className="flex justify-between w-full pr-2">
            <div>
              <p className="text-sm text-slate-800 font-medium">{i.name}</p>
              <p className="text-xs text-slate-400">
                {i.income_type === "fixo" ? "Fixo" : "Variável"} · {i.income_date}
              </p>
            </div>
            <p className="text-sm font-mono text-slate-700">€{Number(i.amount).toFixed(2)}</p>
          </div>
        )}
      />
    </div>
  );
}
