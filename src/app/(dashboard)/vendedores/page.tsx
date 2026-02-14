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
    .select("rol, nombre")
    .eq("id", user.id)
    .single();

  if (!usuario) {
    redirect("/dashboard");
  }

  const [vendedoresRes, zonasRes] = await Promise.all([
    supabase
      .from("vendedores")
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

  const vendedoresRaw = vendedoresRes.data ?? [];
  const zonas = zonasRes.data ?? [];
  const zonasMap = new Map(zonas.map((z) => [z.id, z.nombre]));

  const idsRegistro = [...new Set(vendedoresRaw.map((v) => v.id_usuario_registro).filter(Boolean))];
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, nombre")
    .in("id", idsRegistro);
  const usuariosMap = new Map((usuarios ?? []).map((u) => [u.id, u.nombre]));

  const vendedores = vendedoresRaw.map((v) => ({
    ...v,
    zonas_nombres: (v.id_zonas ?? [])
      .map((zid: string) => zonasMap.get(zid))
      .filter(Boolean)
      .join(", ") || null,
    usuario_registro: v.id_usuario_registro ? usuariosMap.get(v.id_usuario_registro) ?? "—" : "—",
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Vendedores</h1>
      <p className="mt-1 text-slate-600">Gestioná la fuerza de ventas</p>
      <VendedoresClient
        vendedores={vendedores}
        zonas={zonas}
        rol={usuario.rol}
        usuarioNombre={usuario.nombre}
      />
    </div>
  );
}
