-- MYFLOW — migração: renda, tipos/categorias de despesa, compartilhamento e rateio
-- Rode este script no SQL Editor do seu projeto Supabase.

-- ========== PROFILES ==========
-- Espelha auth.users para permitir buscar outro usuário por email (client não
-- tem acesso a auth.users diretamente).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- backfill de usuários já existentes
insert into public.profiles (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name' from auth.users
on conflict (id) do nothing;

-- A policy de select de profiles que também permite ver o perfil de quem
-- compartilhou/recebeu algo é criada mais abaixo, depois que a tabela
-- public.shares existir (ela é referenciada na condição).

-- ========== BUSCA DE USUÁRIO POR EMAIL ==========
-- Único jeito de resolver "esse email já tem conta?" sem abrir select amplo
-- em profiles (o que vazaria a lista inteira de usuários).

create or replace function public.get_profile_by_email(lookup_email text)
returns table (id uuid, email text, full_name text)
language sql
security definer
set search_path = public
as $$
  select id, email, full_name from public.profiles where email = lower(lookup_email) limit 1;
$$;

revoke all on function public.get_profile_by_email(text) from public;
grant execute on function public.get_profile_by_email(text) to authenticated;

-- ========== SHARES ==========
-- Tabela genérica/polimórfica reaproveitada por todas as áreas do app.
-- Compartilhado = somente leitura para quem recebe.

create table if not exists public.shares (
  id uuid primary key default uuid_generate_v4(),
  table_name text not null check (table_name in (
    'tasks', 'studies', 'health_logs', 'expenses', 'leisure_events',
    'events', 'birthdays', 'income_sources'
  )),
  record_id uuid not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  shared_with_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (table_name, record_id, shared_with_id),
  check (owner_id <> shared_with_id)
);

alter table public.shares enable row level security;

create policy "select_related_shares" on public.shares
  for select using (auth.uid() = owner_id or auth.uid() = shared_with_id);
create policy "insert_own_shares" on public.shares
  for insert with check (auth.uid() = owner_id);
create policy "delete_own_shares" on public.shares
  for delete using (auth.uid() = owner_id);

create index if not exists idx_shares_lookup on public.shares(table_name, record_id);
create index if not exists idx_shares_shared_with on public.shares(shared_with_id);

-- Agora que public.shares existe, cria a policy de profiles que também
-- permite ver o perfil de quem compartilhou/recebeu algo com você.
create policy "select_own_or_related_profiles" on public.profiles
  for select using (
    auth.uid() = id
    or exists (
      select 1 from public.shares s
      where (s.owner_id = auth.uid() and s.shared_with_id = profiles.id)
         or (s.shared_with_id = auth.uid() and s.owner_id = profiles.id)
    )
  );

-- ========== VISIBILIDADE COMPARTILHADA NAS TABELAS EXISTENTES ==========

do $$
declare
  t text;
begin
  foreach t in array array['tasks','studies','health_logs','expenses','leisure_events','events','birthdays']
  loop
    execute format('drop policy if exists "select_own_%1$s" on public.%1$s', t);
    execute format('drop policy if exists "select_own_or_shared_%1$s" on public.%1$s', t);
    execute format('
      create policy "select_own_or_shared_%1$s" on public.%1$s
        for select using (
          auth.uid() = user_id
          or exists (
            select 1 from public.shares s
            where s.table_name = %1$L and s.record_id = %1$s.id and s.shared_with_id = auth.uid()
          )
        );
    ', t);
  end loop;
end $$;

-- ========== DESPESAS: TIPO E RATEIO ==========

alter table public.expenses
  add column if not exists expense_type text not null default 'variavel'
  check (expense_type in ('fixa', 'variavel'));

create table if not exists public.expense_splits (
  id uuid primary key default uuid_generate_v4(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10,2) not null,
  created_at timestamptz not null default now(),
  unique (expense_id, user_id)
);

alter table public.expense_splits enable row level security;

create policy "select_related_expense_splits" on public.expense_splits
  for select using (
    auth.uid() = user_id
    or auth.uid() = (select e.user_id from public.expenses e where e.id = expense_id)
  );
create policy "insert_owner_expense_splits" on public.expense_splits
  for insert with check (auth.uid() = (select e.user_id from public.expenses e where e.id = expense_id));
create policy "update_owner_expense_splits" on public.expense_splits
  for update using (auth.uid() = (select e.user_id from public.expenses e where e.id = expense_id));
create policy "delete_owner_expense_splits" on public.expense_splits
  for delete using (auth.uid() = (select e.user_id from public.expenses e where e.id = expense_id));

create index if not exists idx_expense_splits_expense on public.expense_splits(expense_id);
create index if not exists idx_expense_splits_user on public.expense_splits(user_id);

-- ========== RENDA ==========

create table if not exists public.income_sources (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  income_type text not null check (income_type in ('fixo', 'variavel')),
  amount numeric(10,2) not null,
  income_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.income_sources enable row level security;

create policy "select_own_or_shared_income_sources" on public.income_sources
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.shares s
      where s.table_name = 'income_sources' and s.record_id = income_sources.id and s.shared_with_id = auth.uid()
    )
  );
create policy "insert_own_income_sources" on public.income_sources
  for insert with check (auth.uid() = user_id);
create policy "update_own_income_sources" on public.income_sources
  for update using (auth.uid() = user_id);
create policy "delete_own_income_sources" on public.income_sources
  for delete using (auth.uid() = user_id);

create index if not exists idx_income_sources_user on public.income_sources(user_id);
