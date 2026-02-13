import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TransportistasClient } from "@/components/features/transportistas/TransportistasClient";

export default async function TransportistasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!usuario) {
    redirect("/dashboard");
  }

  const { data: transportistas } = await supabase
    .from("transportistas")
    .select("id, nombre, telefono, vehiculo, activo, created_at")
    .order("nombre");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Transportistas</h1>
      <p className="mt-1 text-slate-600">Gestioná los repartidores y vehículos</p>
      <TransportistasClient transportistas={transportistas ?? []} rol={usuario.rol} />
    </div>
  );
}
