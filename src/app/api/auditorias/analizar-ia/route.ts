import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { SECCIONES_ENCUESTA, PREGUNTAS_CLAVE } from "@/data/encuestaSatisfaccionCriterios";
import { SECCIONES_EVALUACION } from "@/data/evaluacionCriterios";

const PUNTAJE_MAXIMO_ENCUESTA = 72;
const PUNTAJE_MAXIMO_EVALUACION = 66;

type AuditData = Record<string, unknown>;

function buildInformeFromAudit(data: AuditData, clienteNombre?: string, vendedorNombre?: string): string {
  const lineas: string[] = [];

  lineas.push("=== DATOS GENERALES ===");
  lineas.push(`Cliente: ${clienteNombre ?? data.id_cliente ?? "—"}`);
  lineas.push(`Vendedor: ${vendedorNombre ?? data.id_vendedor ?? "—"}`);
  lineas.push(`Fecha: ${data.fecha ?? "—"}`);
  lineas.push(`Observaciones generales: ${(data.observaciones_generales as string) || "—"}`);
  lineas.push("");

  lineas.push("=== ENCUESTA DE SATISFACCIÓN DEL CLIENTE ===");
  const ponderacionesEncuesta = (Array.isArray(data.ponderaciones_encuesta) ? data.ponderaciones_encuesta as number[] : null) ?? [20, 20, 20, 20, 20];
  SECCIONES_ENCUESTA.forEach((seccion, i) => {
    const total = seccion.criterios.reduce((s, c) => {
      const v = data[c.key];
      return s + (typeof v === "number" ? v : 0);
    }, 0);
    const max = seccion.criterios.length * 3;
    lineas.push(`${seccion.titulo} (ponderación ${ponderacionesEncuesta[i] ?? 20}%): ${total} / ${max}`);
  });
  lineas.push(`Puntaje total encuesta: ${data.puntaje_satisfaccion ?? 0} / ${PUNTAJE_MAXIMO_ENCUESTA}`);
  lineas.push("");
  lineas.push("Preguntas clave:");
  PREGUNTAS_CLAVE.forEach((p) => {
    const val = (data[p.key] as string) || "";
    lineas.push(`- ${p.label}: ${val || "—"}`);
  });
  lineas.push("");

  lineas.push("=== EVALUACIÓN DEL CLIENTE ===");
  const ponderacionesEval = (Array.isArray(data.ponderaciones) ? data.ponderaciones as number[] : null) ?? [20, 20, 20, 20, 20];
  SECCIONES_EVALUACION.forEach((seccion, i) => {
    const total = seccion.criterios.reduce((s, c) => {
      const v = data[c.key];
      return s + (typeof v === "number" ? v : 0);
    }, 0);
    const max = seccion.criterios.length * 3;
    lineas.push(`${seccion.titulo} (ponderación ${ponderacionesEval[i] ?? 20}%): ${total} / ${max}`);
  });
  lineas.push(`Puntaje final evaluación: ${data.puntaje_final ?? "—"} / ${PUNTAJE_MAXIMO_EVALUACION}`);
  lineas.push("");

  return lineas.join("\n");
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Analizar con IA no está configurado. Falta OPENAI_API_KEY." },
        { status: 503 }
      );
    }

    let body: { id?: string; cliente_nombre?: string; vendedor_nombre?: string; [key: string]: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
    }

    let auditData: AuditData;
    const clienteNombre = body.cliente_nombre as string | undefined;
    const vendedorNombre = body.vendedor_nombre as string | undefined;

    if (body.id) {
      const { data, error } = await supabase
        .from("registro_auditoria")
        .select("*")
        .eq("id", body.id)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Auditoría no encontrada" }, { status: 404 });
      }
      auditData = data as AuditData;
    } else {
      auditData = { ...body };
      delete auditData.cliente_nombre;
      delete auditData.vendedor_nombre;
    }

    const informe = buildInformeFromAudit(auditData, clienteNombre, vendedorNombre);

    const systemPrompt = `Eres un analista de auditorías comerciales. Te pasan un informe de auditoría con datos generales, encuesta de satisfacción del cliente (puntajes por sección y ponderaciones) y evaluación del cliente (puntajes por sección y ponderación). Debes responder ÚNICAMENTE con un JSON válido, sin markdown ni texto extra, con exactamente dos claves:
- "analisis_encuesta": texto del Análisis FODA de la encuesta de satisfacción (Fortalezas, Debilidades, Oportunidades, Amenazas) e incluir recomendaciones de mejora basadas en los puntajes y las preguntas clave.
- "analisis_final": texto del Análisis final de la evaluación del cliente (FODA) con recomendaciones de mejora para la relación comercial.

Ambos textos en español, claros y concretos, usando la información del informe. Si falta información, indica que se complete la auditoría.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Informe de auditoría:\n\n${informe}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = (errData as { error?: { message?: string } })?.error?.message ?? response.statusText;
      return NextResponse.json(
        { error: `Error al llamar a la IA: ${msg}` },
        { status: 502 }
      );
    }

    const result = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = result.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "La IA no devolvió contenido" }, { status: 502 });
    }

    let parsed: { analisis_encuesta?: string; analisis_final?: string };
    try {
      const trimmed = content.trim();
      const jsonStr = trimmed.startsWith("```") ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim() : trimmed;
      parsed = JSON.parse(jsonStr) as { analisis_encuesta?: string; analisis_final?: string };
    } catch {
      return NextResponse.json({ error: "La IA devolvió un formato inválido. Intentá de nuevo." }, { status: 502 });
    }
    const analisis_encuesta = typeof parsed.analisis_encuesta === "string" ? parsed.analisis_encuesta : "";
    const analisis_final = typeof parsed.analisis_final === "string" ? parsed.analisis_final : "";

    return NextResponse.json({ analisis_encuesta, analisis_final });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
