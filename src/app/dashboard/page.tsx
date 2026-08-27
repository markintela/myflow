"use client";

import { useState } from "react";
import { ListChecks, BookOpen, HeartPulse, Wallet, Landmark, Gift, Waves, CalendarPlus, TrendingUp, TrendingDown } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Legend,
  type ChartOptions,
  type Plugin,
} from "chart.js";
import { Bar, Chart, Line } from "react-chartjs-2";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useCrud } from "@/hooks/use-crud";
import { useProfile } from "@/hooks/use-profile";
import { getFinancialMonthRange, formatFinancialMonthLabel, occursInRange, addMonths } from "@/lib/utils";
import { CATEGORY_COLOR_BY_LABEL } from "@/lib/category-icons";
import { EXPENSE_CATEGORIES, type Task, type Study, type Expense, type Birthday, type LeisureEvent, type Event, type IncomeSource } from "@/lib/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Legend
);

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.value, c.label])
);

// Versões suavizadas das cores "Fixa"/"Variável" (mais fortes nos badges da
// página de Despesas) — mais confortáveis num gráfico de barras cheio.
const FIXED_COLOR = "#5182EF";
const VARIABLE_COLOR = "#E19238";

// Formas de ponto alternadas no gráfico de despesas por categoria — cada
// categoria já tem sua própria cor, o formato ajuda a diferenciar ainda
// mais (útil também em escala de cinza / impressão).
const POINT_STYLES = ["circle", "rect", "triangle", "star", "rectRot", "crossRot"] as const;

// Desenha o valor (€) ao lado de cada barra — Chart.js não tem isso pronto
// como o LabelList do Recharts, então um plugin pequeno resolve.
const valueLabelsPlugin: Plugin<"bar"> = {
  id: "valueLabels",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta.hidden) return;
      meta.data.forEach((bar, index) => {
        const value = dataset.data[index];
        if (value == null) return;
        ctx.save();
        ctx.fillStyle = "#475569";
        ctx.font = "12px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`€${Number(value).toFixed(2)}`, bar.x + 6, bar.y);
        ctx.restore();
      });
    });
  },
};

// Mesma ideia, mas para barras verticais (o gráfico de tendência mensal) —
// desenha o valor só acima das barras (dataset 0), não da linha.
const verticalBarLabelsPlugin: Plugin<"bar"> = {
  id: "verticalBarLabels",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    meta.data.forEach((bar, index) => {
      const value = chart.data.datasets[0].data[index];
      if (value == null) return;
      ctx.save();
      ctx.fillStyle = "#475569";
      ctx.font = "11px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`€${Number(value).toFixed(0)}`, bar.x, bar.y - 4);
      ctx.restore();
    });
  },
};

function barOptions(stacked = false): ChartOptions<"bar"> {
  return {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#0f172a",
        bodyColor: "#334155",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 8,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label ? ctx.dataset.label + ": " : ""}€${Number(ctx.parsed.x).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: { display: false, stacked, grid: { display: false } },
      y: {
        stacked,
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#64748b", font: { size: 12 } },
      },
    },
  };
}

type OverviewTab = "pessoal" | "financeira";
const TAB_LABEL: Record<OverviewTab, string> = { pessoal: "Visão pessoal", financeira: "Visão financeira" };

