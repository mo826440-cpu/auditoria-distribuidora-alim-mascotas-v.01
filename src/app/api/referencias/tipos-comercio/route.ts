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

    let body: { nombre?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
    }

    const nombre = body.nombre?.trim();
    if (!nombre) {
      return NextResponse.json({ error: "El nombre del tipo de comercio es obligatorio" }, { status: 400 });
    }
    if (nombre.length > 100) {
      return NextResponse.json({ error: "Nombre: máximo 100 caracteres" }, { status: 400 });
    }

    const { data: existente } = await supabase
      .from("referencias_tipos_comercio")
      .select("id")
      .eq("id_comercio", usuario.id_comercio)
      .ilike("nombre", nombre)
      .limit(1)
      .single();

    if (existente) {
      return NextResponse.json(
        { error: "Ya existe un tipo de comercio con ese nombre" },
        { status: 400 }
      );
    }

    const { data: maxOrden } = await supabase
      .from("referencias_tipos_comercio")
      .select("orden")
      .eq("id_comercio", usuario.id_comercio)
      .order("orden", { ascending: false })
      .limit(1)
      .single();

    const orden = (maxOrden?.orden ?? 0) + 1;

    const { data, error } = await supabase
      .from("referencias_tipos_comercio")
      .insert({
        id_comercio: usuario.id_comercio,
        nombre,
        orden,
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
