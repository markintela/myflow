"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useShares } from "@/hooks/use-shares";
import type { ExpenseSplit, Profile } from "@/lib/types";

export type ExpenseSplitWithProfile = ExpenseSplit & { profile: Profile | null };

// Rateio estilo Splitwise de uma despesa específica. Só o dono da despesa
// pode gerenciar os participantes (aplicado via RLS em expense_splits).
export function useExpenseSplits(expenseId: string | null) {
  const supabase = createClient();
  const { addShare } = useShares("expenses", expenseId);
  const [splits, setSplits] = useState<ExpenseSplitWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!expenseId) {
      setSplits([]);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("expense_splits")
      .select("*")
      .eq("expense_id", expenseId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const rows = (data as ExpenseSplit[]) ?? [];
    const userIds = rows.map((s) => s.user_id);
    let profiles: Profile[] = [];
    if (userIds.length > 0) {
      const { data: profileRows } = await supabase.from("profiles").select("*").in("id", userIds);
      profiles = (profileRows as Profile[]) ?? [];
    }

    setSplits(rows.map((s) => ({ ...s, profile: profiles.find((p) => p.id === s.user_id) ?? null })));
    setLoading(false);
  }, [expenseId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Não busca automaticamente ao montar — o painel de rateio chama
  // refresh() ao abrir, para não gerar uma query por linha da lista.

  const addParticipant = useCallback(
    async (email: string, amount: number) => {
      if (!expenseId) return { error: "Despesa inválida" };

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: "Usuário não autenticado" };

      const { data: profile, error: lookupError } = await supabase
        .rpc("get_profile_by_email", { lookup_email: email.trim().toLowerCase() })
        .maybeSingle<Profile>();

      if (lookupError) return { error: lookupError.message };
      if (!profile) return { error: "Nenhuma conta encontrada com esse email" };

      const { error } = await supabase
        .from("expense_splits")
        .upsert([{ expense_id: expenseId, user_id: profile.id, amount }], {
          onConflict: "expense_id,user_id",
        });

      if (error) return { error: error.message };

      if (profile.id !== user.id) {
        await addShare(email);
      }

      await refresh();
      return { error: null };
    },
    [expenseId, addShare, refresh] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const removeParticipant = useCallback(
    async (splitId: string) => {
      const { error } = await supabase.from("expense_splits").delete().eq("id", splitId);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [refresh] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { splits, loading, error, refresh, addParticipant, removeParticipant };
}
