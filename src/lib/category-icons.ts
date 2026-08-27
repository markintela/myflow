import {
  Home,
  UtensilsCrossed,
  Car,
  GraduationCap,
  Waves,
  HeartPulse,
  Sparkles,
  PiggyBank,
  User,
  Smartphone,
  Shield,
  PartyPopper,
  Package,
  type LucideIcon,
} from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/lib/types";

// Ícone por categoria de despesa — usado na página de Despesas (cards/lista)
// e nos gráficos do dashboard, então fica centralizado aqui.
export const CATEGORY_ICON: Record<string, LucideIcon> = {
  moradia: Home,
  alimentacao: UtensilsCrossed,
  transporte: Car,
  educacao: GraduationCap,
  lazer: Waves,
  saude: HeartPulse,
  bem_estar: Sparkles,
  investimentos: PiggyBank,
  pessoal: User,
  aplicativos: Smartphone,
  seguros: Shield,
  eventos: PartyPopper,
  outros: Package,
};

export const CATEGORY_ICON_BY_LABEL: Record<string, LucideIcon> = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.label, CATEGORY_ICON[c.value] ?? Package])
);
