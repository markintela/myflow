"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Share, TableName } from "@/lib/types";

export type ShareWithProfile = Share & { profile: Profile | null };

// Hook genérico de compartilhamento reutilizado por todas as áreas do app.
// Compartilhar dá acesso somente-leitura ao registro para quem recebe.
export function useShares(tableName: TableName, recordId: string | null) {
  const supabase = createClient();
  const [shares, setShares] = useState<ShareWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!recordId) {
      setShares([]);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("shares")
      .select("*")
      .eq("table_name", tableName)
      .eq("record_id", recordId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const rows = (data as Share[]) ?? [];
    const profileIds = rows.map((s) => s.shared_with_id);
    let profiles: Profile[] = [];
    if (profileIds.length > 0) {
      const { data: profileRows } = await supabase.from("profiles").select("*").in("id", profileIds);
      profiles = (profileRows as Profile[]) ?? [];
    }

    setShares(
      rows.map((s) => ({ ...s, profile: profiles.find((p) => p.id === s.shared_with_id) ?? null }))
    );
    setLoading(false);
  }, [tableName, recordId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Não busca automaticamente ao montar — cada linha da lista teria uma
  // query própria. O painel de compartilhamento chama refresh() ao abrir.

  const addShare = useCallback(
    async (email: string) => {
      if (!recordId) return { error: "Registro inválido" };

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: "Usuário não autenticado" };

      const { data: profile, error: lookupError } = await supabase
        .rpc("get_profile_by_email", { lookup_email: email.trim().toLowerCase() })
        .maybeSingle<Profile>();

      if (lookupError) return { error: lookupError.message };
      if (!profile) return { error: "Nenhuma conta encontrada com esse email" };
      if (profile.id === user.id) return { error: "Você já tem acesso a este item" };

      const { error } = await supabase.from("shares").upsert(
        [
          {
            table_name: tableName,
            record_id: recordId,
            owner_id: user.id,
            shared_with_id: profile.id,
          },
        ],
        { onConflict: "table_name,record_id,shared_with_id", ignoreDuplicates: true }
      );

      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [tableName, recordId, refresh] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const removeShare = useCallback(
    async (shareId: string) => {
      const { error } = await supabase.from("shares").delete().eq("id", shareId);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [refresh] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { shares, loading, error, refresh, addShare, removeShare };
}
