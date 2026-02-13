import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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

  const body = await request.json();
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
  } = body;

  if (!id_cliente || !id_vendedor || !fecha) {
    return NextResponse.json(
      { error: "Cliente, vendedor y fecha son obligatorios" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("registro_auditoria")
    .insert({
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
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
