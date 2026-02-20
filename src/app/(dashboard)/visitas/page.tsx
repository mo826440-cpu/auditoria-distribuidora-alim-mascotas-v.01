import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VisitasClient } from "@/components/features/visitas/VisitasClient";

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

  const [visitasRes, clientesRes, vendedoresRes] = await Promise.all([
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
      .select("id, nombre")
      .order("nombre"),
    supabase
      .from("vendedores")
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
  const clientes = clientesRes.data ?? [];
  const vendedores = vendedoresRes.data ?? [];
  const rol = usuario.rol;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Visitas</h1>
      <p className="mt-1 text-slate-300">Programación de visitas comerciales</p>
      <VisitasClient
        visitas={visitas}
        clientes={clientes}
        vendedores={vendedores}
        rol={rol}
        mes={mes}
        anio={anio}
      />
    </div>
  );
}
