"use client";

import { CalendarPlus } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import { CrudList } from "@/components/crud/crud-list";
import type { Event } from "@/lib/types";

const FIELDS = [
  { name: "title", label: "Título", type: "text" as const, required: true },
  {
    name: "category",
    label: "Categoria",
    type: "select" as const,
    required: true,
    options: [
      { value: "pessoal", label: "Pessoal" },
      { value: "trabalho", label: "Trabalho" },
      { value: "saude", label: "Saúde" },
      { value: "financeiro", label: "Financeiro" },
      { value: "outro", label: "Outro" },
    ],
  },
  { name: "event_date", label: "Data", type: "date" as const, required: true },
  { name: "location", label: "Local", type: "text" as const },
  { name: "notes", label: "Notas", type: "textarea" as const },
];

const CATEGORY_LABEL: Record<string, string> = {
  pessoal: "Pessoal",
  trabalho: "Trabalho",
  saude: "Saúde",
  financeiro: "Financeiro",
  outro: "Outro",
};

export default function EventosPage() {
  const { items, loading, error, create, update, remove } = useCrud<Event>("events", "event_date");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Eventos</h1>
      <p className="text-slate-500 text-sm mb-6">Registre compromissos e eventos importantes.</p>

      <CrudList
        title="Eventos"
        icon={<CalendarPlus size={18} className="text-brand-blue" />}
        fields={FIELDS}
        items={items}
        loading={loading}
        error={error}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
        renderItem={(e) => (
          <div>
            <p className="text-sm text-slate-800 font-medium">{e.title}</p>
            <p className="text-xs text-slate-400">
              {CATEGORY_LABEL[e.category] ?? e.category} · {e.event_date}
              {e.location ? ` · ${e.location}` : ""}
            </p>
          </div>
        )}
      />
    </div>
  );
}
