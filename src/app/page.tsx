import Link from "next/link";
import {
  BookOpen,
  HeartPulse,
  Wallet,
  Waves,
  Gift,
  ListChecks,
  CalendarDays,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsappInviteButton } from "@/components/whatsapp-invite-button";
import { MyflowLogo } from "@/components/myflow-logo";

const AREAS = [
  { icon: ListChecks, label: "Tarefas", desc: "O que precisa ser resolvido hoje", color: "text-brand-blue", bg: "bg-brand-blueSoft" },
  { icon: BookOpen, label: "Estudos", desc: "Horas, matérias e metas de aprendizado", color: "text-brand-blue", bg: "bg-brand-blueSoft" },
  { icon: HeartPulse, label: "Saúde", desc: "Água, sono, exercício e bem-estar", color: "text-brand-green", bg: "bg-brand-greenSoft" },
  { icon: Wallet, label: "Despesas", desc: "Gastos e orçamento do mês", color: "text-brand-cyan", bg: "bg-brand-cyanSoft" },
  { icon: Waves, label: "Lazer", desc: "Momentos de descanso e diversão", color: "text-brand-green", bg: "bg-brand-greenSoft" },
  { icon: Gift, label: "Aniversários", desc: "Nunca mais esqueça uma data importante", color: "text-brand-blue", bg: "bg-brand-blueSoft" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-6">
        <MyflowLogo size={60} />
        <Link href="/login">
          <Button variant="outline" size="sm">Entrar</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center px-6 pt-12 pb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
          Sua vida organizada,{" "}
          <span className="bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
            num só fluxo
          </span>
        </h1>
        <p className="text-slate-500 text-lg mt-5 max-w-xl mx-auto">
          O Myflow reúne tarefas, estudos, saúde, despesas, lazer e aniversários
          dentro de um único calendário e dashboard — para você ter clareza do
          seu dia sem precisar de cinco apps diferentes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              <LayoutDashboard size={18} />
              Começar gratuitamente
            </Button>
          </Link>
          <WhatsappInviteButton className="w-full sm:w-auto" />
        </div>
      </section>

      {/* Áreas */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AREAS.map((a) => (
            <div key={a.label} className="border border-slate-200 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center mb-3`}>
                <a.icon size={18} className={a.color} />
              </div>
              <h3 className="font-semibold text-slate-900">{a.label}</h3>
              <p className="text-sm text-slate-500 mt-1">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Calendário + dashboard */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <CalendarDays size={26} className="text-brand-blue" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-lg">
              Tudo dentro de um calendário, tudo num dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Cada tarefa, estudo, gasto ou compromisso de lazer aparece no seu
              calendário e alimenta um painel único, para você ver o dia inteiro
              de relance — sem trocar de aplicativo.
            </p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto text-center px-6 pb-24">
        <h2 className="text-2xl font-semibold text-slate-900">
          Pronto para organizar sua rotina?
        </h2>
        <p className="text-slate-500 mt-2">É grátis para começar — leva menos de um minuto.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Criar minha conta com Google
            </Button>
          </Link>
          <WhatsappInviteButton className="w-full sm:w-auto" />
        </div>
      </section>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        Myflow — sua vida, num só fluxo.
      </footer>
    </main>
  );
}
