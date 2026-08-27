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
// categoria"), em degradê azul -> verde — o mesmo estilo do fundo do menu
// lateral (brand-blue a brand-green) — para casar com a identidade visual
// do site. Nenhuma dessas cores é reaproveitada nos outros gráficos do
// dashboard. Como cada barra já mostra ícone + nome por extenso, a cor é um
// reforço visual/de marca, não o único canal de identidade — por isso o
// degradê prioriza casar com o site em vez de maximizar a distância entre
// tons vizinhos (o que um degradê suave, por natureza, não permite).
export const CATEGORY_COLOR: Record<string, string> = {
  moradia: "#0F67FF",
  alimentacao: "#0D6DFF",
  transporte: "#0A73F0",
  educacao: "#0879DE",
  lazer: "#067ECD",
  saude: "#0384BB",
  bem_estar: "#018AAA",
  investimentos: "#009098",
  pessoal: "#009687",
  aplicativos: "#009B75",
  seguros: "#00A164",
  eventos: "#00A752",
  outros: "#00AD41",
};

export const CATEGORY_COLOR_BY_LABEL: Record<string, string> = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.label, CATEGORY_COLOR[c.value] ?? "#94A3B8"])
);
