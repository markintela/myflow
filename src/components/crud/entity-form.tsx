"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RECURRENCE_OPTIONS, type RecurrenceType } from "@/lib/types";

export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "textarea" | "select" | "checkbox";
  options?: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string;
  // Campo auxiliar só de UI — não é enviado no submit (ex: "repetir sempre").
  virtual?: boolean;
  // Nome de outro campo que fica desabilitado (e limpo) enquanto este
  // checkbox estiver marcado.
  disables?: string;
  // Fica obrigatório quando o campo "recurrence_type" do mesmo form não for
  // "none" — é a data inicial a partir da qual a repetição é calculada.
  requiredWhenRecurring?: boolean;
};

// Campos de repetição (semanal/mensal/anual, sempre ou até uma data)
// reaproveitados por todas as áreas com data — o calendário projeta as
// ocorrências.
export function recurrenceFields(defaultValue: RecurrenceType = "none"): FieldConfig[] {
  return [
    {
      name: "recurrence_type",
      label: "Repetição",
      type: "select",
      options: RECURRENCE_OPTIONS.map((r) => ({ value: r.value, label: r.label })),
      defaultValue,
    },
    {
      name: "recurrence_forever",
      label: "Repetir sempre (sem data de término)",
      type: "checkbox",
      virtual: true,
      disables: "recurrence_end_date",
      defaultValue: "",
    },
    { name: "recurrence_end_date", label: "Repetir até (opcional)", type: "date" },
  ];
}

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
  const [values, setValues] = useState<Record<string, any>>(() => {
    const defaults = Object.fromEntries(
      fields.filter((f) => f.defaultValue !== undefined).map((f) => [f.name, f.defaultValue])
    );
    // Ao editar um registro existente, campos "virtuais" (ex: checkbox
    // "repetir sempre") não vêm do banco — inferimos o estado inicial deles
    // a partir do campo que controlam já estar vazio ou não.
    const derived: Record<string, any> = {};
    if (Object.keys(initialValues).length > 0) {
      fields.forEach((f) => {
        if (f.disables) derived[f.name] = !initialValues[f.disables];
      });
    }
    return { ...defaults, ...derived, ...initialValues };
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name: string, value: any) => {
    setValues((v) => {
      const next = { ...v, [name]: value };
      const field = fields.find((f) => f.name === name);
      // null, não "" — string vazia é inválida pra uma coluna date no Postgres.
      if (field?.disables && value) next[field.disables] = null;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload: Record<string, any> = { ...values };
    fields.forEach((f) => {
      if (f.virtual) {
        delete payload[f.name];
        return;
      }
      const disabledBy = fields.find((other) => other.disables === f.name);
      if (disabledBy && values[disabledBy.name]) payload[f.name] = null;
    });
    await onSubmit(payload);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fields.map((f) => {
        const disabledBy = fields.find((other) => other.disables === f.name);
        const isDisabled = disabledBy ? !!values[disabledBy.name] : false;
        const isRecurring = values.recurrence_type && values.recurrence_type !== "none";
        const isRequired = f.required || (f.requiredWhenRecurring && isRecurring);

        if (f.type === "checkbox") {
          return (
            <div key={f.name} className="flex items-center gap-2 pt-5">
              <Checkbox
                checked={!!values[f.name]}
                onCheckedChange={(v) => handleChange(f.name, v)}
              />
              <span className="text-sm text-slate-700">{f.label}</span>
            </div>
          );
        }

        return (
          <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
            <Label htmlFor={f.name}>
              {f.label}
              {f.requiredWhenRecurring && isRecurring && !f.required && (
                <span className="text-red-500"> *</span>
              )}
            </Label>
            {f.type === "textarea" ? (
              <textarea
                id={f.name}
                required={isRequired}
                value={values[f.name] ?? ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue"
                rows={2}
              />
            ) : f.type === "select" ? (
              <select
                id={f.name}
                required={isRequired}
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
                required={isRequired}
                disabled={isDisabled}
                value={isDisabled ? "" : values[f.name] ?? ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
              />
            )}
          </div>
        );
      })}

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
