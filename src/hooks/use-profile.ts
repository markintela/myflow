"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToThumbnail } from "@/lib/image";
import type { Profile } from "@/lib/types";

// Dados pessoais do usuário logado — uma única linha em public.profiles,
// diferente do padrão de listas do useCrud.
export function useProfile() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (error) {
      setError(error.message);
    } else {
      setProfile(data as Profile);
    }
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(
    async (values: Partial<Profile>) => {
      if (!profile) return { error: "Perfil não carregado" };
      const { error } = await supabase.from("profiles").update(values).eq("id", profile.id);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [profile, refresh] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!profile) return { error: "Perfil não carregado" };

      let thumbnail: Blob;
      try {
        thumbnail = await resizeImageToThumbnail(file);
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Falha ao processar a imagem" };
      }

      const path = `${profile.id}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, thumbnail, { upsert: true, contentType: "image/jpeg" });

      if (uploadError) return { error: uploadError.message };

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatar_url = `${data.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url })
        .eq("id", profile.id);

      if (updateError) return { error: updateError.message };
      await refresh();
      return { error: null };
    },
    [profile, refresh] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { profile, loading, error, refresh, update, uploadAvatar };
}
