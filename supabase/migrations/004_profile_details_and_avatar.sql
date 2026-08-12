-- MYFLOW — migração: dados pessoais e foto de perfil
-- Rode este script no SQL Editor do seu projeto Supabase.

-- ========== DADOS PESSOAIS EM PROFILES ==========

alter table public.profiles
  add column if not exists date_of_birth date,
  add column if not exists height_cm numeric(5,1),
  add column if not exists weight_kg numeric(5,1),
  add column if not exists phone text,
  add column if not exists blood_type text check (blood_type in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists avatar_url text;

-- profiles só tinha policy de select até aqui — falta permitir que cada
-- usuário edite os próprios dados pessoais.
drop policy if exists "update_own_profile" on public.profiles;
create policy "update_own_profile" on public.profiles
  for update using (auth.uid() = id);

-- ========== BUCKET DE AVATAR ==========
-- Guardamos só a foto já reduzida (thumbnail) no Storage — nunca como bytes
-- na tabela — para não sobrecarregar o banco. Bucket público de leitura
-- (é só um thumbnail pequeno); escrita restrita à própria pasta do usuário.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar_public_read" on storage.objects;
create policy "avatar_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatar_owner_insert" on storage.objects;
create policy "avatar_owner_insert" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatar_owner_update" on storage.objects;
create policy "avatar_owner_update" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatar_owner_delete" on storage.objects;
create policy "avatar_owner_delete" on storage.objects
  for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
