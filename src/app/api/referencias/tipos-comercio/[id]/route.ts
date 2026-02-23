import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
    .select("id_comercio, rol")
    .eq("id", user.id)
    .single();

  if (!usuario || !["administrador", "auditor"].includes(usuario.rol)) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const { data: enUso } = await supabase
    .from("clientes")
    .select("id")
    .eq("id_tipo_comercio", id)
    .limit(1)
    .single();

  if (enUso) {
    return NextResponse.json(
      { error: "No se puede eliminar: hay clientes asignados a este tipo" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("referencias_tipos_comercio")
    .delete()
    .eq("id", id)
    .eq("id_comercio", usuario.id_comercio);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
