import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuditoriasClient } from "@/components/features/auditorias/AuditoriasClient";

export default async function AuditoriasPage({
  searchParams,
}: {
  searchParams?: Promise<{ nueva?: string; id_cliente?: string; id_vendedor?: string; id_visita?: string }>;
}) {
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

  const [
    auditoriasRes,
    clientesRes,
    vendedoresRes,
    visitasRes,
    transportistasRes,
  ] = await Promise.all([
    supabase
      .from("registro_auditoria")
      .select(`
        id,
        fecha,
        id_cliente,
        id_vendedor,
        id_visita,
        id_transportista,
        local_limpio_ordenado,
        productos_bien_exhibidos,
        stock_suficiente,
        rotacion_productos,
        cumple_plazos_pago,
        metodos_pago_frecuentes,
        frecuencia_envios,
        promedio_kg_mes,
        monto_compra_mes,
        puntuacion_cliente,
        puntuacion_vendedor,
        puntuacion_repartidor,
        clasificacion_cliente,
        condiciones_generales,
        exhibicion_productos,
        stock_rotacion,
        precios_comercializacion,
        relacion_distribuidora,
        gestion_comercial,
        conocimiento_producto,
        relacion_cliente,
        cumplimiento_administrativo,
        logistica_servicio,
        clientes(nombre),
        vendedores(nombre)
      `)
      .order("fecha", { ascending: false }),
    supabase.from("clientes").select("id, nombre, id_transportista_frecuente").order("nombre"),
    supabase.from("vendedores").select("id, nombre").order("nombre"),
    supabase
      .from("programacion_visitas")
      .select("id, fecha_visita, id_cliente, id_vendedor")
      .order("fecha_visita", { ascending: false })
      .limit(100),
    supabase.from("transportistas").select("id, nombre").order("nombre"),
  ]);

  const rawAuditorias = auditoriasRes.data ?? [];
  const auditorias = rawAuditorias.map((a) => {
    const aAny = a as Record<string, unknown>;
    const clientesRaw = aAny.clientes;
    const vendedoresRaw = aAny.vendedores;
    const clientes = Array.isArray(clientesRaw)
      ? clientesRaw[0] ?? null
      : (clientesRaw as { nombre: string } | null) ?? null;
    const vendedores = Array.isArray(vendedoresRaw)
      ? vendedoresRaw[0] ?? null
      : (vendedoresRaw as { nombre: string } | null) ?? null;
    return { ...a, clientes, vendedores };
  });

  const clientes = clientesRes.data ?? [];
  const vendedores = vendedoresRes.data ?? [];
  const visitas = visitasRes.data ?? [];
  const transportistas = transportistasRes.data ?? [];
  const rol = usuario.rol;

  const params = await searchParams;
  const nuevaDesdeVisita = params?.nueva === "1" && params?.id_cliente && params?.id_vendedor && params?.id_visita;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Auditorías</h1>
      <p className="mt-1 text-slate-300">Registro de auditorías comerciales</p>
      <AuditoriasClient
        auditorias={auditorias}
        clientes={clientes}
        vendedores={vendedores}
        visitas={visitas}
        transportistas={transportistas}
        rol={rol}
        abrirNuevaDesdeVisita={
          nuevaDesdeVisita
            ? {
                id_cliente: params!.id_cliente!,
                id_vendedor: params!.id_vendedor!,
                id_visita: params!.id_visita!,
              }
            : undefined
        }
      />
    </div>
  );
}
