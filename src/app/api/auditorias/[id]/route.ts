import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: miUsuario } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!miUsuario || !["administrador", "auditor"].includes(miUsuario.rol)) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const body = await request.json();
  const allowed = [
    "id_cliente",
    "id_vendedor",
    "id_visita",
    "id_transportista",
    "fecha",
    "local_limpio_ordenado",
    "productos_bien_exhibidos",
    "stock_suficiente",
    "rotacion_productos",
    "cumple_plazos_pago",
    "metodos_pago_frecuentes",
    "frecuencia_envios",
    "promedio_kg_mes",
    "monto_compra_mes",
    "condiciones_generales",
    "exhibicion_productos",
    "stock_rotacion",
    "precios_comercializacion",
    "relacion_distribuidora",
    "gestion_comercial",
    "conocimiento_producto",
    "relacion_cliente",
    "cumplimiento_administrativo",
    "logistica_servicio",
    "puntuacion_cliente",
    "puntuacion_vendedor",
    "puntuacion_repartidor",
    "clasificacion_cliente",
    "firma_auditor",
    "firma_responsable",
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) {
      const val = body[key];
      updates[key] = val === "" || val === undefined ? null : val;
    }
  }

  const { error } = await supabase
    .from("registro_auditoria")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: miUsuario } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!miUsuario || miUsuario.rol !== "administrador") {
    return NextResponse.json({ error: "Solo administradores pueden eliminar auditorías" }, { status: 403 });
  }

  const { error } = await supabase.from("registro_auditoria").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
