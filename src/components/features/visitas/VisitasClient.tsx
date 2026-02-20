"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { imprimirComoPdf, contenidoPdfVisita } from "@/lib/pdfUtils";

type Cliente = { id: string; nombre: string };
type Vendedor = { id: string; nombre: string };

type Visita = {
  id: string;
  id_cliente: string;
  id_vendedor: string;
  fecha_visita: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  observaciones: string | null;
  estado: string;
  clientes: { nombre: string } | null;
  vendedores: { nombre: string } | null;
};

const ESTADOS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "realizada", label: "Realizada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "reprogramada", label: "Reprogramada" },
];

const DIAS_SEMANA = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatTime(t: string | null): string {
  if (!t) return "—";
  const [h, m] = t.split(":");
  return `${h}:${m || "00"}`;
}

function toTimeInput(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":");
  return `${h || "00"}:${m || "00"}`;
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-400/90 text-yellow-950",
  realizada: "bg-green-500/80 text-green-950",
  cancelada: "bg-red-400/80 text-red-950",
  reprogramada: "bg-orange-500/80 text-orange-950",
};

const ESTADO_LEGEND_BG: Record<string, string> = {
  pendiente: "bg-yellow-400",
  realizada: "bg-green-500",
  cancelada: "bg-red-400",
  reprogramada: "bg-orange-500",
};

function buildCalendarGrid(mes: number, anio: number): Date[][] {
  const primerDia = new Date(anio, mes - 1, 1);
  const offset = (primerDia.getDay() + 6) % 7; // Lunes = 0
  const primeraCelda = new Date(anio, mes - 1, 1 - offset);

  const semanas: Date[][] = [];
  for (let i = 0; i < 6; i++) {
    const semana: Date[] = [];
    for (let j = 0; j < 7; j++) {
      const d = new Date(primeraCelda);
      d.setDate(primeraCelda.getDate() + i * 7 + j);
      semana.push(d);
    }
    semanas.push(semana);
  }
  return semanas;
}

