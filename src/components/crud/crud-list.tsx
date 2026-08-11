"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EntityForm, type FieldConfig } from "@/components/crud/entity-form";

interface CrudListProps<T extends { id: string }> {
  title: string;
  icon?: React.ReactNode;
  fields: FieldConfig[];
  items: T[];
  loading: boolean;
  error: string | null;
  renderItem: (item: T) => React.ReactNode;
  onCreate: (values: Partial<T>) => Promise<{ error: string | null }>;
  onUpdate: (id: string, values: Partial<T>) => Promise<{ error: string | null }>;
  onDelete: (id: string) => Promise<{ error: string | null }>;
}

// Componente de CRUD completo (listar, criar, editar, apagar) reutilizado em
// todas as páginas do dashboard.
export function CrudList<T extends { id: string }>({
  title,
  icon,
  fields,
  items,
  loading,
  error,
  renderItem,
  onCreate,
  onUpdate,
  onDelete,
}: CrudListProps<T>) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingItem = items.find((i) => i.id === editingId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        {!showForm && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingId(null);
              setShowForm(true);
            }}
          >
            <Plus size={14} /> Novo
          </Button>
        )}
      </CardHeader>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {showForm && (
        <div className="mb-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">
              {editingId ? "Editar registro" : "Novo registro"}
            </span>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
          <EntityForm
            fields={fields}
            initialValues={editingItem as any}
            submitLabel={editingId ? "Atualizar" : "Adicionar"}
            onCancel={() => setShowForm(false)}
            onSubmit={async (values) => {
              const result = editingId
                ? await onUpdate(editingId, values)
                : await onCreate(values);
              if (!result.error) {
                setShowForm(false);
                setEditingId(null);
              }
            }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum registro ainda. Adicione o primeiro.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2.5 gap-3">
              <div className="min-w-0 flex-1">{renderItem(item)}</div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => {
                    setEditingId(item.id);
                    setShowForm(true);
                  }}
                  className="p-1.5 rounded-md text-slate-400 hover:text-brand-blue hover:bg-brand-blueSoft"
                  aria-label="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                  aria-label="Apagar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
