import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Compara com base no fuso local — as datas do app são "YYYY-MM-DD" (date
// column do Postgres), então parse manual evita o shift de timezone do
// `new Date("YYYY-MM-DD")` (interpretado como UTC meia-noite pelo JS).
export function isInCurrentMonth(dateStr: string) {
  const [year, month] = dateStr.split("-").map(Number);
  const now = new Date();
  return year === now.getFullYear() && month === now.getMonth() + 1;
}
