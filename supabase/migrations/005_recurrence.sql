-- MYFLOW — migração: recorrência (semanal/mensal/anual, com data de término)
-- aplicada a todas as áreas com data: tarefas, estudos, saúde, despesas,
-- lazer, eventos, aniversários e renda.
-- Rode este script no SQL Editor do seu projeto Supabase.

do $$
declare
  t text;
begin
  foreach t in array array[
    'tasks', 'studies', 'health_logs', 'expenses',
    'leisure_events', 'events', 'birthdays', 'income_sources'
  ]
  loop
    execute format('
      alter table public.%1$I
        add column if not exists recurrence_type text not null default ''none''
          check (recurrence_type in (''none'', ''weekly'', ''monthly'', ''yearly'')),
        add column if not exists recurrence_end_date date;
    ', t);
  end loop;
end $$;

-- Backfill: preserva o comportamento que já existia antes deste campo ser
-- explícito — aniversários sempre repetiam anualmente (implícito na própria
-- ideia de aniversário) e despesas fixas já repetiam mensalmente no
-- calendário (era um caso especial hardcoded, agora substituído por isto).
update public.birthdays set recurrence_type = 'yearly' where recurrence_type = 'none';
update public.expenses set recurrence_type = 'monthly' where expense_type = 'fixa' and recurrence_type = 'none';
