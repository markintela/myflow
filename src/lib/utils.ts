import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RecurrenceType } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Datas do app são "YYYY-MM-DD" (date column do Postgres) — parse manual
// evita o shift de timezone do `new Date("YYYY-MM-DD")` (interpretado como
// UTC meia-noite pelo JS).
export function parseDateOnly(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function startOfWeek(date: Date) {
  return addDays(date, -date.getDay());
}

// "Mês financeiro": intervalo de `startDay` deste mês até `startDay - 1` do
// mês seguinte (ex.: startDay=25 -> 25/jul a 24/ago). Usado em vez do mês de
// calendário (1º ao último dia) para os cálculos mensais de despesas/receitas,
// já que muita gente organiza o orçamento em torno do dia do salário.
export function getFinancialMonthRange(startDay: number, refDate: Date = new Date()) {
  const y = refDate.getFullYear();
  const m = refDate.getMonth();
  const startMonth = refDate.getDate() >= startDay ? m : m - 1;
  const start = new Date(y, startMonth, startDay);
  const end = new Date(y, startMonth + 1, startDay - 1);
  return { start, end };
}

export function formatFinancialMonthLabel(startDay: number, refDate: Date = new Date()) {
  const { start, end } = getFinancialMonthRange(startDay, refDate);
  if (startDay === 1) {
    return end.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }
  const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return `${fmt(start)} – ${fmt(end)}`;
}

// Filtro de período reutilizável (semana/mês/ano) para listas de
// despesas/receitas — "mês" usa o mês financeiro (dia configurável em
// Perfil), "semana" e "ano" usam limites de calendário padrão.
export type PeriodMode = "semana" | "mes" | "ano";

export function getPeriodRange(mode: PeriodMode, cursor: Date, monthStartDay: number) {
  if (mode === "semana") {
    const start = startOfWeek(cursor);
    return { start, end: addDays(start, 6) };
  }
  if (mode === "ano") {
    return { start: new Date(cursor.getFullYear(), 0, 1), end: new Date(cursor.getFullYear(), 11, 31) };
  }
  return getFinancialMonthRange(monthStartDay, cursor);
}

export function isInPeriod(dateStr: string, start: Date, end: Date) {
  const date = parseDateOnly(dateStr);
  return date >= start && date <= end;
}

export function formatPeriodLabel(mode: PeriodMode, cursor: Date, monthStartDay: number) {
  if (mode === "semana") {
    const { start, end } = getPeriodRange(mode, cursor, monthStartDay);
    const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    return `${fmt(start)} – ${fmt(end)}`;
  }
  if (mode === "ano") {
    return `${cursor.getFullYear()}`;
  }
  return formatFinancialMonthLabel(monthStartDay, cursor);
}

export function periodStep(mode: PeriodMode, date: Date, dir: 1 | -1) {
  if (mode === "semana") return addDays(date, dir * 7);
  if (mode === "ano") return addMonths(date, dir * 12);
  return addMonths(date, dir * 1);
}

export type RecurringItem = {
  date: string;
  recurrenceType: RecurrenceType;
  recurrenceEnd: string | null;
};

// Verifica se um item com repetição (semanal/mensal/anual) ocorre no dia
// `d`, a partir da data original até a data de término (se houver). Mesma
// lógica usada para projetar recorrências no calendário — mantida aqui para
// que os totais mensais (dashboard/despesas) enxerguem as mesmas ocorrências
// que o calendário mostra.
export function matchesRecurrence(item: RecurringItem, d: Date) {
  const origin = parseDateOnly(item.date);
  if (d < origin) return false;
  if (item.recurrenceEnd && d > parseDateOnly(item.recurrenceEnd)) return false;

  if (item.recurrenceType === "weekly") {
    const diffDays = Math.round((d.getTime() - origin.getTime()) / 86400000);
    return diffDays % 7 === 0;
  }
  if (item.recurrenceType === "monthly") {
    const daysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return d.getDate() === Math.min(origin.getDate(), daysInTargetMonth);
  }
  if (item.recurrenceType === "yearly") {
    const daysInTargetMonth = new Date(d.getFullYear(), origin.getMonth() + 1, 0).getDate();
    return d.getMonth() === origin.getMonth() && d.getDate() === Math.min(origin.getDate(), daysInTargetMonth);
  }
  return false;
}

// Um item sem repetição "ocorre" no período se sua data cair dentro dele;
// um item recorrente ocorre no período se alguma projeção da recorrência
// cair dentro dele (ex.: despesa fixa mensal criada em julho conta em
// agosto, não só no mês em que foi cadastrada).
export function occursInRange(item: RecurringItem, start: Date, end: Date) {
  if (item.recurrenceType === "none") {
    return isInPeriod(item.date, start, end);
  }
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    if (matchesRecurrence(item, d)) return true;
  }
  return false;
}
