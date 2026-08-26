-- MYFLOW — migração: dia de início do mês financeiro (parametrizável)
-- Rode este script no SQL Editor do seu projeto Supabase.

-- Define em que dia o "mês" começa para os cálculos mensais de despesas e
-- receitas (calendário e dashboard).
alter table public.profiles
  add column if not exists month_start_day smallint not null default 25
  check (month_start_day between 1 and 31);
