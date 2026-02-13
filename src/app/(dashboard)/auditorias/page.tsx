import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuditoriasClient } from "@/components/features/auditorias/AuditoriasClient";

export default async function AuditoriasPage() {
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
        puntuacion_cliente,
        puntuacion_vendedor,
        puntuacion_repartidor,
        clasificacion_cliente,
        condiciones_generales,
        clientes(nombre),
        vendedores(nombre)
      `)
      .order("fecha", { ascending: false }),
    supabase.from("clientes").select("id, nombre").order("nombre"),
    supabase.from("vendedores").select("id, nombre").order("nombre"),
    supabase
      .from("programacion_visitas")
      .select("id, fecha_visita")
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Auditorías</h1>
      <p className="mt-1 text-slate-600">Registro de auditorías comerciales</p>
      <AuditoriasClient
        auditorias={auditorias}
        clientes={clientes}
        vendedores={vendedores}
        visitas={visitas}
        transportistas={transportistas}
        rol={rol}
      />
    </div>
  );
}
