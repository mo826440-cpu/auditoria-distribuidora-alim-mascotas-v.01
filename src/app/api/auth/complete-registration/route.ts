import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const missing: string[] = [];
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Configuración incompleta: faltan en .env.local: ${missing.join(", ")}. Reiniciá el servidor (npm run dev) después de agregarlas.`,
          missing,
        },
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

    const { data: existingUser } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ ok: true, message: "Usuario ya existe" });
    }

    const nombre = user.user_metadata?.nombre ?? user.email?.split("@")[0] ?? "Usuario";
    const rol = user.user_metadata?.rol ?? "administrador";

    // Nueva cuenta = nuevo comercio para este usuario (formulario "Crear cuenta")
    const nombreComercio = `Comercio de ${nombre}`;
    const { data: newComercio, error: insertComercioError } = await supabaseAdmin
      .from("comercios")
      .insert({ nombre: nombreComercio })
      .select("id")
      .single();

    if (insertComercioError || !newComercio) {
      const msg = insertComercioError?.message ?? "No se pudo crear el comercio";
      const code = insertComercioError?.code;
      return NextResponse.json(
        { error: msg, code, detail: insertComercioError?.details },
        { status: 500 }
      );
    }

    const comercioId = newComercio.id;

    const { error: insertUserError } = await supabaseAdmin.from("usuarios").insert({
      id: user.id,
      id_comercio: comercioId,
      email,
      nombre,
      rol,
    });

    if (insertUserError) {
      if (insertUserError.code === "23505") {
        return NextResponse.json({ ok: true, message: "Usuario ya existe" });
      }
      return NextResponse.json(
        {
          error: `Error al crear perfil: ${insertUserError.message}`,
          code: insertUserError.code,
          detail: insertUserError.details,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    const stack = err instanceof Error ? err.stack : undefined;
    return NextResponse.json(
      { error: `Error del servidor: ${message}`, stack: stack?.split("\n").slice(0, 3) },
      { status: 500 }
    );
  }
}
