import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ZonasClient } from "@/components/features/referencias/ZonasClient";

export default async function ZonasPage() {
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

  const { data: zonas } = await supabase
    .from("referencias_zonas")
    .select(`
      id,
      nombre,
      localidades,
      observaciones,
      created_at,
      updated_at,
      id_usuario_registro
    `)
    .order("updated_at", { ascending: false });

  const idsRegistro = [...new Set((zonas ?? []).map((z) => z.id_usuario_registro).filter(Boolean))];
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, nombre")
    .in("id", idsRegistro);

  const usuariosMap = new Map((usuarios ?? []).map((u) => [u.id, u.nombre]));

  const zonasConUsuario = (zonas ?? []).map((z) => ({
    ...z,
    usuarios: z.id_usuario_registro
      ? { nombre: usuariosMap.get(z.id_usuario_registro) || "—" }
      : null,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Zonas</h1>
      <p className="mt-1 text-slate-300">Localidades y ciudades de Córdoba por zona</p>
      <ZonasClient
        zonas={zonasConUsuario}
        usuarioNombre={usuario.nombre}
        rol={usuario.rol}
      />
    </div>
  );
}
