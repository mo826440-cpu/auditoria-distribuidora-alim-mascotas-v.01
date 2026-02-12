import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor" },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  let comercioId: string | null = null;
  const { data: comercio } = await supabaseAdmin
    .from("comercios")
    .select("id")
    .limit(1)
    .single();

  if (comercio) {
    comercioId = comercio.id;
  } else {
    const { data: newComercio, error: insertError } = await supabaseAdmin
      .from("comercios")
      .insert({ nombre: "Comercio de Prueba 01" })
      .select("id")
      .single();

    if (insertError || !newComercio) {
      return NextResponse.json(
        { error: "No se pudo crear comercio" },
        { status: 500 }
      );
    }
    comercioId = newComercio.id;
  }

  const { data: existingUser } = await supabaseAdmin
    .from("usuarios")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existingUser) {
    return NextResponse.json({ ok: true, message: "Usuario ya existe" });
  }

  const nombre = user.user_metadata?.nombre ?? user.email?.split("@")[0] ?? "Usuario";
  const rol = user.user_metadata?.rol ?? "administrador";

  const { error } = await supabaseAdmin.from("usuarios").insert({
    id: user.id,
    id_comercio: comercioId,
    email: user.email!,
    nombre,
    rol,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
