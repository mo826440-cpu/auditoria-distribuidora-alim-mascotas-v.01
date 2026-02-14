import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const TIPOS_VALIDOS = ["camion", "utilitario", "auto", "camioneta", "moto", "acoplado", "otro"];

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

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!usuario || !["administrador", "auditor"].includes(usuario.rol)) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const body = await request.json();
  const { tipo, marca, dominio_patente, observaciones } = body;

  if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
    return NextResponse.json({ error: "Tipo de transporte inválido" }, { status: 400 });
  }

  if (marca !== undefined && !marca?.trim()) {
    return NextResponse.json({ error: "La marca es obligatoria" }, { status: 400 });
  }

  if (dominio_patente !== undefined && !dominio_patente?.trim()) {
    return NextResponse.json({ error: "El dominio/patente es obligatorio" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (tipo !== undefined) updates.tipo = tipo;
  if (marca !== undefined) updates.marca = marca.trim();
  if (dominio_patente !== undefined) updates.dominio_patente = dominio_patente.trim();
  if (observaciones !== undefined) updates.observaciones = observaciones?.trim() || null;

  const { error } = await supabase
    .from("referencias_transportes")
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

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!usuario || !["administrador", "auditor"].includes(usuario.rol)) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const { error } = await supabase.from("referencias_transportes").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
