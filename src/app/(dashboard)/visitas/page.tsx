import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VisitasClient } from "@/components/features/visitas/VisitasClient";

export default async function VisitasPage() {
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
      .order("fecha_visita", { ascending: false }),
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
      <h1 className="text-2xl font-bold text-slate-900">Visitas</h1>
      <p className="mt-1 text-slate-600">Programación de visitas comerciales</p>
      <VisitasClient
        visitas={visitas}
        clientes={clientes}
        vendedores={vendedores}
        rol={rol}
      />
    </div>
  );
}
