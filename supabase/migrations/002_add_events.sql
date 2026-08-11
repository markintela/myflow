-- MYFLOW — migração: adiciona a tabela "events" (página Eventos)
-- Rode este script no SQL Editor do seu projeto Supabase.

create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null default 'outro',
  event_date date not null,
  location text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "select_own_events" on public.events
  for select using (auth.uid() = user_id);
create policy "insert_own_events" on public.events
  for insert with check (auth.uid() = user_id);
create policy "update_own_events" on public.events
  for update using (auth.uid() = user_id);
create policy "delete_own_events" on public.events
  for delete using (auth.uid() = user_id);

create index if not exists idx_events_user on public.events(user_id);
