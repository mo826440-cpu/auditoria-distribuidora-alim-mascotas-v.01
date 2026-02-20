import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VisitasClient } from "@/components/features/visitas/VisitasClient";
import { ESTADOS_VISITA, ESTADO_LEGEND_BG_VISITA } from "@/data/estadosVisita";

function getMonthRange(mes: number, anio: number) {
  const primerDia = new Date(anio, mes - 1, 1);
  const ultimoDia = new Date(anio, mes, 0);
  return {
    desde: primerDia.toISOString().slice(0, 10),
    hasta: ultimoDia.toISOString().slice(0, 10),
  };
}

export default async function VisitasPage({
  searchParams,
}: {
  searchParams?: Promise<{ mes?: string; anio?: string }>;
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

  const params = await searchParams;
  const now = new Date();
  const mes = Math.max(1, Math.min(12, params?.mes ? parseInt(params.mes, 10) || now.getMonth() + 1 : now.getMonth() + 1));
  const anio = Math.max(2020, Math.min(2100, params?.anio ? parseInt(params.anio, 10) || now.getFullYear() : now.getFullYear()));
  const { desde, hasta } = getMonthRange(mes, anio);

  const [visitasRes, clientesRes, vendedoresRes, zonasRes, transportistasRes] = await Promise.all([
    supabase
      .from("programacion_visitas")
      .select(`
        id,
        id_cliente,
        id_vendedor,
        fecha_visita,
        hora_inicio,
        hora_fin,
        observaciones,
        estado,
        clientes(nombre),
        vendedores(nombre)
      `)
      .gte("fecha_visita", desde)
      .lte("fecha_visita", hasta)
      .order("fecha_visita", { ascending: true }),
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
        id_vendedor_frecuente,
        id_transportista_frecuente,
        localidad,
        provincia,
        calle,
        numero,
        observaciones,
        referencias_zonas(nombre)
      `)
      .order("nombre"),
    supabase
      .from("vendedores")
      .select("id, nombre, id_zonas")
      .eq("activo", true)
      .order("nombre"),
    supabase
      .from("referencias_zonas")
      .select("id, nombre")
      .order("nombre"),
    supabase
      .from("transportistas")
      .select("id, nombre")
      .order("nombre"),
  ]);

  const rawVisitas = visitasRes.data ?? [];
  const visitas = rawVisitas.map((v) => {
    const vAny = v as Record<string, unknown>;
    const clientesRaw = vAny.clientes;
    const vendedoresRaw = vAny.vendedores;
    const clientes = Array.isArray(clientesRaw) ? clientesRaw[0] ?? null : (clientesRaw as { nombre: string } | null) ?? null;
    const vendedores = Array.isArray(vendedoresRaw) ? vendedoresRaw[0] ?? null : (vendedoresRaw as { nombre: string } | null) ?? null;
    return { ...v, clientes, vendedores };
  });

  const clientesRaw = clientesRes.data ?? [];
  const vendedores = vendedoresRes.data ?? [];
  const zonas = zonasRes.data ?? [];
  const transportistas = transportistasRes.data ?? [];
  const vendedoresMap = new Map((vendedores ?? []).map((v) => [v.id, v.nombre]));
  const transportistasMap = new Map((transportistas ?? []).map((t) => [t.id, t.nombre]));

  const clientes = clientesRaw.map((c) => {
    const z = (c as Record<string, unknown>).referencias_zonas;
    const zonaNombre = Array.isArray(z) ? (z[0] as { nombre?: string } | null)?.nombre : (z as { nombre?: string } | null)?.nombre;
    const cAny = c as Record<string, unknown>;
    return {
      ...c,
      zona_nombre: zonaNombre ?? null,
      vendedor_nombre: cAny.id_vendedor_frecuente ? vendedoresMap.get(cAny.id_vendedor_frecuente as string) ?? null : null,
      transportista_nombre: cAny.id_transportista_frecuente ? transportistasMap.get(cAny.id_transportista_frecuente as string) ?? null : null,
    };
  });
  const rol = usuario.rol;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Visitas</h1>
          <p className="mt-1 text-slate-300">Programación de visitas comerciales</p>
        </div>
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-4 shrink-0">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Estado</h3>
          <div className="flex flex-wrap items-center gap-3">
            {ESTADOS_VISITA.map((e) => (
              <div key={e.value} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded shrink-0 ${ESTADO_LEGEND_BG_VISITA[e.value] || "bg-slate-600"}`}
                />
                <span className="text-sm text-slate-300">{e.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <VisitasClient
        visitas={visitas}
        clientes={clientes}
        vendedores={vendedores}
        zonas={zonas}
        rol={rol}
        mes={mes}
        anio={anio}
      />
    </div>
  );
}
