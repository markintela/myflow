"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useCrud } from "@/hooks/use-crud";
import type { Task, Study, Expense, Birthday, LeisureEvent, Event } from "@/lib/types";

type CalendarEvent = { date: string; label: string; area: string };

const AREA_COLOR: Record<string, string> = {
  tarefa: "#2563EB",
  educacao: "#2563EB",
  saude: "#16A34A",
  despesa: "#0891B2",
  lazer: "#10B981",
  evento: "#7C3AED",
  aniversario: "#1E40AF",
};

// Página de calendário: agrega eventos de todas as tabelas (tarefas com
// prazo, educação, despesas, lazer, eventos e aniversários) num único mês.
export default function CalendarioPage() {
  const tasks = useCrud<Task>("tasks");
  const studies = useCrud<Study>("studies", "study_date");
  const expenses = useCrud<Expense>("expenses", "expense_date");
  const birthdays = useCrud<Birthday>("birthdays", "birth_date");
  const leisure = useCrud<LeisureEvent>("leisure_events", "event_date");
  const events = useCrud<Event>("events", "event_date");

  const [cursor] = useState(new Date());

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const list: CalendarEvent[] = [];
    tasks.items.forEach((t) => t.due_date && list.push({ date: t.due_date, label: t.title, area: "tarefa" }));
    studies.items.forEach((s) => list.push({ date: s.study_date, label: s.subject, area: "educacao" }));
    expenses.items.forEach((e) => list.push({ date: e.expense_date, label: e.description, area: "despesa" }));
    leisure.items.forEach((l) => list.push({ date: l.event_date, label: l.title, area: "lazer" }));
    events.items.forEach((e) => list.push({ date: e.event_date, label: e.title, area: "evento" }));
    birthdays.items.forEach((b) => list.push({ date: b.birth_date, label: b.name, area: "aniversario" }));
    return list;
  }, [tasks.items, studies.items, expenses.items, leisure.items, events.items, birthdays.items]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay: Record<number, CalendarEvent[]> = {};
  calendarEvents.forEach((e) => {
    const d = new Date(e.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      eventsByDay[day] = eventsByDay[day] || [];
      eventsByDay[day].push(e);
    }
  });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const monthLabel = cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Calendário</h1>
      <p className="text-slate-500 text-sm mb-6">
        Tarefas, educação, despesas, lazer, eventos e aniversários, todos no mesmo lugar.
      </p>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-brand-blue" />
            <CardTitle className="capitalize">{monthLabel}</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <ChevronLeft size={18} className="cursor-pointer hover:text-slate-600" />
            <ChevronRight size={18} className="cursor-pointer hover:text-slate-600" />
          </div>
        </CardHeader>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className="text-center text-[11px] font-medium text-slate-400">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => (
            <div
              key={i}
              className={`min-h-[76px] rounded-lg p-1.5 border ${
                d && isToday(d) ? "border-brand-blue bg-brand-blueSoft/40" : "border-slate-100"
              }`}
            >
              {d && (
                <>
                  <div className={`text-[11px] mb-1 ${isToday(d) ? "text-brand-blue font-semibold" : "text-slate-500"}`}>
                    {d}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {(eventsByDay[d] || []).slice(0, 3).map((e, j) => (
                      <div
                        key={j}
                        className="text-[9.5px] truncate rounded px-1 py-0.5 text-white"
                        style={{ background: AREA_COLOR[e.area] }}
                        title={e.label}
                      >
                        {e.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
