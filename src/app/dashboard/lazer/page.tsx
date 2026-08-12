"use client";

import { Waves } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import { CrudList } from "@/components/crud/crud-list";
import type { LeisureEvent } from "@/lib/types";

const FIELDS = [
  { name: "title", label: "Título", type: "text" as const, required: true },
  { name: "event_date", label: "Data", type: "date" as const, required: true },
  { name: "location", label: "Local", type: "text" as const },
  { name: "notes", label: "Notas", type: "textarea" as const },
];

export default function LazerPage() {
  const { items, sharedItems, currentUserId, loading, error, create, update, remove } = useCrud<LeisureEvent>(
    "leisure_events",
    "event_date",
    { includeShared: true }
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Lazer</h1>
      <p className="text-slate-500 text-sm mb-6">Momentos de descanso e diversão agendados.</p>

      <CrudList
        title="Programas de lazer"
        icon={<Waves size={18} className="text-brand-green" />}
        tableName="leisure_events"
        currentUserId={currentUserId}
        fields={FIELDS}
        items={items}
        sharedItems={sharedItems}
        loading={loading}
        error={error}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
        renderItem={(l) => (
          <div>
            <p className="text-sm text-slate-800 font-medium">{l.title}</p>
            <p className="text-xs text-slate-400">
              {l.event_date}{l.location ? ` · ${l.location}` : ""}
            </p>
          </div>
        )}
      />
    </div>
  );
}
