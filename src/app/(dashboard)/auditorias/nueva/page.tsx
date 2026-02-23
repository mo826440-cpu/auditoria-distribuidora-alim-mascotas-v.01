import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Auditoria360Client } from "@/components/features/auditorias/Auditoria360Client";

export default async function AuditoriaNuevaPage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string; id_cliente?: string; id_vendedor?: string; id_visita?: string }>;
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

  if (!["administrador", "auditor"].includes(usuario.rol)) {
    redirect("/auditorias");
  }

  const [clientesRes, vendedoresRes, visitasRes, transportistasRes] = await Promise.all([
    supabase
      .from("clientes")
      .select("id, nombre, id_transportista_frecuente, id_tipo_comercio, referencias_tipos_comercio(nombre)")
      .order("nombre"),
    supabase.from("vendedores").select("id, nombre").order("nombre"),
    supabase
      .from("programacion_visitas")
      .select("id, fecha_visita, id_cliente, id_vendedor")
      .order("fecha_visita", { ascending: false })
      .limit(100),
    supabase.from("transportistas").select("id, nombre").order("nombre"),
  ]);

  const clientesRaw = clientesRes.data ?? [];
  const clientes = clientesRaw.map((c) => {
    const tc = (c as Record<string, unknown>).referencias_tipos_comercio;
    const tipoComercioNombre = Array.isArray(tc) ? (tc[0] as { nombre?: string } | null)?.nombre : (tc as { nombre?: string } | null)?.nombre;
    return { ...c, tipo_comercio_nombre: tipoComercioNombre ?? null };
  });
  const vendedores = vendedoresRes.data ?? [];
  const visitas = visitasRes.data ?? [];
  const transportistas = transportistasRes.data ?? [];

  const params = await searchParams;
  const idAuditoria = params?.id ?? undefined;
  const desdeVisita = params?.id_cliente && params?.id_vendedor && params?.id_visita;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Auditoría</h1>
      <p className="mt-1 text-slate-300">
        {idAuditoria ? "Ver o editar" : "Completar todos los campos de evaluación para guardar"}
      </p>
      <Auditoria360Client
        clientes={clientes}
        vendedores={vendedores}
        visitas={visitas}
        transportistas={transportistas}
        idAuditoria={idAuditoria}
        desdeVisita={
          desdeVisita
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
