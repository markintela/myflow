"use client";

import { useEffect, useState } from "react";
import { Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCrud } from "@/hooks/use-crud";
import { useProfile } from "@/hooks/use-profile";
import { CrudList } from "@/components/crud/crud-list";
import { SplitButton } from "@/components/crud/split-button";
import { recurrenceFields } from "@/components/crud/entity-form";
import { createClient } from "@/lib/supabase/client";
import { getPeriodRange, isInPeriod, formatPeriodLabel, periodStep, type PeriodMode } from "@/lib/utils";
import { EXPENSE_CATEGORIES, type Expense, type ExpenseSplit } from "@/lib/types";

const PERIOD_LABEL: Record<PeriodMode, string> = { semana: "Semana", mes: "Mês", ano: "Ano" };

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
  const { profile } = useProfile();
  const monthStartDay = profile?.month_start_day ?? 25;

  const [mode, setMode] = useState<PeriodMode>("mes");
  const [cursor, setCursor] = useState(new Date());
  const { start, end } = getPeriodRange(mode, cursor, monthStartDay);
  const periodItems = items.filter((e) => isInPeriod(e.expense_date, start, end));
  const periodSharedItems = sharedItems.filter((e) => isInPeriod(e.expense_date, start, end));

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

  const periodTotal = periodItems.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const periodFixedTotal = periodItems
    .filter((e) => e.expense_type === "fixa")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const periodVariableTotal = periodItems
    .filter((e) => e.expense_type === "variavel")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const periodLabel = formatPeriodLabel(mode, cursor, monthStartDay);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Despesas</h1>
      <p className="text-slate-500 text-sm mb-3">Controle seus gastos fixos e variáveis por categoria.</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-6 text-sm font-mono">
        <span className="text-brand-cyan">Total do período: €{periodTotal.toFixed(2)}</span>
        <span className="inline-flex items-center gap-1.5 text-brand-blue">
          <span className="w-2 h-2 rounded-full bg-brand-blue shrink-0" />
          Fixas: €{periodFixedTotal.toFixed(2)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-amber-600">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          Variáveis: €{periodVariableTotal.toFixed(2)}
        </span>
      </div>

      <Card className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {(Object.keys(PERIOD_LABEL) as PeriodMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                  mode === m ? "bg-brand-blue text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {PERIOD_LABEL[m]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700 capitalize">{periodLabel}</span>
            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setCursor((c) => periodStep(mode, c, -1))}
                className="hover:text-slate-600"
                aria-label="Período anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCursor(new Date())}
                className="text-xs font-medium text-slate-500 hover:text-brand-blue px-1.5 py-1 rounded-md hover:bg-brand-blueSoft"
              >
                Hoje
              </button>
              <button
                onClick={() => setCursor((c) => periodStep(mode, c, 1))}
                className="hover:text-slate-600"
                aria-label="Próximo período"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <CrudList
        title="Despesas do período"
        icon={<Wallet size={18} className="text-brand-cyan" />}
        tableName="expenses"
        currentUserId={currentUserId}
        fields={FIELDS}
        items={periodItems}
        sharedItems={periodSharedItems}
        loading={loading}
        error={error}
        emptyMessage="Nenhuma despesa neste período."
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
                <div className="flex items-center flex-wrap gap-1.5 mt-1">
                  <Badge
                    className={
                      e.expense_type === "fixa"
                        ? "bg-brand-blueSoft text-brand-blue"
                        : "bg-amber-100 text-amber-700"
                    }
                  >
                    {e.expense_type === "fixa" ? "Fixa" : "Variável"}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {CATEGORY_LABEL[e.category] ?? e.category} · {e.expense_date}
                  </span>
                </div>
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
