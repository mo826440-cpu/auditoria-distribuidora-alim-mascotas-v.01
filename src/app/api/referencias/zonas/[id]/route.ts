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

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("id_comercio, rol")
    .eq("id", user.id)
    .single();

  if (!usuario || !["administrador", "auditor"].includes(usuario.rol)) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const body = await request.json();
  const { nombre, localidades, observaciones } = body;

  if (!nombre?.trim()) {
    return NextResponse.json({ error: "El nombre de zona es obligatorio" }, { status: 400 });
  }

  if (!localidades?.length) {
    return NextResponse.json(
      { error: "Debés seleccionar al menos una localidad" },
      { status: 400 }
    );
  }

  const { data: zonasExistentes } = await supabase
    .from("referencias_zonas")
    .select("id, localidades")
    .eq("id_comercio", usuario.id_comercio)
    .neq("id", id);

  const localidadesEnUso = new Set<string>();
  zonasExistentes?.forEach((z) => {
    (z.localidades || []).forEach((l: string) => localidadesEnUso.add(l));
  });

  const duplicadas = localidades.filter((l: string) => localidadesEnUso.has(l));
  if (duplicadas.length > 0) {
    return NextResponse.json(
      {
        error: `Las siguientes localidades ya están asignadas a otra zona: ${duplicadas.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("referencias_zonas")
    .update({
      nombre: nombre.trim(),
      localidades,
      observaciones: observaciones?.trim() || null,
      updated_at: new Date().toISOString(),
    })
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

  const { error } = await supabase.from("referencias_zonas").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
