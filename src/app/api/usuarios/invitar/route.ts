import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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
      { error: "Falta SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  const { data: usuario } = await supabaseAdmin
    .from("usuarios")
    .select("id_comercio, rol")
    .eq("id", user.id)
    .single();

  if (!usuario || usuario.rol !== "administrador") {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const body = await request.json();
  const { email, nombre, rol } = body;

  if (!email || !nombre || !rol) {
    return NextResponse.json(
      { error: "Faltan email, nombre o rol" },
      { status: 400 }
    );
  }

  const validRoles = ["administrador", "auditor", "visitante"];
  if (!validRoles.includes(rol)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  const { data: inviteData, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        nombre,
        rol,
        id_comercio: usuario.id_comercio,
      },
      redirectTo: `${request.headers.get("origin") || "https://auditoria-distribuidora-alim-mascot-self.vercel.app"}/set-password`,
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (inviteData.user) {
    await supabaseAdmin.from("usuarios").insert({
      id: inviteData.user.id,
      id_comercio: usuario.id_comercio,
      email,
      nombre,
      rol,
    });
  }

  return NextResponse.json({ ok: true, user: inviteData.user });
}
