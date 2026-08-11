"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "textarea" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
};

interface EntityFormProps {
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
  submitLabel?: string;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
}

// Formulário genérico usado por todas as páginas de CRUD (tarefas, estudos,
// saúde, despesas, lazer, aniversários) — cada página só declara os campos.
export function EntityForm({
  fields,
  initialValues = {},
  submitLabel = "Salvar",
  onSubmit,
  onCancel,
}: EntityFormProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name: string, value: any) => {
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(values);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fields.map((f) => (
        <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
          <Label htmlFor={f.name}>{f.label}</Label>
          {f.type === "textarea" ? (
            <textarea
              id={f.name}
              required={f.required}
              value={values[f.name] ?? ""}
              onChange={(e) => handleChange(f.name, e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue"
              rows={2}
            />
          ) : f.type === "select" ? (
            <select
              id={f.name}
              required={f.required}
              value={values[f.name] ?? ""}
              onChange={(e) => handleChange(f.name, e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue"
            >
              <option value="" disabled>
                Selecione
              </option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id={f.name}
              type={f.type}
              required={f.required}
              value={values[f.name] ?? ""}
              onChange={(e) => handleChange(f.name, e.target.value)}
            />
          )}
        </div>
      ))}

      <div className="sm:col-span-2 flex gap-2 justify-end mt-1">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
