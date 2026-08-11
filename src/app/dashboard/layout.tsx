import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

// Todas as páginas dentro de /dashboard passam por aqui. O middleware já
// bloqueia usuários não autenticados, mas checamos de novo no server para
// garantir que nenhuma página renderize dados sem usuário.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 max-w-[1180px]">{children}</main>
    </div>
  );
}
