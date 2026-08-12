"use client";

import { useState } from "react";
import { Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShares } from "@/hooks/use-shares";
import type { TableName } from "@/lib/types";

interface ShareButtonProps {
  tableName: TableName;
  recordId: string;
}

// Painel inline para compartilhar um registro (por email, só com quem já
// tem conta) — usado em todas as áreas do app. Compartilhado é somente
// leitura para quem recebe.
export function ShareButton({ tableName, recordId }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { shares, loading, error, refresh, addShare, removeShare } = useShares(tableName, recordId);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setFormError(null);
    const result = await addShare(email);
    if (result.error) {
      setFormError(result.error);
    } else {
      setEmail("");
    }
    setSubmitting(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="p-1.5 rounded-md text-slate-400 hover:text-brand-green hover:bg-brand-greenSoft"
        aria-label="Compartilhar"
      >
        <Users size={14} />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-64 max-w-[85vw] bg-white border border-slate-200 rounded-xl shadow-md p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-700">Compartilhar</span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400">Carregando...</p>
          ) : shares.length === 0 ? (
            <p className="text-xs text-slate-400 mb-2">Ainda não compartilhado com ninguém.</p>
          ) : (
            <ul className="flex flex-col gap-1.5 mb-2">
              {shares.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-xs text-slate-700">
                  <span className="truncate">{s.profile?.full_name || s.profile?.email || "..."}</span>
                  <button
                    onClick={() => removeShare(s.id)}
                    className="text-slate-400 hover:text-red-600 shrink-0 ml-2"
                    aria-label="Remover"
                  >
                    <X size={12} />
                  </button>
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
