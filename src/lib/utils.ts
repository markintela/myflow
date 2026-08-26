import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function isInFinancialMonth(dateStr: string, startDay: number, refDate: Date = new Date()) {
  const date = parseDateOnly(dateStr);
  const { start, end } = getFinancialMonthRange(startDay, refDate);
  return date >= start && date <= end;
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
