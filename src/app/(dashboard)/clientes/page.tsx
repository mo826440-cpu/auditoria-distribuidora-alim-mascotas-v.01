import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientesClient } from "@/components/features/clientes/ClientesClient";

export default async function ClientesPage() {
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

  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre, direccion, telefono, email, localidad, provincia, activo, created_at")
    .order("nombre");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
      <p className="mt-1 text-slate-600">Gestioná los puntos de venta y clientes</p>
      <ClientesClient clientes={clientes ?? []} rol={usuario.rol} />
    </div>
  );
}
