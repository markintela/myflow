import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-lg font-semibold text-slate-900 mb-2">
          Não foi possível concluir o login
        </h1>
        <p className="text-sm text-slate-500 mb-4">
          Tente novamente ou use outra conta Google.
        </p>
        <Link href="/login" className="text-sm text-brand-blue hover:underline">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
