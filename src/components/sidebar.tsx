"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sun,
  CalendarDays,
  CalendarPlus,
  ListChecks,
  BookOpen,
  HeartPulse,
  Landmark,
  Wallet,
  Waves,
  Gift,
  User,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MyflowLogo } from "@/components/myflow-logo";

const NAV = [
  { href: "/dashboard", label: "Hoje", icon: Sun },
  { href: "/dashboard/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/dashboard/tarefas", label: "Tarefas", icon: ListChecks },
  { href: "/dashboard/educacao", label: "Educação", icon: BookOpen },
  { href: "/dashboard/saude", label: "Saúde", icon: HeartPulse },
  { href: "/dashboard/renda", label: "Renda", icon: Landmark },
  { href: "/dashboard/despesas", label: "Despesas", icon: Wallet },
  { href: "/dashboard/lazer", label: "Lazer", icon: Waves },
  { href: "/dashboard/eventos", label: "Eventos", icon: CalendarPlus },
  { href: "/dashboard/aniversarios", label: "Aniversários", icon: Gift },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

// No desktop (md+) fica sempre visível, como antes. Em telas menores vira um
// menu gaveta (drawer) controlado pelo DashboardShell.
export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed md:static top-0 left-0 z-50 h-screen md:h-auto md:min-h-screen w-64 md:w-56 shrink-0 bg-gradient-to-b from-brand-blue to-brand-green text-white p-6 flex flex-col gap-7 overflow-y-auto transform transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Link href="/dashboard" onClick={onClose}>
          <MyflowLogo dark size={26} />
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const isActive = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={onClose}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-white/15 text-white font-semibold" : "text-white/70 hover:bg-white/10"
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10"
        >
          <LogOut size={16} />
          Sair
        </button>
      </aside>
    </>
  );
}
