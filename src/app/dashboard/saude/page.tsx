"use client";

import { HeartPulse } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import { CrudList } from "@/components/crud/crud-list";
import { recurrenceFields } from "@/components/crud/entity-form";
import type { HealthLog } from "@/lib/types";

const FIELDS = [
  {
    name: "metric",
    label: "Métrica",
    type: "select" as const,
    required: true,
    options: [
      { value: "agua", label: "Água" },
      { value: "sono", label: "Sono" },
      { value: "exercicio", label: "Exercício" },
      { value: "outro", label: "Outro" },
    ],
  },
  { name: "value", label: "Valor (ex: 6 copos, 7h30, 30 min)", type: "text" as const, required: true },
  { name: "log_date", label: "Data", type: "date" as const, required: true },
  ...recurrenceFields(),
];

const METRIC_LABEL: Record<string, string> = {
  agua: "Água",
  sono: "Sono",
  exercicio: "Exercício",
  outro: "Outro",
};

export default function SaudePage() {
  const { items, sharedItems, currentUserId, loading, error, create, update, remove } = useCrud<HealthLog>(
    "health_logs",
    "log_date",
    { includeShared: true }
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Saúde e bem-estar</h1>
      <p className="text-slate-500 text-sm mb-6">Água, sono, exercício e outros hábitos.</p>

      <CrudList
        title="Registros de saúde"
        icon={<HeartPulse size={18} className="text-brand-green" />}
        tableName="health_logs"
        currentUserId={currentUserId}
        fields={FIELDS}
        items={items}
        sharedItems={sharedItems}
        loading={loading}
        error={error}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
        renderItem={(h) => (
          <div>
            <p className="text-sm text-slate-800 font-medium">{METRIC_LABEL[h.metric]}: {h.value}</p>
            <p className="text-xs text-slate-400">{h.log_date}</p>
          </div>
        )}
      />
    </div>
  );
}
