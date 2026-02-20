import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EnsureProfile } from "@/components/features/EnsureProfile";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
      <p className="mt-2 text-slate-300">Bienvenido, {user.email}</p>
      <div className="mt-8 p-4 bg-white rounded-xl border border-slate-100">
        <p className="text-slate-500 text-sm">
          Aquí irán los módulos: Usuarios, Clientes, Vendedores, Transportistas,
          Visitas, Auditorías. (ETAPA 4 en progreso)
        </p>
      </div>
    </div>
  );
}
