"use client";

import { ListChecks, BookOpen, HeartPulse, Wallet, Gift, Waves, CalendarPlus, TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useCrud } from "@/hooks/use-crud";
import { useProfile } from "@/hooks/use-profile";
import { isInFinancialMonth, formatFinancialMonthLabel } from "@/lib/utils";
import { EXPENSE_CATEGORIES, type Task, type Study, type Expense, type Birthday, type LeisureEvent, type Event, type IncomeSource } from "@/lib/types";

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.value, c.label])
);

// Visão geral "Hoje": puxa um resumo de cada tabela via Supabase.
export default function HojePage() {
  const tasks = useCrud<Task>("tasks");
  const studies = useCrud<Study>("studies", "study_date");
  const expenses = useCrud<Expense>("expenses", "expense_date");
  const income = useCrud<IncomeSource>("income_sources", "income_date");
  const birthdays = useCrud<Birthday>("birthdays", "birth_date");
  const leisure = useCrud<LeisureEvent>("leisure_events", "event_date");
  const events = useCrud<Event>("events", "event_date");
  const { profile } = useProfile();
  const monthStartDay = profile?.month_start_day ?? 25;

  const pendingTasks = tasks.items.filter((t) => !t.done);
  const totalExpenses = expenses.items.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalStudyHours = studies.items.reduce((s, st) => s + Number(st.hours || 0), 0);

  const monthExpenses = expenses.items.filter((e) => isInFinancialMonth(e.expense_date, monthStartDay));
  const monthExpensesTotal = monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthIncomeTotal = income.items.reduce((s, i) => {
    if (i.income_type === "fixo") return s + Number(i.amount || 0);
    if (isInFinancialMonth(i.income_date, monthStartDay)) return s + Number(i.amount || 0);
    return s;
  }, 0);
  const saldo = monthIncomeTotal - monthExpensesTotal;

  const incomeVsExpenseData = [
    { name: "Receitas", value: monthIncomeTotal, color: "#2DAE60" },
    { name: "Despesas", value: monthExpensesTotal, color: "#269EBB" },
  ];

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const upcomingLeisure = leisure.items
    .filter((l) => l.event_date >= todayStr)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  const byCategory = Object.entries(
    monthExpenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount || 0);
      return acc;
    }, {})
  )
    .map(([category, value]) => ({ name: CATEGORY_LABEL[category] ?? category, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Visão geral</h1>
      <p className="text-slate-500 text-sm mb-6">Um resumo rápido de todas as áreas da sua vida.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader>
            <CardTitle>Saúde financeira do mês</CardTitle>
          </CardHeader>
          <p className="text-xs text-slate-400 -mt-2 mb-3">Período: {formatFinancialMonthLabel(monthStartDay)}</p>
          <div className="flex items-center gap-2 mb-3">
            {saldo >= 0 ? (
              <TrendingUp size={16} className="text-brand-green" />
            ) : (
              <TrendingDown size={16} className="text-red-500" />
            )}
            <p className={`text-2xl font-mono font-medium ${saldo >= 0 ? "text-brand-green" : "text-red-500"}`}>
              €{saldo.toFixed(2)}
            </p>
            <span className="text-xs text-slate-400">
              saldo {saldo >= 0 ? "positivo" : "negativo"} do mês
            </span>
          </div>
          {monthIncomeTotal === 0 && monthExpensesTotal === 0 ? (
            <p className="text-sm text-slate-400">
              Cadastre sua renda e suas despesas para acompanhar o mês.
            </p>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpenseData} layout="vertical" margin={{ left: 8, right: 24 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={70} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip formatter={(v) => `€${Number(v).toFixed(2)}`} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {incomeVsExpenseData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={(v) => `€${Number(v).toFixed(2)}`}
                      className="fill-slate-600"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas do mês por categoria</CardTitle>
          </CardHeader>
          {byCategory.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma despesa registrada este mês.</p>
          ) : (
            <div style={{ height: Math.max(byCategory.length * 32, 80) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} layout="vertical" margin={{ left: 8, right: 24 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={90} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip formatter={(v) => `€${Number(v).toFixed(2)}`} />
                  <Bar dataKey="value" fill="#269EBB" radius={[0, 4, 4, 0]} barSize={16}>
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={(v) => `€${Number(v).toFixed(2)}`}
                      className="fill-slate-600"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

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
          {upcomingLeisure.length === 0 ? (
            <p className="text-sm text-slate-400">Nada agendado ainda.</p>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-800">{upcomingLeisure[0].title}</p>
              <p className="text-xs text-slate-400 mt-1">{upcomingLeisure[0].event_date}</p>
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
