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

// Uma cor fixa por categoria (para o gráfico "Despesas do mês por
// categoria"). Combina as cores da marca (azul/verde/ciano/âmbar, já usadas
// em outras partes do app) com tons planos adicionais para as demais
// categorias. Validado com o script de acessibilidade da skill de dataviz
// (pares adjacentes, já que é um gráfico de barras — cada barra já tem
// ícone + rótulo de texto, então a cor nunca é o único canal de identidade).
export const CATEGORY_COLOR: Record<string, string> = {
  moradia: "#2563EB",
  alimentacao: "#D97706",
  transporte: "#0891B2",
  investimentos: "#EDA100",
  bem_estar: "#E87BA4",
  lazer: "#16A34A",
  educacao: "#4A3AA7",
  saude: "#E34948",
  aplicativos: "#0D9488",
  seguros: "#4338CA",
  eventos: "#92400E",
  pessoal: "#A21CAF",
  outros: "#4D7C0F",
};

export const CATEGORY_COLOR_BY_LABEL: Record<string, string> = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.label, CATEGORY_COLOR[c.value] ?? "#94A3B8"])
);
