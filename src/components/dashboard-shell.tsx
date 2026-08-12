"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { MyflowLogo } from "@/components/myflow-logo";

// Envolve o Sidebar + conteúdo do dashboard. Fica como client component só
// pra guardar o estado do menu mobile — o layout continua fazendo a checagem
// de autenticação no server.
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-1.5 -ml-1.5 rounded-md text-slate-600 hover:bg-slate-100"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <MyflowLogo size={18} />
        </header>

        <main className="flex-1 w-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
