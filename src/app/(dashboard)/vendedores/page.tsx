import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VendedoresClient } from "@/components/features/vendedores/VendedoresClient";

export default async function VendedoresPage() {
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

  const { data: vendedores } = await supabase
    .from("vendedores")
    .select("id, nombre, telefono, email, activo, created_at")
    .order("nombre");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Vendedores</h1>
      <p className="mt-1 text-slate-600">Gestioná la fuerza de ventas</p>
      <VendedoresClient vendedores={vendedores ?? []} rol={usuario.rol} />
    </div>
  );
}
