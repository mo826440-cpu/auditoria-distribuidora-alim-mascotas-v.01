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

export async function POST(request: Request) {
  const supabase = await createServerClient();
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
    localidad,
    provincia,
    calle,
    numero,
    observaciones,
    activo,
  } = body;

  if (!String(nombre_representante || "").trim()) {
    return NextResponse.json({ error: "El nombre del representante es obligatorio" }, { status: 400 });
  }
  if (String(nombre_representante).length > 100) {
    return NextResponse.json({ error: "Nombre representante: máximo 100 caracteres" }, { status: 400 });
  }

  const contactoStr = String(contacto || "").trim();
  if (!contactoStr) {
    return NextResponse.json({ error: "El contacto es obligatorio" }, { status: 400 });
  }
  if (!E164_REGEX.test(contactoStr)) {
    return NextResponse.json({
      error: "Contacto debe estar en formato E.164 (ej: +5493511234567)",
    }, { status: 400 });
  }

  const codigoStr = String(codigo_interno || "").trim();
  if (!codigoStr) {
    return NextResponse.json({ error: "El código interno es obligatorio" }, { status: 400 });
  }
  if (!CODIGO_INTERNO_REGEX.test(codigoStr)) {
    return NextResponse.json({
      error: "Código interno: solo números y guiones (-)",
    }, { status: 400 });
  }

  if (!String(nombre || "").trim()) {
    return NextResponse.json({ error: "El nombre del comercio es obligatorio" }, { status: 400 });
  }
  if (String(nombre).length > 100) {
    return NextResponse.json({ error: "Nombre comercio: máximo 100 caracteres" }, { status: 400 });
  }

  const cuitStr = String(cuit || "").replace(/\s/g, "");
  if (!cuitStr) {
    return NextResponse.json({ error: "El CUIT es obligatorio" }, { status: 400 });
  }
  if (!validarCuit(cuitStr)) {
    return NextResponse.json({
      error: "CUIT debe tener formato XX-XXXXXXXX-X",
    }, { status: 400 });
  }

  if (!String(calle || "").trim()) {
    return NextResponse.json({ error: "La calle es obligatoria" }, { status: 400 });
  }
  if (String(calle).length > 100) {
    return NextResponse.json({ error: "Calle: máximo 100 caracteres" }, { status: 400 });
  }

  const num = Number(numero);
  if (numero === undefined || numero === null || isNaN(num) || !Number.isInteger(num)) {
    return NextResponse.json({ error: "El número es obligatorio y debe ser entero" }, { status: 400 });
  }

  const emailStr = email ? String(email).trim() : "";
  if (emailStr && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    return NextResponse.json({ error: "Email con formato inválido" }, { status: 400 });
  }

  // Verificar duplicados con cliente admin (bypass RLS) para asegurar que no se pierdan registros
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = serviceRoleKey
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { persistSession: false } }
      )
    : supabase;

  const { data: dupCodigoList } = await supabaseAdmin
    .from("clientes")
    .select("id")
    .eq("id_comercio", usuario.id_comercio)
    .eq("codigo_interno", codigoStr)
    .limit(1);

  if (dupCodigoList && dupCodigoList.length > 0) {
    return NextResponse.json({ error: "Ya existe un cliente con ese código interno" }, { status: 400 });
  }

  const { data: dupCuitList } = await supabaseAdmin
    .from("clientes")
    .select("id")
    .eq("id_comercio", usuario.id_comercio)
    .eq("cuit", cuitStr)
    .limit(1);

  if (dupCuitList && dupCuitList.length > 0) {
    return NextResponse.json({ error: "Ya existe un cliente con ese CUIT" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("clientes")
    .insert({
      id_comercio: usuario.id_comercio,
      nombre_representante: String(nombre_representante).trim(),
      contacto: contactoStr,
      email: emailStr || null,
      codigo_interno: codigoStr,
      nombre: String(nombre).trim(),
      cuit: cuitStr,
      id_zona: id_zona || null,
      localidad: localidad ? String(localidad).trim() : null,
      provincia: provincia ? String(provincia).trim() : "Córdoba",
      calle: String(calle).trim(),
      numero: num,
      observaciones: observaciones ? String(observaciones).trim() : null,
      activo: activo !== false,
      id_usuario_registro: user.id,
    })
    .select("id")
    .single();

  if (error) {
    // Código 23505 = violación de unicidad (por si la verificación previa no la detectó)
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

  return NextResponse.json({ ok: true, id: data.id });
}
