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
    .select("rol, nombre")
    .eq("id", user.id)
    .single();

  if (!usuario) {
    redirect("/dashboard");
  }

  const [clientesRes, zonasRes] = await Promise.all([
    supabase
      .from("clientes")
      .select(`
        id,
        nombre,
        nombre_representante,
        contacto,
        email,
        codigo_interno,
        cuit,
        id_zona,
        localidad,
        provincia,
        calle,
        numero,
        observaciones,
        activo,
        created_at,
        updated_at,
        id_usuario_registro,
        referencias_zonas(nombre)
      `)
      .order("nombre"),
    supabase
      .from("referencias_zonas")
      .select("id, nombre, localidades")
      .order("nombre"),
  ]);

  const clientesRaw = clientesRes.data ?? [];
  const zonas = zonasRes.data ?? [];

  const idsRegistro = [...new Set(clientesRaw.map((c) => c.id_usuario_registro).filter(Boolean))];
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, nombre")
    .in("id", idsRegistro);

  const usuariosMap = new Map((usuarios ?? []).map((u) => [u.id, u.nombre]));

  const clientes = clientesRaw.map((c) => {
    const z = c.referencias_zonas;
    const zonaNombre = Array.isArray(z) ? (z[0] as { nombre?: string } | null)?.nombre : (z as { nombre?: string } | null)?.nombre;
    return {
      ...c,
      zona_nombre: zonaNombre ?? null,
      usuario_registro: c.id_usuario_registro ? usuariosMap.get(c.id_usuario_registro) ?? "—" : "—",
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
      <p className="mt-1 text-slate-600">Gestioná los puntos de venta y clientes</p>
      <ClientesClient
        clientes={clientes}
        zonas={zonas}
        rol={usuario.rol}
        usuarioNombre={usuario.nombre}
      />
    </div>
  );
}
