import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const E164_REGEX = /^\+[1-9]\d{6,14}$/;
const CODIGO_INTERNO_REGEX = /^[0-9\-]+$/;
const DNI_REGEX = /^\d{2}\.\d{3}\.\d{3}$/;

function formatearDni(digits: string): string {
  const s = digits.replace(/\D/g, "").slice(0, 8);
  if (s.length >= 8) return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}`;
  if (s.length >= 5) return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5)}`;
  if (s.length >= 2) return `${s.slice(0, 2)}.${s.slice(2)}`;
  return s;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: miUsuario } = await supabase
    .from("usuarios")
    .select("id_comercio, rol")
    .eq("id", user.id)
    .single();

  if (!miUsuario || !["administrador", "auditor"].includes(miUsuario.rol)) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const {
    nombre,
    contacto,
    email,
    codigo_interno,
    dni,
    id_zonas,
    residencia,
    observaciones,
    activo,
  } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (nombre !== undefined) {
    const v = String(nombre).trim();
    if (!v) return NextResponse.json({ error: "Nombre obligatorio" }, { status: 400 });
    if (v.length > 100) return NextResponse.json({ error: "Nombre: max 100" }, { status: 400 });
    updates.nombre = v;
  }
  if (contacto !== undefined) {
    const v = String(contacto).trim();
    if (!v) return NextResponse.json({ error: "Contacto obligatorio" }, { status: 400 });
    if (!E164_REGEX.test(v)) return NextResponse.json({ error: "Contacto formato E.164" }, { status: 400 });
    updates.contacto = v;
  }
  if (email !== undefined) {
    const v = String(email).trim();
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    updates.email = v || null;
  }
  if (codigo_interno !== undefined) {
    const v = String(codigo_interno).trim();
    if (!v) return NextResponse.json({ error: "Código interno obligatorio" }, { status: 400 });
    if (!CODIGO_INTERNO_REGEX.test(v)) return NextResponse.json({ error: "Código: solo números y guiones" }, { status: 400 });
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseCheck = serviceRoleKey
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, { auth: { persistSession: false } })
      : supabase;
    const { data: dupList } = await supabaseCheck
      .from("vendedores")
      .select("id")
      .eq("id_comercio", miUsuario.id_comercio)
      .eq("codigo_interno", v)
      .neq("id", id)
      .limit(1);
    if (dupList && dupList.length > 0) return NextResponse.json({ error: "Ya existe un vendedor con ese código interno" }, { status: 400 });
    updates.codigo_interno = v;
  }
  if (dni !== undefined) {
    const dniFormateado = formatearDni(String(dni));
    if (dniFormateado.length !== 10 || !DNI_REGEX.test(dniFormateado)) {
      return NextResponse.json({ error: "DNI debe tener 8 dígitos (XX.XXX.XXX)" }, { status: 400 });
    }
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseCheck = serviceRoleKey
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, { auth: { persistSession: false } })
      : supabase;
    const { data: dupDniList } = await supabaseCheck
      .from("vendedores")
      .select("id")
      .eq("id_comercio", miUsuario.id_comercio)
      .eq("dni", dniFormateado)
      .neq("id", id)
      .limit(1);
    if (dupDniList && dupDniList.length > 0) return NextResponse.json({ error: "Ya existe un vendedor con ese DNI" }, { status: 400 });
    updates.dni = dniFormateado;
  }
  if (id_zonas !== undefined) {
    const zonasArr = Array.isArray(id_zonas)
      ? (id_zonas as string[]).filter((z): z is string => typeof z === "string")
      : [];
    updates.id_zonas = zonasArr.length > 0 ? zonasArr : null;
  }
  if (residencia !== undefined) updates.residencia = residencia ? String(residencia).trim().slice(0, 100) : null;
  if (observaciones !== undefined) updates.observaciones = observaciones ? String(observaciones).trim() : null;
  if (activo !== undefined) updates.activo = activo;

  const { error } = await supabase.from("vendedores").update(updates).eq("id", id);

  if (error) {
    const msg =
      error.code === "23505"
        ? error.message.includes("codigo_interno")
          ? "Ya existe un vendedor con ese código interno"
          : error.message.includes("dni")
            ? "Ya existe un vendedor con ese DNI"
            : error.message
        : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: miUsuario } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!miUsuario || !["administrador", "auditor"].includes(miUsuario.rol)) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const { error } = await supabase.from("vendedores").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