// Visão geral "Hoje": puxa um resumo de cada tabela via Supabase.
export default function HojePage() {
  const [tab, setTab] = useState<OverviewTab>("pessoal");
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
  const totalIncome = income.items.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalStudyHours = studies.items.reduce((s, st) => s + Number(st.hours || 0), 0);

  // Despesa/receita recorrente (ex.: fixa mensal) conta no mês em que ela se
  // repete, não só no mês em que foi cadastrada — mesma lógica do calendário.
  const { start: monthStart, end: monthEnd } = getFinancialMonthRange(monthStartDay);
  const monthExpenses = expenses.items.filter((e) =>
    occursInRange({ date: e.expense_date, recurrenceType: e.recurrence_type, recurrenceEnd: e.recurrence_end_date }, monthStart, monthEnd)
  );
  const monthExpensesTotal = monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthIncomeTotal = income.items.reduce((s, i) => {
    if (i.income_type === "fixo") return s + Number(i.amount || 0);
    if (occursInRange({ date: i.income_date, recurrenceType: i.recurrence_type, recurrenceEnd: i.recurrence_end_date }, monthStart, monthEnd))
      return s + Number(i.amount || 0);
    return s;
  }, 0);
  const saldo = monthIncomeTotal - monthExpensesTotal;

  // Últimos 6 meses financeiros (mesmo dia de início configurado em Perfil)
  // para o gráfico de tendência: despesas em barra, receitas em linha.
  const trendMonths = Array.from({ length: 6 }, (_, i) => {
    const offset = 5 - i;
    const start = addMonths(monthStart, -offset);
    const end = addMonths(monthEnd, -offset);
    const expensesTotal = expenses.items
      .filter((e) =>
        occursInRange({ date: e.expense_date, recurrenceType: e.recurrence_type, recurrenceEnd: e.recurrence_end_date }, start, end)
      )
      .reduce((s, e) => s + Number(e.amount || 0), 0);
    const incomeTotal = income.items.reduce((s, inc) => {
      if (inc.income_type === "fixo") return s + Number(inc.amount || 0);
      if (occursInRange({ date: inc.income_date, recurrenceType: inc.recurrence_type, recurrenceEnd: inc.recurrence_end_date }, start, end))
        return s + Number(inc.amount || 0);
      return s;
    }, 0);
    return { label: end.toLocaleDateString("pt-BR", { month: "short" }), expensesTotal, incomeTotal };
  });
  const hasTrendData = trendMonths.some((m) => m.expensesTotal > 0 || m.incomeTotal > 0);

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

  const byCategoryByType = Object.entries(
    monthExpenses.reduce<Record<string, { fixa: number; variavel: number }>>((acc, e) => {
      const bucket = (acc[e.category] ??= { fixa: 0, variavel: 0 });
      bucket[e.expense_type] += Number(e.amount || 0);
      return acc;
    }, {})
  )
    .map(([category, v]) => ({ name: CATEGORY_LABEL[category] ?? category, ...v, total: v.fixa + v.variavel }))
    .sort((a, b) => b.total - a.total);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Visão geral</h1>
      <p className="text-slate-500 text-sm mb-4">Um resumo rápido de todas as áreas da sua vida.</p>

      <div className="flex items-center gap-1 mb-5">
        {(Object.keys(TAB_LABEL) as OverviewTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors ${
              tab === t ? "bg-brand-blue text-white" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {tab === "financeira" && (
      <>
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
          {!hasTrendData ? (
            <p className="text-sm text-slate-400">
              Cadastre sua renda e suas despesas para acompanhar o mês.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: "#33A4C0" }} />
                  Despesas
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2.5 h-0.5 rounded-full shrink-0" style={{ background: "#3AB36A" }} />
                  Receitas
                </span>
              </div>
              <div className="h-48">
                <Chart
                  type="bar"
                  data={{
                    labels: trendMonths.map((m) => m.label),
                    datasets: [
                      {
                        type: "bar" as const,
                        label: "Despesas",
                        data: trendMonths.map((m) => m.expensesTotal),
                        backgroundColor: "#33A4C0",
                        borderRadius: 4,
                        barThickness: 20,
                        order: 2,
                      },
                      {
                        type: "line" as const,
                        label: "Receitas",
                        data: trendMonths.map((m) => m.incomeTotal),
                        borderColor: "#3AB36A",
                        backgroundColor: "#3AB36A",
                        pointBackgroundColor: "#3AB36A",
                        pointRadius: 4,
                        pointHoverRadius: 5,
                        tension: 0.3,
                        fill: false,
                        order: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: "#fff",
                        titleColor: "#0f172a",
                        bodyColor: "#334155",
                        borderColor: "#e2e8f0",
                        borderWidth: 1,
                        padding: 8,
                        callbacks: {
                          label: (ctx) => `${ctx.dataset.label}: €${Number(ctx.parsed.y).toFixed(2)}`,
                        },
                      },
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { color: "#64748b", font: { size: 12 } },
                      },
                      y: { display: false, grid: { display: false } },
                    },
                  }}
                  plugins={[verticalBarLabelsPlugin]}
                />
              </div>
            </>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas do mês por categoria</CardTitle>
          </CardHeader>
          {byCategory.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma despesa registrada este mês.</p>
          ) : (
            <div className="h-64">
              <Line
                data={{
                  labels: byCategory.map((d) => d.name),
                  datasets: [
                    {
                      label: "Despesas",
                      data: byCategory.map((d) => d.value),
                      borderColor: "#cbd5e1",
                      backgroundColor: byCategory.map((d) => CATEGORY_COLOR_BY_LABEL[d.name] ?? "#33A4C0"),
                      pointBackgroundColor: byCategory.map((d) => CATEGORY_COLOR_BY_LABEL[d.name] ?? "#33A4C0"),
                      pointBorderColor: byCategory.map((d) => CATEGORY_COLOR_BY_LABEL[d.name] ?? "#33A4C0"),
                      pointStyle: byCategory.map((_, i) => POINT_STYLES[i % POINT_STYLES.length]),
                      pointRadius: 6,
                      pointHoverRadius: 8,
                      borderWidth: 1.5,
                      tension: 0.3,
                      fill: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "#fff",
                      titleColor: "#0f172a",
                      bodyColor: "#334155",
                      borderColor: "#e2e8f0",
                      borderWidth: 1,
                      padding: 8,
                      callbacks: {
                        label: (ctx) => `€${Number(ctx.parsed.y).toFixed(2)}`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: { color: "#64748b", font: { size: 11 }, maxRotation: 45, minRotation: 45 },
                    },
                    y: { display: false, grid: { display: false } },
                  },
                }}
              />
            </div>
          )}
        </Card>
      </div>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Fixas vs. variáveis por categoria</CardTitle>
        </CardHeader>
        {byCategoryByType.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma despesa registrada este mês.</p>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: FIXED_COLOR }} />
                Fixas
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: VARIABLE_COLOR }} />
                Variáveis
              </span>
            </div>
            <div style={{ height: Math.max(byCategoryByType.length * 32, 80) }}>
              <Bar
                data={{
                  labels: byCategoryByType.map((d) => d.name),
                  datasets: [
                    {
                      label: "Fixas",
                      data: byCategoryByType.map((d) => d.fixa),
                      backgroundColor: FIXED_COLOR,
                      stack: "tipo",
                      borderColor: "#fff",
                      borderWidth: 2,
                      barThickness: 16,
                    },
                    {
                      label: "Variáveis",
                      data: byCategoryByType.map((d) => d.variavel),
                      backgroundColor: VARIABLE_COLOR,
                      stack: "tipo",
                      borderColor: "#fff",
                      borderWidth: 2,
                      borderRadius: { topRight: 4, bottomRight: 4 },
                      barThickness: 16,
                    },
                  ],
                }}
                options={barOptions(true)}
              />
            </div>
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            <CardTitle>Receitas</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-brand-greenSoft flex items-center justify-center">
              <Landmark size={16} className="text-brand-green" />
            </div>
          </CardHeader>
          <p className="text-2xl font-mono font-medium">€{totalIncome.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">total registrado</p>
        </Card>
      </div>
      </>
      )}

      {tab === "pessoal" && (
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
      )}
    </div>
  );
}
