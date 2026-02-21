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
  const { id_cliente, id_vendedor, id_auditor, fecha_visita, hora_inicio, hora_fin, observaciones, estado } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (id_cliente !== undefined) updates.id_cliente = id_cliente;
  if (id_vendedor !== undefined) updates.id_vendedor = id_vendedor;
  if (id_auditor !== undefined) updates.id_auditor = id_auditor || null;
  if (fecha_visita !== undefined) updates.fecha_visita = fecha_visita;
  if (hora_inicio !== undefined) updates.hora_inicio = hora_inicio || null;
  if (hora_fin !== undefined) updates.hora_fin = hora_fin || null;
  if (observaciones !== undefined) updates.observaciones = observaciones?.trim() || null;
  if (estado !== undefined) updates.estado = estado;

  const { error } = await supabase
    .from("programacion_visitas")
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

  if (!miUsuario || !["administrador", "auditor"].includes(miUsuario.rol)) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const { error } = await supabase.from("programacion_visitas").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