export function VisitasClient({
  visitas,
  clientes,
  vendedores,
  rol,
  mes,
  anio,
}: {
  visitas: Visita[];
  clientes: Cliente[];
  vendedores: Vendedor[];
  rol: string;
  mes: number;
  anio: number;
}) {
  const [modal, setModal] = useState<"nuevo" | "editar" | null>(null);
  const [visitaEdit, setVisitaEdit] = useState<Visita | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formCliente, setFormCliente] = useState("");
  const [formVendedor, setFormVendedor] = useState("");
  const [formFecha, setFormFecha] = useState("");
  const [formHoraInicio, setFormHoraInicio] = useState("");
  const [formHoraFin, setFormHoraFin] = useState("");
  const [formObservaciones, setFormObservaciones] = useState("");
  const [formEstado, setFormEstado] = useState("pendiente");

  const router = useRouter();
  const canEdit = ["administrador", "auditor"].includes(rol);

  const visitasPorFecha = useMemo(() => {
    const map = new Map<string, Visita[]>();
    for (const v of visitas) {
      const key = v.fecha_visita;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const ha = a.hora_inicio || "00:00";
        const hb = b.hora_inicio || "00:00";
        return ha.localeCompare(hb);
      });
    }
    return map;
  }, [visitas]);

  const grid = useMemo(() => buildCalendarGrid(mes, anio), [mes, anio]);

  const mesAnterior = mes === 1 ? 12 : mes - 1;
  const anioAnterior = mes === 1 ? anio - 1 : anio;
  const mesSiguiente = mes === 12 ? 1 : mes + 1;
  const anioSiguiente = mes === 12 ? anio + 1 : anio;

  function abrirNuevo() {
    setFormCliente("");
    setFormVendedor("");
    setFormFecha(new Date().toISOString().slice(0, 10));
    setFormHoraInicio("");
    setFormHoraFin("");
    setFormObservaciones("");
    setFormEstado("pendiente");
    setError(null);
    setModal("nuevo");
  }

  function abrirEditar(v: Visita) {
    setVisitaEdit(v);
    setFormCliente(v.id_cliente);
    setFormVendedor(v.id_vendedor);
    setFormFecha(v.fecha_visita);
    setFormHoraInicio(toTimeInput(v.hora_inicio));
    setFormHoraFin(toTimeInput(v.hora_fin));
    setFormObservaciones(v.observaciones || "");
    setFormEstado(v.estado);
    setError(null);
    setModal("editar");
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/visitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: formCliente,
          id_vendedor: formVendedor,
          fecha_visita: formFecha,
          hora_inicio: formHoraInicio || undefined,
          hora_fin: formHoraFin || undefined,
          observaciones: formObservaciones || undefined,
          estado: formEstado,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear visita");
      setModal(null);
      router.push(`/visitas?mes=${mes}&anio=${anio}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear visita");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditar(e: React.FormEvent) {
    e.preventDefault();
    if (!visitaEdit) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/visitas/${visitaEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: formCliente,
          id_vendedor: formVendedor,
          fecha_visita: formFecha,
          hora_inicio: formHoraInicio || undefined,
          hora_fin: formHoraFin || undefined,
          observaciones: formObservaciones || undefined,
          estado: formEstado,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setModal(null);
      router.push(`/visitas?mes=${mes}&anio=${anio}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 flex gap-4">
      <div className="flex-1 min-w-0">
        {/* Header calendario */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-200">
              Calendario de programación
            </h2>
            <span className="text-sm text-slate-400">(por defecto mes actual)</span>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={abrirNuevo}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium text-sm"
              >
                Programar visita
              </button>
            )}
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-600">
              <Link
                href={`/visitas?mes=${mesAnterior}&anio=${anioAnterior}`}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
                aria-label="Mes anterior"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <span className="px-3 py-1 text-slate-200 font-medium min-w-[140px] text-center">
                {MESES[mes - 1]} {anio}
              </span>
              <Link
                href={`/visitas?mes=${mesSiguiente}&anio=${anioSiguiente}`}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
                aria-label="Mes siguiente"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Grid calendario */}
        <div className="bg-slate-850 rounded-xl border border-slate-700 overflow-hidden">
          <div className="grid grid-cols-7">
            {DIAS_SEMANA.map((d) => (
              <div
                key={d}
                className="py-2 px-1 text-center text-xs font-semibold text-primary-500 bg-primary-950/30 border-b border-r border-slate-700 last:border-r-0"
              >
                {d}
              </div>
            ))}
            {grid.map((semana, i) =>
              semana.map((fecha, j) => {
                if (!fecha) return null;
                const esMesActual = fecha.getMonth() === mes - 1 && fecha.getFullYear() === anio;
                const key = fecha.toISOString().slice(0, 10);
                const visitasDia = visitasPorFecha.get(key) ?? [];

                return (
                  <div
                    key={`${i}-${j}`}
                    className={`min-h-[100px] p-1.5 border-b border-r border-slate-700 last:border-r-0 flex flex-col ${
                      esMesActual ? "bg-slate-800/50" : "bg-slate-900/50"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium mb-1 ${
                        esMesActual ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {fecha.getDate()}
                    </span>
                    <div className="flex-1 space-y-1 overflow-y-auto">
                      {visitasDia.map((v, idx) => (
                        <div
                          key={v.id}
                          className={`rounded px-2 py-1 text-xs ${ESTADO_COLORS[v.estado] || "bg-slate-600 text-slate-200"}`}
                        >
                          <div className="font-medium truncate">
                            {idx + 1}º Visita · {v.clientes?.nombre || "—"}
                          </div>
                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <span className="truncate opacity-90">
                              {formatTime(v.hora_inicio)} – {formatTime(v.hora_fin)}
                            </span>
                            <div className="flex gap-0.5 shrink-0">
                              <button
                                onClick={() => abrirEditar(v)}
                                className="p-0.5 rounded hover:bg-black/20"
                                title="Editar"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  const fechaStr = new Date().toLocaleString("es-AR");
                                  const contenido = contenidoPdfVisita(
                                    v.fecha_visita,
                                    v.clientes?.nombre || "—",
                                    v.vendedores?.nombre || "—",
                                    formatTime(v.hora_inicio),
                                    formatTime(v.hora_fin),
                                    v.observaciones || "",
                                    ESTADOS.find((e) => e.value === v.estado)?.label || v.estado
                                  );
                                  imprimirComoPdf(`Visita - ${v.clientes?.nombre || "—"}`, contenido, fechaStr);
                                }}
                                className="p-0.5 rounded hover:bg-black/20"
                                title="Ver detalle (PDF)"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="w-44 shrink-0">
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Estado</h3>
          <div className="space-y-2">
            {ESTADOS.map((e) => (
              <div key={e.value} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded shrink-0 ${ESTADO_LEGEND_BG[e.value] || "bg-slate-600"}`}
                />
                <span className="text-sm text-slate-300">{e.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Nuevo */}
      {modal === "nuevo" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200">Programar visita</h2>
            {error && (
              <div className="mt-2 p-2 rounded bg-red-900/50 text-red-300 text-sm">{error}</div>
            )}
            <form onSubmit={handleCrear} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Cliente *</label>
                <select
                  value={formCliente}
                  onChange={(e) => setFormCliente(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Vendedor *</label>
                <select
                  value={formVendedor}
                  onChange={(e) => setFormVendedor(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Seleccionar vendedor</option>
                  {vendedores.map((v) => (
                    <option key={v.id} value={v.id}>{v.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={formFecha}
                  onChange={(e) => setFormFecha(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Hora inicio</label>
                  <input
                    type="time"
                    value={formHoraInicio}
                    onChange={(e) => setFormHoraInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Hora fin</label>
                  <input
                    type="time"
                    value={formHoraFin}
                    onChange={(e) => setFormHoraFin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Estado</label>
                <select
                  value={formEstado}
                  onChange={(e) => setFormEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Observaciones</label>
                <textarea
                  value={formObservaciones}
                  onChange={(e) => setFormObservaciones(e.target.value)}
                  rows={3}
                  placeholder="Notas adicionales..."
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Programar visita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modal === "editar" && visitaEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200">Editar visita</h2>
            {error && (
              <div className="mt-2 p-2 rounded bg-red-900/50 text-red-300 text-sm">{error}</div>
            )}
            <form onSubmit={handleEditar} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Cliente *</label>
                <select
                  value={formCliente}
                  onChange={(e) => setFormCliente(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Vendedor *</label>
                <select
                  value={formVendedor}
                  onChange={(e) => setFormVendedor(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {vendedores.map((v) => (
                    <option key={v.id} value={v.id}>{v.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={formFecha}
                  onChange={(e) => setFormFecha(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Hora inicio</label>
                  <input
                    type="time"
                    value={formHoraInicio}
                    onChange={(e) => setFormHoraInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Hora fin</label>
                  <input
                    type="time"
                    value={formHoraFin}
                    onChange={(e) => setFormHoraFin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Estado</label>
                <select
                  value={formEstado}
                  onChange={(e) => setFormEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Observaciones</label>
                <textarea
                  value={formObservaciones}
                  onChange={(e) => setFormObservaciones(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
