export type Task = {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  created_at: string;
};

export type Study = {
  id: string;
  user_id: string;
  subject: string;
  hours: number;
  study_date: string;
  notes: string | null;
  created_at: string;
};

export type HealthLog = {
  id: string;
  user_id: string;
  metric: "agua" | "sono" | "exercicio" | "outro";
  value: string;
  log_date: string;
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  created_at: string;
};

export type LeisureEvent = {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  location: string | null;
  notes: string | null;
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
  created_at: string;
};

export type Birthday = {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  notes: string | null;
  created_at: string;
};

export type TableName =
  | "tasks"
  | "studies"
  | "health_logs"
  | "expenses"
  | "leisure_events"
  | "events"
  | "birthdays";
