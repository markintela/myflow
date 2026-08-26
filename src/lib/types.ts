export type RecurrenceType = "none" | "weekly" | "monthly" | "yearly";

export const RECURRENCE_OPTIONS = [
  { value: "none", label: "Não repete" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
] as const;

export type Task = {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  created_at: string;
};

export type Study = {
  id: string;
  user_id: string;
  subject: string;
  hours: number;
  study_date: string;
  notes: string | null;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  created_at: string;
};

export type HealthLog = {
  id: string;
  user_id: string;
  metric: "agua" | "sono" | "exercicio" | "outro";
  value: string;
  log_date: string;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  created_at: string;
};

export type ExpenseType = "fixa" | "variavel";

export type Expense = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  expense_type: ExpenseType;
  expense_date: string;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  created_at: string;
};

export const EXPENSE_CATEGORIES = [
  { value: "moradia", label: "Moradia" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "transporte", label: "Transporte" },
  { value: "educacao", label: "Educação" },
  { value: "lazer", label: "Lazer" },
  { value: "saude", label: "Saúde" },
  { value: "bem_estar", label: "Bem-estar" },
  { value: "investimentos", label: "Investimentos" },
  { value: "pessoal", label: "Pessoal" },
  { value: "aplicativos", label: "Aplicativos" },
  { value: "seguros", label: "Seguros" },
  { value: "eventos", label: "Eventos" },
  { value: "outros", label: "Outros" },
] as const;

export type ExpenseSplit = {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  created_at: string;
};

export type IncomeType = "fixo" | "variavel";

export type IncomeSource = {
  id: string;
  user_id: string;
  name: string;
  income_type: IncomeType;
  amount: number;
  income_date: string;
  notes: string | null;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  created_at: string;
};

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  date_of_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  phone: string | null;
  blood_type: BloodType | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  avatar_url: string | null;
  month_start_day: number;
  created_at: string;
};

export type Share = {
  id: string;
  table_name: TableName;
  record_id: string;
  owner_id: string;
  shared_with_id: string;
  created_at: string;
};

export type LeisureEvent = {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  location: string | null;
  notes: string | null;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  created_at: string;
};

export type Event = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  event_date: string;
  location: string | null;
  notes: string | null;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  created_at: string;
};

export type Birthday = {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  notes: string | null;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  created_at: string;
};

export type TableName =
  | "tasks"
  | "studies"
  | "health_logs"
  | "expenses"
  | "leisure_events"
  | "events"
  | "birthdays"
  | "income_sources";
