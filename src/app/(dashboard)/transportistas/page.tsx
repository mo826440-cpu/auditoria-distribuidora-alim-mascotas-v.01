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
    .select("rol, nombre")
    .eq("id", user.id)
    .single();

  if (!usuario) {
    redirect("/dashboard");
  }

  const [transportistasRes, zonasRes] = await Promise.all([
    supabase
      .from("transportistas")
      .select(`
        id,
        nombre,
        contacto,
        email,
        codigo_interno,
        dni,
        id_zonas,
        residencia,
        observaciones,
        activo,
        created_at,
        updated_at,
        id_usuario_registro
      `)
      .order("nombre"),
    supabase
      .from("referencias_zonas")
      .select("id, nombre")
      .order("nombre"),
  ]);

  const transportistasRaw = transportistasRes.data ?? [];
  const zonas = zonasRes.data ?? [];
  const zonasMap = new Map(zonas.map((z) => [z.id, z.nombre]));

  const idsRegistro = [...new Set(transportistasRaw.map((t) => t.id_usuario_registro).filter(Boolean))];
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, nombre")
    .in("id", idsRegistro);
  const usuariosMap = new Map((usuarios ?? []).map((u) => [u.id, u.nombre]));

  const transportistas = transportistasRaw.map((t) => ({
    ...t,
    zonas_nombres: (t.id_zonas ?? [])
      .map((zid: string) => zonasMap.get(zid))
      .filter(Boolean)
      .join(", ") || null,
    usuario_registro: t.id_usuario_registro ? usuariosMap.get(t.id_usuario_registro) ?? "—" : "—",
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Transportistas</h1>
      <p className="mt-1 text-slate-600">Gestioná los repartidores</p>
      <TransportistasClient
        transportistas={transportistas}
        zonas={zonas}
        rol={usuario.rol}
        usuarioNombre={usuario.nombre}
      />
    </div>
  );
}
