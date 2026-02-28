import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id_comercio, rol")
      .eq("id", user.id)
      .single();

    if (!usuario || !["administrador", "auditor"].includes(usuario.rol)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo de la solicitud inválido" }, { status: 400 });
    }

    const {
    id_cliente,
    id_vendedor,
    id_visita,
    id_transportista,
    fecha,
    local_limpio_ordenado,
    productos_bien_exhibidos,
    stock_suficiente,
    rotacion_productos,
    cumple_plazos_pago,
    metodos_pago_frecuentes,
    frecuencia_envios,
    promedio_kg_mes,
    monto_compra_mes,
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
    puntuacion_cliente,
    puntuacion_vendedor,
    puntuacion_repartidor,
    clasificacion_cliente,
    firma_auditor,
    firma_responsable,
    observaciones_generales,
    puntuacion_cliente_360,
    puntuacion_vendedor_360,
    puntuacion_repartidor_360,
    puntuacion_general_360,
    resultado_360,
    } = body;

    if (!id_cliente || !id_vendedor || !fecha) {
      return NextResponse.json(
        { error: "Cliente, vendedor y fecha son obligatorios" },
        { status: 400 }
      );
    }

    const insertBase: Record<string, unknown> = {
      id_comercio: usuario.id_comercio,
      id_cliente,
      id_vendedor,
      id_auditor: user.id,
      id_visita: id_visita || null,
      id_transportista: id_transportista || null,
      fecha,
      local_limpio_ordenado: local_limpio_ordenado ?? null,
      productos_bien_exhibidos: productos_bien_exhibidos ?? null,
      stock_suficiente: stock_suficiente ?? null,
      rotacion_productos: rotacion_productos ?? null,
      cumple_plazos_pago: cumple_plazos_pago ?? null,
      metodos_pago_frecuentes: metodos_pago_frecuentes ?? null,
      frecuencia_envios: frecuencia_envios || null,
      promedio_kg_mes: promedio_kg_mes || null,
      monto_compra_mes: monto_compra_mes || null,
      condiciones_generales: condiciones_generales ?? null,
      exhibicion_productos: exhibicion_productos ?? null,
      stock_rotacion: stock_rotacion ?? null,
      precios_comercializacion: precios_comercializacion ?? null,
      relacion_distribuidora: relacion_distribuidora ?? null,
      gestion_comercial: gestion_comercial ?? null,
      conocimiento_producto: conocimiento_producto ?? null,
      relacion_cliente: relacion_cliente ?? null,
      cumplimiento_administrativo: cumplimiento_administrativo ?? null,
      logistica_servicio: logistica_servicio ?? null,
      puntuacion_cliente: puntuacion_cliente ?? null,
      puntuacion_vendedor: puntuacion_vendedor ?? null,
      puntuacion_repartidor: puntuacion_repartidor ?? null,
      clasificacion_cliente: clasificacion_cliente || null,
      firma_auditor: firma_auditor || null,
      firma_responsable: firma_responsable || null,
      observaciones_generales: observaciones_generales ?? null,
      puntuacion_cliente_360: puntuacion_cliente_360 ?? null,
      puntuacion_vendedor_360: puntuacion_vendedor_360 ?? null,
      puntuacion_repartidor_360: puntuacion_repartidor_360 ?? null,
      puntuacion_general_360: puntuacion_general_360 ?? null,
      resultado_360: resultado_360 ?? null,
    };

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
    ];
    for (const key of CAMPOS_360) {
      if (key in body && body[key] != null) {
        insertBase[key] = body[key];
      }
    }
    insertBase.hora_inicio = body.hora_inicio ?? null;
    insertBase.hora_fin = body.hora_fin ?? null;
    insertBase.analisis_final = body.analisis_final ?? null;
    insertBase.puntaje_final = body.puntaje_final ?? null;
    if (Array.isArray(body.ponderaciones) && (body.ponderaciones.length === 5 || body.ponderaciones.length === 6)) {
      insertBase.ponderaciones = body.ponderaciones;
    }
    insertBase.estado_auditoria = body.estado_auditoria === "parcial" ? "parcial" : "completa";
    const CAMPOS_ENCUESTA = [
      "encuesta_atencion_trato_amabilidad", "encuesta_atencion_tiempos_respuesta", "encuesta_atencion_claridad_info",
      "encuesta_atencion_resolucion_problemas", "encuesta_atencion_frecuencia_contacto", "encuesta_atencion_percepcion_general",
      "encuesta_entregas_tiempos", "encuesta_entregas_pedido_completo", "encuesta_entregas_estado_pedido",
      "encuesta_entregas_facilidad_descarga", "encuesta_entregas_trato_transportista",
      "encuesta_productos_calidad", "encuesta_productos_variedad", "encuesta_productos_disponibilidad_stock", "encuesta_productos_rotacion",
      "encuesta_precios_competitividad", "encuesta_precios_promociones", "encuesta_precios_condiciones_pago", "encuesta_precios_relacion_calidad",
      "encuesta_relacion_facilidad_pedidos", "encuesta_relacion_comunicacion", "encuesta_relacion_resolucion_reclamos",
      "encuesta_relacion_satisfaccion_general", "encuesta_relacion_recomendacion",
    ];
    for (const key of CAMPOS_ENCUESTA) {
      if (key in body && body[key] != null) {
        const v = body[key];
        insertBase[key] = typeof v === "number" && v >= 1 && v <= 3 ? v : null;
      }
    }
    insertBase.puntaje_satisfaccion = typeof body.puntaje_satisfaccion === "number" && body.puntaje_satisfaccion >= 0 && body.puntaje_satisfaccion <= 72 ? body.puntaje_satisfaccion : null;
    insertBase.analisis_encuesta_satisfaccion = body.analisis_encuesta_satisfaccion ?? null;
    if (Array.isArray(body.ponderaciones_encuesta) && body.ponderaciones_encuesta.length === 5 && body.ponderaciones_encuesta.every((n: unknown) => typeof n === "number" && n >= 0 && n <= 100)) {
      insertBase.ponderaciones_encuesta = body.ponderaciones_encuesta;
    }
    insertBase.pregunta_clave_mejorar = body.pregunta_clave_mejorar ?? null;
    insertBase.pregunta_clave_productos_agregar = body.pregunta_clave_productos_agregar ?? null;
    insertBase.pregunta_clave_problema_reciente = body.pregunta_clave_problema_reciente ?? null;
    insertBase.pregunta_clave_otra_distribuidora = body.pregunta_clave_otra_distribuidora ?? null;
    const CAMPOS_EVALUACION = [
      "eval3_relacion_trato_vendedor", "eval3_relacion_trato_empresa", "eval3_relacion_comunicacion", "eval3_relacion_resolucion_problemas", "eval3_relacion_cumplimiento_pagos",
      "eval3_ventas_frecuencia_compra", "eval3_ventas_volumen", "eval3_ventas_rotacion", "eval3_ventas_participacion_productos",
      "eval3_logistica_recepcion_pedidos", "eval3_logistica_trato_transportista", "eval3_logistica_espacio_descarga", "eval3_logistica_organizacion_recibir",
      "eval3_local_estado", "eval3_local_exhibicion", "eval3_local_espacio", "eval3_local_iluminacion",
      "eval3_potencial_ubicacion", "eval3_potencial_cantidad_clientes", "eval3_potencial_crecimiento", "eval3_potencial_tamano_local", "eval3_potencial_presencia_competencia",
    ];
    for (const key of CAMPOS_EVALUACION) {
      if (key in body && body[key] != null) {
        const v = body[key];
        insertBase[key] = typeof v === "number" && v >= 1 && v <= 3 ? v : null;
      }
    }
    if (Array.isArray(body.ponderaciones) && body.ponderaciones.length === 5) {
      insertBase.ponderaciones = body.ponderaciones;
    }

    const { data, error } = await supabase
    .from("registro_auditoria")
    .insert(insertBase)
    .select("id")
    .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
