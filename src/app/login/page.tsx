import Link from "next/link";
import { Waves } from "lucide-react";
import { GoogleSignInButton } from "@/components/google-signin-button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center mx-auto mb-4">
          <Waves size={22} className="text-white" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Entrar no Myflow</h1>
        <p className="text-sm text-slate-500 mb-6">
          Organize tarefas, estudos, saúde, despesas, lazer e aniversários num só lugar.
        </p>

        <GoogleSignInButton className="w-full justify-center" />

        <p className="text-xs text-slate-400 mt-6">
          Ao continuar, você concorda com o uso dos seus dados apenas para o
          funcionamento do app.
        </p>

        <Link href="/" className="text-xs text-brand-blue hover:underline mt-4 inline-block">
          ← Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
