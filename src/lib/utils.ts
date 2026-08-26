import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Datas do app são "YYYY-MM-DD" (date column do Postgres) — parse manual
// evita o shift de timezone do `new Date("YYYY-MM-DD")` (interpretado como
// UTC meia-noite pelo JS).
function parseDateOnly(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
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
