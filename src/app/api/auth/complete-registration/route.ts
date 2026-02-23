import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Configuración incompleta: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local" },
        { status: 500 }
      );
    }

    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json(
        { error: `Error de autenticación: ${authError.message}` },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const email = user.email ?? `${user.id}@placeholder.local`;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    let comercioId: string | null = null;
    const { data: comercio, error: comercioError } = await supabaseAdmin
      .from("comercios")
      .select("id")
      .limit(1)
      .single();

    if (comercioError && comercioError.code !== "PGRST116") {
      return NextResponse.json(
        { error: `Error al obtener comercio: ${comercioError.message}` },
        { status: 500 }
      );
    }

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
          { error: insertError?.message ?? "No se pudo crear comercio" },
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

    const { error: insertUserError } = await supabaseAdmin.from("usuarios").insert({
      id: user.id,
      id_comercio: comercioId,
      email,
      nombre,
      rol,
    });

    if (insertUserError) {
      return NextResponse.json(
        { error: `Error al crear perfil: ${insertUserError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json(
      { error: `Error del servidor: ${message}` },
      { status: 500 }
    );
  }
}
