"use client";

import { ListChecks } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import { CrudList } from "@/components/crud/crud-list";
import { Checkbox } from "@/components/ui/checkbox";
import type { Task } from "@/lib/types";

const FIELDS = [
  { name: "title", label: "Título", type: "text" as const, required: true },
  { name: "due_date", label: "Prazo", type: "date" as const },
];

export default function TarefasPage() {
  const { items, sharedItems, currentUserId, loading, error, create, update, remove } = useCrud<Task>(
    "tasks",
    "created_at",
    { includeShared: true }
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Tarefas</h1>
      <p className="text-slate-500 text-sm mb-6">O que precisa ser resolvido — hoje ou nos próximos dias.</p>

      <CrudList
        title="Todas as tarefas"
        icon={<ListChecks size={18} className="text-brand-blue" />}
        tableName="tasks"
        currentUserId={currentUserId}
        fields={FIELDS}
        items={items}
        sharedItems={sharedItems}
        loading={loading}
        error={error}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
        renderItem={(t) => (
          <div className="flex items-center gap-3">
            <Checkbox
              checked={t.done}
              onCheckedChange={(v) => t.user_id === currentUserId && update(t.id, { done: v } as any)}
            />
            <div>
              <p className={`text-sm ${t.done ? "text-slate-400 line-through" : "text-slate-800"}`}>{t.title}</p>
              {t.due_date && <p className="text-xs text-slate-400">Prazo: {t.due_date}</p>}
            </div>
          </div>
        )}
      />
    </div>
  );
}
