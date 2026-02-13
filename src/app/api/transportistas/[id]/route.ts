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
  const { nombre, telefono, vehiculo, activo } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (nombre !== undefined) updates.nombre = nombre.trim();
  if (telefono !== undefined) updates.telefono = telefono?.trim() || null;
  if (vehiculo !== undefined) updates.vehiculo = vehiculo?.trim() || null;
  if (activo !== undefined) updates.activo = activo;

  const { error } = await supabase.from("transportistas").update(updates).eq("id", id);

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

  const { error } = await supabase.from("transportistas").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
