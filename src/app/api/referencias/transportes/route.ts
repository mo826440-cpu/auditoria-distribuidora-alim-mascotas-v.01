import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const TIPOS_VALIDOS = ["camion", "utilitario", "auto", "camioneta", "moto", "acoplado", "otro"];

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

    let body: { tipo?: string; marca?: string; dominio_patente?: string; observaciones?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
    }

    const { tipo, marca, dominio_patente, observaciones } = body;

    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json({ error: "El tipo de transporte es obligatorio y debe ser válido" }, { status: 400 });
    }

    if (!marca?.trim()) {
      return NextResponse.json({ error: "La marca es obligatoria" }, { status: 400 });
    }

    if (!dominio_patente?.trim()) {
      return NextResponse.json({ error: "El dominio/patente es obligatorio" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("referencias_transportes")
      .insert({
        id_comercio: usuario.id_comercio,
        tipo,
        marca: marca.trim(),
        dominio_patente: dominio_patente.trim(),
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
