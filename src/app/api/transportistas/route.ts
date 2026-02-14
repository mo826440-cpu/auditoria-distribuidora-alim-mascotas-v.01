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

  if (!String(nombre || "").trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }
  if (String(nombre).length > 100) {
    return NextResponse.json({ error: "Nombre: máximo 100 caracteres" }, { status: 400 });
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

  const dniStr = String(dni || "").replace(/\s/g, "");
  const dniFormateado = formatearDni(dniStr);
  if (dniFormateado.length !== 10) {
    return NextResponse.json({
      error: "DNI debe tener exactamente 8 dígitos (formato XX.XXX.XXX)",
    }, { status: 400 });
  }
  if (!DNI_REGEX.test(dniFormateado)) {
    return NextResponse.json({ error: "DNI inválido" }, { status: 400 });
  }

  const emailStr = email ? String(email).trim() : "";
  if (emailStr && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    return NextResponse.json({ error: "Email con formato inválido" }, { status: 400 });
  }

  const residenciaStr = residencia ? String(residencia).trim().slice(0, 100) : "";
  const zonasArr = Array.isArray(id_zonas)
    ? (id_zonas as string[]).filter((z): z is string => typeof z === "string")
    : [];

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = serviceRoleKey
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { persistSession: false } }
      )
    : supabase;

  const { data: dupCodigoList } = await supabaseAdmin
    .from("transportistas")
    .select("id")
    .eq("id_comercio", usuario.id_comercio)
    .eq("codigo_interno", codigoStr)
    .limit(1);

  if (dupCodigoList && dupCodigoList.length > 0) {
    return NextResponse.json({ error: "Ya existe un transportista con ese código interno" }, { status: 400 });
  }

  const { data: dupDniList } = await supabaseAdmin
    .from("transportistas")
    .select("id")
    .eq("id_comercio", usuario.id_comercio)
    .eq("dni", dniFormateado)
    .limit(1);

  if (dupDniList && dupDniList.length > 0) {
    return NextResponse.json({ error: "Ya existe un transportista con ese DNI" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("transportistas")
    .insert({
      id_comercio: usuario.id_comercio,
      nombre: String(nombre).trim(),
      contacto: contactoStr,
      email: emailStr || null,
      codigo_interno: codigoStr,
      dni: dniFormateado,
      id_zonas: zonasArr.length > 0 ? zonasArr : null,
      residencia: residenciaStr || null,
      observaciones: observaciones ? String(observaciones).trim() : null,
      activo: activo !== false,
      id_usuario_registro: user.id,
    })
    .select("id")
    .single();

  if (error) {
    const msg =
      error.code === "23505"
        ? error.message.includes("codigo_interno")
          ? "Ya existe un transportista con ese código interno"
          : error.message.includes("dni")
            ? "Ya existe un transportista con ese DNI"
            : error.message
        : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
