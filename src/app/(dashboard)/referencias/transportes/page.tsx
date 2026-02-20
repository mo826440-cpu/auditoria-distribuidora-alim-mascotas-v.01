import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TransportesClient } from "@/components/features/referencias/TransportesClient";

export default async function TransportesReferenciasPage() {
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

  const { data: transportes } = await supabase
    .from("referencias_transportes")
    .select(`
      id,
      tipo,
      marca,
      dominio_patente,
      observaciones,
      created_at,
      updated_at,
      id_usuario_registro
    `)
    .order("updated_at", { ascending: false });

  const idsRegistro = [...new Set((transportes ?? []).map((t) => t.id_usuario_registro).filter(Boolean))];
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, nombre")
    .in("id", idsRegistro);

  const usuariosMap = new Map((usuarios ?? []).map((u) => [u.id, u.nombre]));

  const transportesConUsuario = (transportes ?? []).map((t) => ({
    ...t,
    usuarios: t.id_usuario_registro
      ? { nombre: usuariosMap.get(t.id_usuario_registro) || "—" }
      : null,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Transportes</h1>
      <p className="mt-1 text-slate-300">Tipos de vehículos de referencia</p>
      <TransportesClient transportes={transportesConUsuario} rol={usuario.rol} />
    </div>
  );
}
