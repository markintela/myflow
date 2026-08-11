"use client";

import { ListChecks, BookOpen, HeartPulse, Wallet, Gift, Waves, CalendarPlus } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useCrud } from "@/hooks/use-crud";
import type { Task, Study, Expense, Birthday, LeisureEvent, Event } from "@/lib/types";

// Visão geral "Hoje": puxa um resumo de cada tabela via Supabase.
export default function HojePage() {
  const tasks = useCrud<Task>("tasks");
  const studies = useCrud<Study>("studies", "study_date");
  const expenses = useCrud<Expense>("expenses", "expense_date");
  const birthdays = useCrud<Birthday>("birthdays", "birth_date");
  const leisure = useCrud<LeisureEvent>("leisure_events", "event_date");
  const events = useCrud<Event>("events", "event_date");

  const pendingTasks = tasks.items.filter((t) => !t.done);
  const totalExpenses = expenses.items.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalStudyHours = studies.items.reduce((s, st) => s + Number(st.hours || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Visão geral</h1>
      <p className="text-slate-500 text-sm mb-6">Um resumo rápido de todas as áreas da sua vida.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Tarefas pendentes</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-brand-blueSoft flex items-center justify-center">
              <ListChecks size={16} className="text-brand-blue" />
            </div>
          </CardHeader>
          {tasks.loading ? (
            <p className="text-sm text-slate-400">Carregando...</p>
          ) : pendingTasks.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma tarefa pendente 🎉</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pendingTasks.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <Checkbox checked={t.done} onCheckedChange={(v) => tasks.update(t.id, { done: v } as any)} />
                  <span className="text-sm text-slate-700">{t.title}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Educação</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-brand-blueSoft flex items-center justify-center">
              <BookOpen size={16} className="text-brand-blue" />
            </div>
          </CardHeader>
          <p className="text-2xl font-mono font-medium">{totalStudyHours.toFixed(1)}h</p>
          <p className="text-xs text-slate-400 mt-1">total de horas registradas</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-brand-cyanSoft flex items-center justify-center">
              <Wallet size={16} className="text-brand-cyan" />
            </div>
          </CardHeader>
          <p className="text-2xl font-mono font-medium">€{totalExpenses.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">total registrado</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximo lazer</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-brand-greenSoft flex items-center justify-center">
              <Waves size={16} className="text-brand-green" />
            </div>
          </CardHeader>
          {leisure.items.length === 0 ? (
            <p className="text-sm text-slate-400">Nada agendado ainda.</p>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-800">{leisure.items[0].title}</p>
              <p className="text-xs text-slate-400 mt-1">{leisure.items[0].event_date}</p>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos eventos</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-brand-blueSoft flex items-center justify-center">
              <CalendarPlus size={16} className="text-brand-blue" />
            </div>
          </CardHeader>
          {events.items.length === 0 ? (
            <p className="text-sm text-slate-400">Nada agendado ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {events.items.slice(0, 3).map((e) => (
                <li key={e.id} className="text-sm text-slate-700">
                  {e.title} <span className="text-slate-400 text-xs">· {e.event_date}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aniversários</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-brand-blueSoft flex items-center justify-center">
              <Gift size={16} className="text-brand-blue" />
            </div>
          </CardHeader>
          {birthdays.items.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum cadastrado ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {birthdays.items.slice(0, 3).map((b) => (
                <li key={b.id} className="text-sm text-slate-700">
                  {b.name} <span className="text-slate-400 text-xs">· {b.birth_date}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saúde</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-brand-greenSoft flex items-center justify-center">
              <HeartPulse size={16} className="text-brand-green" />
            </div>
          </CardHeader>
          <p className="text-sm text-slate-500">
            Registre água, sono e exercício na aba <span className="font-medium text-slate-700">Saúde</span>.
          </p>
        </Card>
      </div>
    </div>
  );
}
