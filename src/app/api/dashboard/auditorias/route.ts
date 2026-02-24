import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { puntajeMaximo } from "@/data/evaluacionCriterios";
import type { DashboardAuditoriaItem } from "./types";

const PUNTaje_MAX = puntajeMaximo();
const UMBRAL_APROBADO = 0.7 * PUNTaje_MAX;
const UMBRAL_RECHAZADO = 0.5 * PUNTaje_MAX;

function normalizarSector(raw: unknown): string {
  if (!raw) return "Sin sector";
  const ref = Array.isArray(raw) ? raw[0] : raw;
  const nombre = (ref as { nombre?: string } | null)?.nombre;
  return nombre && String(nombre).trim() ? String(nombre).trim() : "Sin sector";
}

function derivarEstado(puntajeFinal: number | null): "Aprobado" | "Rechazado" | "Pendiente" | "Regular" {
  if (puntajeFinal == null) return "Pendiente";
  if (puntajeFinal >= UMBRAL_APROBADO) return "Aprobado";
  if (puntajeFinal >= UMBRAL_RECHAZADO) return "Regular";
  return "Rechazado";
}

function derivarResultado(puntajeFinal: number | null): "Positivo" | "Negativo" | "Sin resultado" {
  if (puntajeFinal == null) return "Sin resultado";
  return puntajeFinal >= UMBRAL_APROBADO ? "Positivo" : "Negativo";
}

function derivarTipo(puntajeFinal: number | null, resultado360: string | null): string {
  if (puntajeFinal != null) return "Nueva evaluación";
  if (resultado360 != null) return "360°";
  return "Legacy";
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: rows, error } = await supabase
      .from("registro_auditoria")
      .select(`
        id,
        fecha,
        puntaje_final,
        resultado_360,
        clasificacion_cliente,
        id_vendedor,
        id_cliente,
        clientes(nombre, referencias_tipos_comercio(nombre)),
        vendedores(nombre)
      `)
      .order("fecha", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items: DashboardAuditoriaItem[] = (rows ?? []).map((r) => {
      const raw = r as Record<string, unknown>;
      const clientesRaw = raw.clientes;
      const vendedoresRaw = raw.vendedores;
      const cliente = Array.isArray(clientesRaw) ? clientesRaw[0] : clientesRaw;
      const vendedor = Array.isArray(vendedoresRaw) ? vendedoresRaw[0] : vendedoresRaw;
      const sector = normalizarSector((cliente as Record<string, unknown>)?.referencias_tipos_comercio);
      const responsable = (vendedor as { nombre?: string } | null)?.nombre ?? "Sin asignar";
      const puntajeFinal = typeof raw.puntaje_final === "number" ? raw.puntaje_final : null;
      const resultado360 = typeof raw.resultado_360 === "string" ? raw.resultado_360 : null;

      return {
        id: String(raw.id),
        fecha: String(raw.fecha ?? "").slice(0, 10),
        sector,
        responsable,
        estado: derivarEstado(puntajeFinal),
        resultado: derivarResultado(puntajeFinal),
        tipo: derivarTipo(puntajeFinal, resultado360),
        puntaje_final: puntajeFinal,
      };
    });

    return NextResponse.json({ data: items });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al cargar datos" },
      { status: 500 }
    );
  }
}
