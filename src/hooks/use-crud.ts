"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TableName } from "@/lib/types";

// Hook genérico de CRUD reutilizado por todas as páginas (tarefas, estudos,
// saúde, despesas, lazer, aniversários). Filtra sempre por user_id, aplicando
// as políticas de Row Level Security definidas no schema.sql.
export function useCrud<T extends { id: string; user_id: string }>(
  table: TableName,
  orderBy: string = "created_at",
  options: { includeShared?: boolean } = {}
) {
  const { includeShared = false } = options;
  const supabase = createClient();
  const [items, setItems] = useState<T[]>([]);
  const [sharedItems, setSharedItems] = useState<T[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCurrentUserId(null);
      setItems([]);
      setSharedItems([]);
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("user_id", user.id)
      .order(orderBy, { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setItems((data as T[]) ?? []);
    }

    if (includeShared) {
      const { data: sharedIds } = await supabase
        .from("shares")
        .select("record_id")
        .eq("table_name", table)
        .eq("shared_with_id", user.id);

      const ids = (sharedIds ?? []).map((s) => s.record_id);
      if (ids.length > 0) {
        const { data: shared } = await supabase.from(table).select("*").in("id", ids);
        setSharedItems((shared as T[]) ?? []);
      } else {
        setSharedItems([]);
      }
    }

    setLoading(false);
  }, [table, orderBy, includeShared]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (values: Partial<T>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: "Usuário não autenticado" };

      const { error } = await supabase
        .from(table)
        .insert([{ ...values, user_id: user.id }]);

      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [table, refresh] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const update = useCallback(
    async (id: string, values: Partial<T>) => {
      const { error } = await supabase.from(table).update(values as any).eq("id", id);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [table, refresh] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [table, refresh] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { items, sharedItems, currentUserId, loading, error, refresh, create, update, remove };
}
