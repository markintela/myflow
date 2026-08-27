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

// Uma cor própria e distinta por categoria (para o gráfico "Despesas do mês
// por categoria" e para a bolinha ao lado do título de cada card na página
// de Despesas). Nenhuma delas é reaproveitada nos outros gráficos do
// dashboard (que usam azul/verde/ciano/âmbar para Fixas/Variáveis e
// Receitas/Despesas). Validado com o script de acessibilidade da skill de
// dataviz (faixa de luminosidade, saturação mínima, separação entre
// categorias vizinhas para daltonismo) — como cada barra/card já mostra
// ícone + nome por extenso, a cor nunca é o único canal de identidade.
export const CATEGORY_COLOR: Record<string, string> = {
  moradia: "#766FEB",
  alimentacao: "#E84F70",
  transporte: "#9965F1",
  educacao: "#E35795",
  lazer: "#D6A43B",
  saude: "#E14444",
  bem_estar: "#EC93B4",
  investimentos: "#87B742",
  pessoal: "#AB60EF",
  aplicativos: "#2FA399",
  seguros: "#6C64D6",
  eventos: "#B06146",
  outros: "#9A53D9",
};

export const CATEGORY_COLOR_BY_LABEL: Record<string, string> = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.label, CATEGORY_COLOR[c.value] ?? "#94A3B8"])
);
