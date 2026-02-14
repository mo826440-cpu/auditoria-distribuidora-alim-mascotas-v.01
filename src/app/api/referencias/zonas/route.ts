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

    let body: { nombre?: string; localidades?: string[]; observaciones?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
    }

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
      .eq("id_comercio", usuario.id_comercio);

    const localidadesEnUso = new Set<string>();
    zonasExistentes?.forEach((z) => {
      (z.localidades || []).forEach((l: string) => localidadesEnUso.add(l));
    });

    const duplicadas = localidades.filter((l) => localidadesEnUso.has(l));
    if (duplicadas.length > 0) {
      return NextResponse.json(
        {
          error: `Las siguientes localidades ya están asignadas a otra zona: ${duplicadas.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("referencias_zonas")
      .insert({
        id_comercio: usuario.id_comercio,
        nombre: nombre.trim(),
        localidades,
        observaciones: observaciones?.trim() || null,
        id_usuario_registro: user.id,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
