import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
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

  const { data, error } = await supabase
    .from("registro_auditoria")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Auditoría no encontrada" }, { status: 404 });
  }

  return NextResponse.json(data);
}

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
  const CAMPOS_360 = [
    "cliente_eval_vendedor_pasa_regularmente", "cliente_eval_vendedor_responde", "cliente_eval_vendedor_cumple",
    "cliente_eval_vendedor_promos", "cliente_eval_vendedor_entendimiento", "cliente_eval_vendedor_actitud", "cliente_eval_vendedor_facilidad",
    "cliente_eval_transporte_horario", "cliente_eval_transporte_avisa", "cliente_eval_transporte_trato",
    "cliente_eval_transporte_completo", "cliente_eval_transporte_estado", "cliente_eval_transporte_descarga", "cliente_eval_transporte_actitud",
    "vendedor_eval_cliente_atencion", "vendedor_eval_cliente_predisposicion", "vendedor_eval_cliente_pedidos",
    "vendedor_eval_cliente_condiciones", "vendedor_eval_cliente_sugerencias", "vendedor_eval_cliente_exhibicion", "vendedor_eval_cliente_orden",
    "transporte_eval_cliente_atencion", "transporte_eval_cliente_descarga", "transporte_eval_cliente_firma",
    "transporte_eval_cliente_horarios", "transporte_eval_cliente_espacio", "transporte_eval_cliente_demoras", "transporte_eval_cliente_predisposicion",
    "vendedor_eval_transporte_comunicacion", "vendedor_eval_transporte_cumplimiento", "vendedor_eval_transporte_avisos",
    "vendedor_eval_transporte_coordinacion", "vendedor_eval_transporte_errores",
    "transporte_eval_vendedor_claridad", "transporte_eval_vendedor_correctos", "transporte_eval_vendedor_cambios",
    "transporte_eval_vendedor_coordinacion", "transporte_eval_vendedor_confusion",
    "observaciones_generales", "puntuacion_cliente_360", "puntuacion_vendedor_360", "puntuacion_repartidor_360", "puntuacion_general_360", "resultado_360",
    "hora_inicio", "hora_fin", "analisis_final", "puntaje_final",
    "eval_relacion_cumplimiento_pagos", "eval_relacion_formas_pago", "eval_relacion_frecuencia_compra",
    "eval_relacion_comunicacion_ventas", "eval_relacion_trato_general",
    "eval_ventas_volumen", "eval_ventas_rotacion", "eval_ventas_interes_nuevos",
    "eval_logistica_facilidad_entrega", "eval_logistica_horarios_recepcion", "eval_logistica_espacio_descarga", "eval_logistica_organizacion_recibir",
    "eval_local_exhibicion", "eval_local_orden_limpieza", "eval_local_iluminacion", "eval_local_espacio_disponible", "eval_local_ubicacion",
    "eval_competencia_presencia", "eval_competencia_participacion",
    "eval_potencial_crecimiento", "eval_potencial_cantidad_clientes", "eval_potencial_tamano_local",
  ];
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
    ...CAMPOS_360,
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
