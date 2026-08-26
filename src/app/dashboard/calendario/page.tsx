"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Wallet, Landmark, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useCrud } from "@/hooks/use-crud";
import { useProfile } from "@/hooks/use-profile";
import { getFinancialMonthRange, formatFinancialMonthLabel } from "@/lib/utils";
import type { Task, Study, HealthLog, Expense, IncomeSource, Birthday, LeisureEvent, Event, RecurrenceType } from "@/lib/types";

type CalendarEvent = {
  date: string;
  label: string;
  area: string;
  recurrenceType: RecurrenceType;
  recurrenceEnd: string | null;
};
type ViewMode = "dia" | "semana" | "mes" | "trimestre" | "semestre" | "ano";

const AREA_COLOR: Record<string, string> = {
  tarefa: "#2563EB",
  educacao: "#2563EB",
  saude: "#16A34A",
  receita: "#D97706",
  despesa: "#0891B2",
  lazer: "#10B981",
  evento: "#7C3AED",
  aniversario: "#1E40AF",
};

const VIEW_LABEL: Record<ViewMode, string> = {
  dia: "Dia",
  semana: "Semana",
  mes: "Mês",
  trimestre: "Trimestre",
  semestre: "Semestre",
  ano: "Ano",
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_ABBR = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// Datas do app são "YYYY-MM-DD" — parse manual evita o shift de timezone de
// `new Date("YYYY-MM-DD")` (interpretado como UTC meia-noite pelo JS).
function parseDateOnly(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay());
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Verifica se um evento com repetição (semanal/mensal/anual) ocorre no dia
// `d`, a partir da data original até a data de término (se houver).
function matchesRecurrence(e: CalendarEvent, d: Date) {
  const origin = parseDateOnly(e.date);
  if (d < origin) return false;
  if (e.recurrenceEnd && d > parseDateOnly(e.recurrenceEnd)) return false;

  if (e.recurrenceType === "weekly") {
    const diffDays = Math.round((d.getTime() - origin.getTime()) / 86400000);
    return diffDays % 7 === 0;
  }
  if (e.recurrenceType === "monthly") {
    const daysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return d.getDate() === Math.min(origin.getDate(), daysInTargetMonth);
  }
  if (e.recurrenceType === "yearly") {
    const daysInTargetMonth = new Date(d.getFullYear(), origin.getMonth() + 1, 0).getDate();
    return d.getMonth() === origin.getMonth() && d.getDate() === Math.min(origin.getDate(), daysInTargetMonth);
  }
  return false;
}

// Página de calendário: agrega eventos de todas as tabelas (tarefas com
// prazo, educação, despesas, lazer, eventos e aniversários) com navegação
// entre períodos e 6 visões (dia/semana/mês/trimestre/semestre/ano).
export default function CalendarioPage() {
  const tasks = useCrud<Task>("tasks");
  const studies = useCrud<Study>("studies", "study_date");
  const health = useCrud<HealthLog>("health_logs", "log_date");
  const expenses = useCrud<Expense>("expenses", "expense_date");
  const income = useCrud<IncomeSource>("income_sources", "income_date");
  const birthdays = useCrud<Birthday>("birthdays", "birth_date");
  const leisure = useCrud<LeisureEvent>("leisure_events", "event_date");
  const events = useCrud<Event>("events", "event_date");
  const { profile } = useProfile();
  const monthStartDay = profile?.month_start_day ?? 25;

  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState<ViewMode>("mes");
  const today = new Date();

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const list: CalendarEvent[] = [];
    const push = (
      date: string | null,
      label: string,
      area: string,
      recurrenceType: RecurrenceType = "none",
      recurrenceEnd: string | null = null
    ) => {
      if (!date) return;
      list.push({ date, label, area, recurrenceType, recurrenceEnd });
    };

    tasks.items.forEach((t) => push(t.due_date, t.title, "tarefa", t.recurrence_type, t.recurrence_end_date));
    studies.items.forEach((s) => push(s.study_date, s.subject, "educacao", s.recurrence_type, s.recurrence_end_date));
    health.items.forEach((h) => push(h.log_date, h.value, "saude", h.recurrence_type, h.recurrence_end_date));
    expenses.items.forEach((e) =>
      push(e.expense_date, e.description, "despesa", e.recurrence_type, e.recurrence_end_date)
    );
    income.items.forEach((i) => push(i.income_date, i.name, "receita", i.recurrence_type, i.recurrence_end_date));
    leisure.items.forEach((l) => push(l.event_date, l.title, "lazer", l.recurrence_type, l.recurrence_end_date));
    events.items.forEach((e) => push(e.event_date, e.title, "evento", e.recurrence_type, e.recurrence_end_date));
    birthdays.items.forEach((b) =>
      push(b.birth_date, b.name, "aniversario", b.recurrence_type, b.recurrence_end_date)
    );
    return list;
  }, [tasks.items, studies.items, health.items, expenses.items, income.items, leisure.items, events.items, birthdays.items]);

  // Eventos sem repetição ficam num índice por data (O(1)); eventos com
  // repetição (semanal/mensal/anual) são checados dia a dia contra a data
  // original e a data de término, projetando pra frente indefinidamente.
  const { eventsByDate, recurringEvents } = useMemo(() => {
    const byDate: Record<string, CalendarEvent[]> = {};
    const recurring: CalendarEvent[] = [];
    calendarEvents.forEach((e) => {
      if (e.recurrenceType && e.recurrenceType !== "none") {
        recurring.push(e);
      } else {
        const key = dateKey(parseDateOnly(e.date));
        (byDate[key] ??= []).push(e);
      }
    });
    return { eventsByDate: byDate, recurringEvents: recurring };
  }, [calendarEvents]);

  const eventsOn = (d: Date) => {
    const exact = eventsByDate[dateKey(d)] ?? [];
    const projected = recurringEvents.filter((e) => matchesRecurrence(e, d));
    return [...exact, ...projected];
  };

  const STEP: Record<ViewMode, (d: Date, dir: 1 | -1) => Date> = {
    dia: (d, dir) => addDays(d, dir * 1),
    semana: (d, dir) => addDays(d, dir * 7),
    mes: (d, dir) => addMonths(d, dir * 1),
    trimestre: (d, dir) => addMonths(d, dir * 3),
    semestre: (d, dir) => addMonths(d, dir * 6),
    ano: (d, dir) => addMonths(d, dir * 12),
  };

  const goTo = (dir: 1 | -1) => setCursor((c) => STEP[view](c, dir));
  const goToday = () => setCursor(new Date());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const periodLabel = useMemo(() => {
    if (view === "dia") {
      return cursor.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
    if (view === "semana") {
      const start = startOfWeek(cursor);
      const end = addDays(start, 6);
      const sameMonth = start.getMonth() === end.getMonth();
      const startLabel = `${start.getDate()}${sameMonth ? "" : ` de ${MONTH_ABBR[start.getMonth()]}`}`;
      const endLabel = `${end.getDate()} de ${MONTH_ABBR[end.getMonth()]} de ${end.getFullYear()}`;
      return `${startLabel} – ${endLabel}`;
    }
    if (view === "mes") {
      return cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    }
    if (view === "trimestre") {
      const q = Math.floor(month / 3);
      return `${q + 1}º trimestre de ${year} (${MONTH_ABBR[q * 3]}–${MONTH_ABBR[q * 3 + 2]})`;
    }
    if (view === "semestre") {
      const s = Math.floor(month / 6);
      return `${s + 1}º semestre de ${year} (${MONTH_ABBR[s * 6]}–${MONTH_ABBR[s * 6 + 5]})`;
    }
    return `${year}`;
  }, [cursor, view, month, year]);

  // Resumo de despesas/receitas do mês financeiro (dia configurável em
  // Perfil) que contém o mês de calendário exibido — só faz sentido na visão
  // "Mês", já que as demais visões não mapeiam 1:1 para um único período.
  const financialSummary = useMemo(() => {
    if (view !== "mes") return null;
    const { start, end } = getFinancialMonthRange(monthStartDay, new Date(year, month, 1));
    const inRange = (dateStr: string) => {
      const d = parseDateOnly(dateStr);
      return d >= start && d <= end;
    };
    const totalExpenses = expenses.items
      .filter((e) => inRange(e.expense_date))
      .reduce((s, e) => s + Number(e.amount || 0), 0);
    const totalIncome = income.items.reduce((s, i) => {
      if (i.income_type === "fixo") return s + Number(i.amount || 0);
      if (inRange(i.income_date)) return s + Number(i.amount || 0);
      return s;
    }, 0);
    return { totalExpenses, totalIncome, saldo: totalIncome - totalExpenses };
  }, [view, monthStartDay, year, month, expenses.items, income.items]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Calendário</h1>
      <p className="text-slate-500 text-sm mb-6">
        Tarefas, educação, saúde, despesas, receitas, lazer, eventos e aniversários, todos no mesmo lugar.
      </p>

      {financialSummary && (
        <Card className="mb-5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-brand-blue" />
              <CardTitle>Resumo financeiro do mês</CardTitle>
            </div>
            <span className="text-xs text-slate-400">{formatFinancialMonthLabel(monthStartDay, new Date(year, month, 1))}</span>
          </CardHeader>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-0.5">
                <Landmark size={13} />
                Receitas
              </div>
              <p className="text-lg font-mono font-medium text-brand-green">€{financialSummary.totalIncome.toFixed(2)}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-0.5">
                <Wallet size={13} />
                Despesas
              </div>
              <p className="text-lg font-mono font-medium text-brand-cyan">€{financialSummary.totalExpenses.toFixed(2)}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-0.5">
                {financialSummary.saldo >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                Saldo
              </div>
              <p className={`text-lg font-mono font-medium ${financialSummary.saldo >= 0 ? "text-brand-green" : "text-red-500"}`}>
                €{financialSummary.saldo.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 min-w-0">
            <CalendarDays size={18} className="text-brand-blue shrink-0" />
            <CardTitle className="capitalize truncate">{periodLabel}</CardTitle>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={goToday}
              className="text-xs font-medium text-slate-500 hover:text-brand-blue px-2 py-1 rounded-md hover:bg-brand-blueSoft"
            >
              Hoje
            </button>
            <div className="flex items-center gap-1 text-slate-400">
              <button onClick={() => goTo(-1)} className="hover:text-slate-600" aria-label="Anterior">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => goTo(1)} className="hover:text-slate-600" aria-label="Próximo">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </CardHeader>

        <div className="flex flex-wrap gap-1 mb-5 -mt-1">
          {(Object.keys(VIEW_LABEL) as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                view === v ? "bg-brand-blue text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {VIEW_LABEL[v]}
            </button>
          ))}
        </div>

        {view === "dia" && <DayView date={cursor} events={eventsOn(cursor)} />}
        {view === "semana" && <WeekView cursor={cursor} today={today} eventsOn={eventsOn} />}
        {view === "mes" && <MonthGrid year={year} month={month} today={today} eventsOn={eventsOn} />}
        {view === "trimestre" && (
          <MultiMonthGrid months={[0, 1, 2].map((i) => Math.floor(month / 3) * 3 + i)} year={year} today={today} eventsOn={eventsOn} cols={3} />
        )}
        {view === "semestre" && (
          <MultiMonthGrid months={[0, 1, 2, 3, 4, 5].map((i) => Math.floor(month / 6) * 6 + i)} year={year} today={today} eventsOn={eventsOn} cols={3} />
        )}
        {view === "ano" && (
          <MultiMonthGrid months={Array.from({ length: 12 }, (_, i) => i)} year={year} today={today} eventsOn={eventsOn} cols={4} />
        )}
      </Card>
    </div>
  );
}

function EventChip({ e }: { e: CalendarEvent }) {
  return (
    <div
      className="text-[9.5px] truncate rounded px-1 py-0.5 text-white"
      style={{ background: AREA_COLOR[e.area] }}
      title={e.label}
    >
      {e.label}
    </div>
  );
}

function DayView({ date, events }: { date: Date; events: CalendarEvent[] }) {
  return (
    <div>
      {events.length === 0 ? (
        <p className="text-sm text-slate-400">Nada registrado neste dia.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((e, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: AREA_COLOR[e.area] }} />
              <span className="text-slate-700">{e.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WeekView({
  cursor,
  today,
  eventsOn,
}: {
  cursor: Date;
  today: Date;
  eventsOn: (d: Date) => CalendarEvent[];
}) {
  const start = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="grid grid-cols-7 gap-1.5 min-w-[640px]">
        {days.map((d) => {
          const dayEvents = eventsOn(d);
          const isToday = isSameDay(d, today);
          return (
            <div
              key={d.toISOString()}
              className={`min-h-[140px] rounded-lg p-1.5 border ${
                isToday ? "border-brand-blue bg-brand-blueSoft/40" : "border-slate-100"
              }`}
            >
              <div className={`text-[11px] mb-1 ${isToday ? "text-brand-blue font-semibold" : "text-slate-500"}`}>
                {WEEKDAYS[d.getDay()]} {d.getDate()}
                {d.getDate() === 1 && ` de ${MONTH_ABBR[d.getMonth()]}`}
              </div>
              <div className="flex flex-col gap-0.5">
                {dayEvents.map((e, j) => (
                  <EventChip key={j} e={e} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthGrid({
  year,
  month,
  today,
  eventsOn,
}: {
  year: number;
  month: number;
  today: Date;
  eventsOn: (d: Date) => CalendarEvent[];
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="min-w-[560px]">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-medium text-slate-400">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const date = d ? new Date(year, month, d) : null;
            const isToday = date && isSameDay(date, today);
            return (
              <div
                key={i}
                className={`min-h-[76px] rounded-lg p-1.5 border ${
                  isToday ? "border-brand-blue bg-brand-blueSoft/40" : "border-slate-100"
                }`}
              >
                {d && date && (
                  <>
                    <div className={`text-[11px] mb-1 ${isToday ? "text-brand-blue font-semibold" : "text-slate-500"}`}>
                      {d}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {eventsOn(date)
                        .slice(0, 3)
                        .map((e, j) => (
                          <EventChip key={j} e={e} />
                        ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniMonth({
  year,
  month,
  today,
  eventsOn,
}: {
  year: number;
  month: number;
  today: Date;
  eventsOn: (d: Date) => CalendarEvent[];
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="border border-slate-100 rounded-lg p-2">
      <p className="text-xs font-semibold text-slate-700 capitalize mb-1.5">
        {new Date(year, month, 1).toLocaleDateString("pt-BR", { month: "long" })}
      </p>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((d, i) => {
          const date = d ? new Date(year, month, d) : null;
          const isToday = date && isSameDay(date, today);
          const dayEvents = date ? eventsOn(date) : [];
          const areas = Array.from(new Set(dayEvents.map((e) => e.area))).slice(0, 3);
          return (
            <div key={i} className="flex flex-col items-center justify-start gap-0.5 py-0.5">
              {d && (
                <>
                  <span
                    className={`text-[9px] w-4 h-4 flex items-center justify-center rounded-full ${
                      isToday ? "bg-brand-blue text-white font-semibold" : "text-slate-500"
                    }`}
                  >
                    {d}
                  </span>
                  <div className="flex gap-0.5 h-1">
                    {areas.map((a) => (
                      <span key={a} className="w-1 h-1 rounded-full" style={{ background: AREA_COLOR[a] }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tailwind precisa das classes de grid-cols escritas por extenso no código
// para gerá-las — não dá pra montar "grid-cols-" + cols dinamicamente.
const GRID_COLS: Record<number, string> = {
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

function MultiMonthGrid({
  months,
  year,
  today,
  eventsOn,
  cols,
}: {
  months: number[];
  year: number;
  today: Date;
  eventsOn: (d: Date) => CalendarEvent[];
  cols: number;
}) {
  return (
    <div className={`grid ${GRID_COLS[cols]} gap-3`}>
      {months.map((m) => (
        <MiniMonth key={m} year={year} month={m} today={today} eventsOn={eventsOn} />
      ))}
    </div>
  );
}
