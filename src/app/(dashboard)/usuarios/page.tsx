import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsuariosClient } from "@/components/features/usuarios/UsuariosClient";

export default async function UsuariosPage() {
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

  if (usuario?.rol !== "administrador") {
    redirect("/dashboard");
  }

  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, email, nombre, rol, activo, created_at")
    .order("nombre");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
      <p className="mt-1 text-slate-600">Gestioná los usuarios del sistema</p>
      <UsuariosClient usuarios={usuarios ?? []} currentUserId={user.id} />
    </div>
  );
}
