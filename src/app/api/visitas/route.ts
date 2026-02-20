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
  const { id_cliente, id_vendedor, fecha_visita, hora_inicio, hora_fin, observaciones, estado } = body;

  if (!id_cliente || !id_vendedor || !fecha_visita) {
    return NextResponse.json(
      { error: "Cliente, vendedor y fecha son obligatorios" },
      { status: 400 }
    );
  }
  if (!hora_inicio || !hora_fin) {
    return NextResponse.json(
      { error: "Hora inicio y hora fin son obligatorias" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("programacion_visitas")
    .insert({
      id_comercio: usuario.id_comercio,
      id_cliente,
      id_vendedor,
      fecha_visita,
      hora_inicio: hora_inicio || null,
      hora_fin: hora_fin || null,
      observaciones: observaciones?.trim() || null,
      estado: estado || "pendiente",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
