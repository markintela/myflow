"use client";

import { BookOpen } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import { CrudList } from "@/components/crud/crud-list";
import { recurrenceFields } from "@/components/crud/entity-form";
import type { Study } from "@/lib/types";

const FIELDS = [
  { name: "subject", label: "Matéria", type: "text" as const, required: true },
  { name: "hours", label: "Horas estudadas", type: "number" as const, required: true },
  { name: "study_date", label: "Data", type: "date" as const, required: true },
  { name: "notes", label: "Notas", type: "textarea" as const },
  ...recurrenceFields(),
];

export default function EducacaoPage() {
  const { items, sharedItems, currentUserId, loading, error, create, update, remove } = useCrud<Study>(
    "studies",
    "study_date",
    { includeShared: true }
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Educação</h1>
      <p className="text-slate-500 text-sm mb-6">Acompanhe suas horas de estudo por matéria.</p>

      <CrudList
        title="Registros de estudo"
        icon={<BookOpen size={18} className="text-brand-blue" />}
        tableName="studies"
        currentUserId={currentUserId}
        fields={FIELDS}
        items={items}
        sharedItems={sharedItems}
        loading={loading}
        error={error}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
        renderItem={(s) => (
          <div>
            <p className="text-sm text-slate-800 font-medium">{s.subject}</p>
            <p className="text-xs text-slate-400">{s.hours}h · {s.study_date}</p>
          </div>
        )}
      />
    </div>
  );
}
