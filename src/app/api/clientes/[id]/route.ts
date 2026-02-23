import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const E164_REGEX = /^\+[1-9]\d{6,14}$/;
const CODIGO_INTERNO_REGEX = /^[0-9\-]+$/;
const CUIT_REGEX = /^\d{2}-\d{8}-\d{1}$/;

function validarCuit(cuit: string): boolean {
  if (!CUIT_REGEX.test(cuit.replace(/\s/g, ""))) return false;
  const [a, b, c] = cuit.replace(/\s/g, "").split("-").map(Number);
  if (isNaN(a) || isNaN(b) || isNaN(c)) return false;
  return true;
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
    nombre_representante,
    contacto,
    email,
    codigo_interno,
    nombre,
    cuit,
    id_zona,
    id_tipo_comercio,
    localidad,
    provincia,
    calle,
    numero,
    id_vendedor_frecuente,
    id_transportista_frecuente,
    observaciones,
    activo,
  } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (nombre_representante !== undefined) {
    const v = String(nombre_representante).trim();
    if (!v) return NextResponse.json({ error: "Nombre representante obligatorio" }, { status: 400 });
    if (v.length > 100) return NextResponse.json({ error: "Nombre representante: max 100" }, { status: 400 });
    updates.nombre_representante = v;
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
      .from("clientes")
      .select("id")
      .eq("id_comercio", miUsuario.id_comercio)
      .eq("codigo_interno", v)
      .neq("id", id)
      .limit(1);
    if (dupList && dupList.length > 0) return NextResponse.json({ error: "Ya existe un cliente con ese código interno" }, { status: 400 });
    updates.codigo_interno = v;
  }
  if (nombre !== undefined) {
    const v = String(nombre).trim();
    if (!v) return NextResponse.json({ error: "Nombre comercio obligatorio" }, { status: 400 });
    if (v.length > 100) return NextResponse.json({ error: "Nombre comercio: max 100" }, { status: 400 });
    updates.nombre = v;
  }
  if (cuit !== undefined) {
    const v = String(cuit).replace(/\s/g, "");
    if (!v) return NextResponse.json({ error: "CUIT obligatorio" }, { status: 400 });
    if (!validarCuit(v)) return NextResponse.json({ error: "CUIT formato XX-XXXXXXXX-X" }, { status: 400 });
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseCheck = serviceRoleKey
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, { auth: { persistSession: false } })
      : supabase;
    const { data: dupCuitList } = await supabaseCheck
      .from("clientes")
      .select("id")
      .eq("id_comercio", miUsuario.id_comercio)
      .eq("cuit", v)
      .neq("id", id)
      .limit(1);
    if (dupCuitList && dupCuitList.length > 0) return NextResponse.json({ error: "Ya existe un cliente con ese CUIT" }, { status: 400 });
    updates.cuit = v;
  }
  if (id_zona !== undefined) updates.id_zona = id_zona || null;
  if (id_tipo_comercio !== undefined) updates.id_tipo_comercio = id_tipo_comercio || null;
  if (localidad !== undefined) updates.localidad = localidad ? String(localidad).trim() : null;
  if (provincia !== undefined) updates.provincia = provincia ? String(provincia).trim() : "Córdoba";
  if (id_vendedor_frecuente !== undefined) updates.id_vendedor_frecuente = id_vendedor_frecuente || null;
  if (id_transportista_frecuente !== undefined) updates.id_transportista_frecuente = id_transportista_frecuente || null;
  if (calle !== undefined) {
    const v = String(calle).trim();
    if (!v) return NextResponse.json({ error: "Calle obligatoria" }, { status: 400 });
    if (v.length > 100) return NextResponse.json({ error: "Calle: max 100" }, { status: 400 });
    updates.calle = v;
  }
  if (numero !== undefined) {
    const num = Number(numero);
    if (numero === undefined || numero === null || isNaN(num) || !Number.isInteger(num)) {
      return NextResponse.json({ error: "Número debe ser entero" }, { status: 400 });
    }
    updates.numero = num;
  }
  if (observaciones !== undefined) updates.observaciones = observaciones ? String(observaciones).trim() : null;
  if (activo !== undefined) updates.activo = activo;

  const { error } = await supabase.from("clientes").update(updates).eq("id", id);

  if (error) {
    const msg =
      error.code === "23505"
        ? error.message.includes("codigo_interno")
          ? "Ya existe un cliente con ese código interno"
          : error.message.includes("cuit")
            ? "Ya existe un cliente con ese CUIT"
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

  const { error } = await supabase.from("clientes").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
