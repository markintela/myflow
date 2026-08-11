-- MYFLOW — schema completo para Supabase (Postgres)
-- Rode este script no SQL Editor do seu projeto Supabase.

create extension if not exists "uuid-ossp";

-- ========== TABELAS ==========

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.studies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  hours numeric(5,2) not null default 0,
  study_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.health_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric text not null check (metric in ('agua', 'sono', 'exercicio', 'outro')),
  value text not null,
  log_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(10,2) not null,
  category text not null default 'outros',
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.leisure_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  event_date date not null,
  location text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.birthdays (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  birth_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

-- ========== ROW LEVEL SECURITY ==========
-- Cada usuário só acessa os próprios registros.

alter table public.tasks enable row level security;
alter table public.studies enable row level security;
alter table public.health_logs enable row level security;
alter table public.expenses enable row level security;
alter table public.leisure_events enable row level security;
alter table public.birthdays enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['tasks','studies','health_logs','expenses','leisure_events','birthdays']
  loop
    execute format('
      create policy "select_own_%1$s" on public.%1$s
        for select using (auth.uid() = user_id);
      create policy "insert_own_%1$s" on public.%1$s
        for insert with check (auth.uid() = user_id);
      create policy "update_own_%1$s" on public.%1$s
        for update using (auth.uid() = user_id);
      create policy "delete_own_%1$s" on public.%1$s
        for delete using (auth.uid() = user_id);
    ', t);
  end loop;
end $$;

-- ========== ÍNDICES ==========
create index if not exists idx_tasks_user on public.tasks(user_id);
create index if not exists idx_studies_user on public.studies(user_id);
create index if not exists idx_health_user on public.health_logs(user_id);
create index if not exists idx_expenses_user on public.expenses(user_id);
create index if not exists idx_leisure_user on public.leisure_events(user_id);
create index if not exists idx_birthdays_user on public.birthdays(user_id);
