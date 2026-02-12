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
    <div className="min-h-screen bg-slate-50 p-6">
      <EnsureProfile />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Bienvenido, {user.email}
        </p>
        <div className="mt-8 p-4 bg-white rounded-xl border border-slate-100">
          <p className="text-slate-500 text-sm">
            Aquí irán los módulos: Usuarios, Clientes, Vendedores, Transportistas,
            Visitas, Auditorías. (ETAPA 4 en progreso)
          </p>
        </div>
        <form action="/api/auth/signout" method="post" className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 text-primary-500 hover:text-primary-600 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
