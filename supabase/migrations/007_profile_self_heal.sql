-- MYFLOW — migração: permitir que o próprio usuário crie sua linha em profiles
-- Rode este script no SQL Editor do seu projeto Supabase.

-- Até aqui só o trigger handle_new_user (security definer) conseguia inserir
-- em profiles. Se por qualquer motivo a linha não existir (ex.: trigger não
-- rodou a tempo, conta criada antes dele existir), o app trava com 406 ao
-- buscar o perfil (select .single()/.maybeSingle() sem nenhuma linha) e não
-- há como o cliente se recuperar sozinho. Esta policy permite que o app
-- crie a própria linha quando ela estiver faltando.
drop policy if exists "insert_own_profile" on public.profiles;
create policy "insert_own_profile" on public.profiles
  for insert with check (auth.uid() = id);
