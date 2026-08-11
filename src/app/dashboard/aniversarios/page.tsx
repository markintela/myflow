"use client";

import { Gift } from "lucide-react";
import { useCrud } from "@/hooks/use-crud";
import { CrudList } from "@/components/crud/crud-list";
import type { Birthday } from "@/lib/types";

const FIELDS = [
  { name: "name", label: "Nome", type: "text" as const, required: true },
  { name: "birth_date", label: "Data de nascimento", type: "date" as const, required: true },
  { name: "notes", label: "Ideias de presente / notas", type: "textarea" as const },
];

export default function AniversariosPage() {
  const { items, loading, error, create, update, remove } = useCrud<Birthday>("birthdays", "birth_date");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Aniversários</h1>
      <p className="text-slate-500 text-sm mb-6">Nunca mais esqueça a data de um amigo ou familiar.</p>

      <CrudList
        title="Todos os aniversários"
        icon={<Gift size={18} className="text-brand-blue" />}
        fields={FIELDS}
        items={items}
        loading={loading}
        error={error}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
        renderItem={(b) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-blueSoft text-brand-blue flex items-center justify-center text-xs font-semibold shrink-0">
              {b.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <p className="text-sm text-slate-800 font-medium">{b.name}</p>
              <p className="text-xs text-slate-400">{b.birth_date}</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
