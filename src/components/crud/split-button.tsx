"use client";

import { useState } from "react";
import { Split, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExpenseSplits } from "@/hooks/use-expense-splits";

interface SplitButtonProps {
  expenseId: string;
  onChange?: () => void;
}

// Painel inline para repartir uma despesa entre participantes, estilo
// Splitwise. Só o dono da despesa gerencia (aplicado via RLS).
export function SplitButton({ expenseId, onChange }: SplitButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { splits, loading, error, refresh, addParticipant, removeParticipant } =
    useExpenseSplits(expenseId);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!email.trim() || !value) return;
    setSubmitting(true);
    setFormError(null);
    const result = await addParticipant(email, value);
    if (result.error) {
      setFormError(result.error);
    } else {
      setEmail("");
      setAmount("");
      onChange?.();
    }
    setSubmitting(false);
  };

  const handleRemove = async (splitId: string) => {
    await removeParticipant(splitId);
    onChange?.();
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="p-1.5 rounded-md text-slate-400 hover:text-brand-cyan hover:bg-brand-cyanSoft"
        aria-label="Repartir"
      >
        <Split size={14} />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-72 max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-md p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-700">Repartir despesa</span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400">Carregando...</p>
          ) : splits.length === 0 ? (
            <p className="text-xs text-slate-400 mb-2">Nenhum participante ainda.</p>
          ) : (
            <ul className="flex flex-col gap-1.5 mb-2">
              {splits.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-xs text-slate-700">
                  <span className="truncate">{s.profile?.full_name || s.profile?.email || "..."}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-slate-500">€{Number(s.amount).toFixed(2)}</span>
                    <button
                      onClick={() => handleRemove(s.id)}
                      className="text-slate-400 hover:text-red-600"
                      aria-label="Remover"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit} className="flex gap-1.5">
            <Input
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs py-1.5"
            />
            <Input
              type="number"
              step="0.01"
              placeholder="€"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-xs py-1.5 w-20"
            />
            <Button type="submit" size="sm" disabled={submitting}>
              +
            </Button>
          </form>
          {(formError || error) && (
            <p className="text-xs text-red-600 mt-1.5">{formError || error}</p>
          )}
        </div>
      )}
    </div>
  );
}
