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

  const [clientesRes, zonasRes, tiposComercioRes, vendedoresRes, transportistasRes] = await Promise.all([
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
        id_tipo_comercio,
        id_vendedor_frecuente,
        id_transportista_frecuente,
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
    supabase
      .from("referencias_tipos_comercio")
      .select("id, nombre, orden")
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true }),
    supabase
      .from("vendedores")
      .select("id, nombre, id_zonas")
      .eq("activo", true)
      .order("nombre"),
    supabase
      .from("transportistas")
      .select("id, nombre")
      .eq("activo", true)
      .order("nombre"),
  ]);

  const clientesRaw = clientesRes.data ?? [];
  const zonas = zonasRes.data ?? [];
  const tiposComercio = tiposComercioRes.data ?? [];
  const vendedores = vendedoresRes.data ?? [];
  const transportistas = transportistasRes.data ?? [];

  const idsRegistro = [...new Set(clientesRaw.map((c) => c.id_usuario_registro).filter(Boolean))];
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, nombre")
    .in("id", idsRegistro);

  const usuariosMap = new Map((usuarios ?? []).map((u) => [u.id, u.nombre]));
  const vendedoresMap = new Map(vendedores.map((v) => [v.id, v.nombre]));
  const transportistasMap = new Map(transportistas.map((t) => [t.id, t.nombre]));
  const tiposComercioMap = new Map(tiposComercio.map((t) => [t.id, t.nombre]));

  const clientes = clientesRaw.map((c) => {
    const z = c.referencias_zonas;
    const zonaNombre = Array.isArray(z) ? (z[0] as { nombre?: string } | null)?.nombre : (z as { nombre?: string } | null)?.nombre;
    return {
      ...c,
      zona_nombre: zonaNombre ?? null,
      tipo_comercio_nombre: c.id_tipo_comercio ? tiposComercioMap.get(c.id_tipo_comercio) ?? null : null,
      usuario_registro: c.id_usuario_registro ? usuariosMap.get(c.id_usuario_registro) ?? "—" : "—",
      vendedor_nombre: c.id_vendedor_frecuente ? vendedoresMap.get(c.id_vendedor_frecuente) ?? null : null,
      transportista_nombre: c.id_transportista_frecuente ? transportistasMap.get(c.id_transportista_frecuente) ?? null : null,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Clientes</h1>
      <p className="mt-1 text-slate-300">Gestioná los puntos de venta y clientes</p>
      <ClientesClient
        clientes={clientes}
        zonas={zonas}
        tiposComercio={tiposComercio}
        vendedores={vendedores}
        transportistas={transportistas}
        rol={usuario.rol}
        usuarioNombre={usuario.nombre}
      />
    </div>
  );
}
