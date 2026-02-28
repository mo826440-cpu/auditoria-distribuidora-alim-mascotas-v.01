"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { imprimirComoPdf, contenidoPdfVisitaCompleto } from "@/lib/pdfUtils";
import { ESTADOS_VISITA, ESTADO_LEGEND_BG_VISITA } from "@/data/estadosVisita";

type Zona = { id: string; nombre: string };
type Vendedor = { id: string; nombre: string; id_zonas?: string[] | null };

type ClienteFull = {
  id: string;
  nombre: string;
  nombre_representante?: string | null;
  contacto?: string | null;
  email?: string | null;
  codigo_interno?: string | null;
  cuit?: string | null;
  id_zona?: string | null;
  id_tipo_comercio?: string | null;
  id_vendedor_frecuente?: string | null;
  zona_nombre?: string | null;
  tipo_comercio_nombre?: string | null;
  vendedor_nombre?: string | null;
  transportista_nombre?: string | null;
  localidad?: string | null;
  provincia?: string | null;
  calle?: string | null;
  numero?: number | null;
  observaciones?: string | null;
};

type UsuarioItem = { id: string; nombre: string; email?: string };

type Visita = {
  id: string;
  id_cliente: string;
  id_vendedor: string;
  id_auditor?: string | null;
  fecha_visita: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  observaciones: string | null;
  estado: string;
  clientes: { nombre: string } | null;
  vendedores: { nombre: string } | null;
};

function urlGoogleMaps(localidad: string, provincia: string, calle: string, numero: number): string {
  const direccion = `${localidad}, ${provincia}, ${calle} ${numero}, Argentina`;
  const q = encodeURIComponent(direccion);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

const ESTADOS = ESTADOS_VISITA;

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
  parcial: "bg-amber-500/80 text-amber-950",
};

const ESTADO_LEGEND_BG = ESTADO_LEGEND_BG_VISITA;

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

function buildWeekGrid(): Date[][] {
  const hoy = new Date();
  const dia = hoy.getDay();
  const offsetLunes = dia === 0 ? -6 : 1 - dia;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + offsetLunes);
  const semana: Date[] = [];
  for (let j = 0; j < 7; j++) {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + j);
    semana.push(d);
  }
  return [semana];
}

const ANIOS = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 5 + i);

export function VisitasClient({
  visitas,
  clientes,
  vendedores,
  zonas,
  usuarios,
  rol,
  mes,
  anio,
  vista,
  verVisitaId,
}: {
  visitas: Visita[];
  clientes: ClienteFull[];
  vendedores: Vendedor[];
  zonas: Zona[];
  usuarios: UsuarioItem[];
  rol: string;
  mes: number;
  anio: number;
  vista: "completo" | "semana";
  verVisitaId?: string;
}) {
  const [modal, setModal] = useState<"nuevo" | "editar" | "detalle" | null>(null);
  const [visitaEdit, setVisitaEdit] = useState<Visita | null>(null);
  const [visitaDetalle, setVisitaDetalle] = useState<Visita | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formZona, setFormZona] = useState("");
  const [formCliente, setFormCliente] = useState("");
  const [formAuditor, setFormAuditor] = useState("");
  const [formFecha, setFormFecha] = useState("");
  const [formHoraInicio, setFormHoraInicio] = useState("");
  const [formHoraFin, setFormHoraFin] = useState("");
  const [formObservaciones, setFormObservaciones] = useState("");
  const [formEstado, setFormEstado] = useState("pendiente");

  const clientesPorZona = formZona ? clientes.filter((c) => c.id_zona === formZona) : [];
  const clientesMap = useMemo(() => new Map(clientes.map((c) => [c.id, c])), [clientes]);
  const usuariosMap = useMemo(() => new Map(usuarios.map((u) => [u.id, u])), [usuarios]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const canEdit = ["administrador", "auditor"].includes(rol);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasVistaParam = searchParams.get("vista");
    if (hasVistaParam) return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile && vista === "completo") {
      router.replace(`/visitas?mes=${mes}&anio=${anio}&vista=semana`);
    }
  }, [searchParams, vista, mes, anio, router]);

  useEffect(() => {
    if (!verVisitaId || !visitas.length) return;
    const v = visitas.find((x) => x.id === verVisitaId);
    if (v) {
      setVisitaDetalle(v);
      setModal("detalle");
    }
  }, [verVisitaId, visitas]);

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

  const grid = useMemo(
    () => (vista === "semana" ? buildWeekGrid() : buildCalendarGrid(mes, anio)),
    [vista, mes, anio]
  );

  function getIdVendedorParaCliente(clienteId: string, zonaId: string): string | null {
    const cli = clientesMap.get(clienteId);
    if (cli?.id_vendedor_frecuente) return cli.id_vendedor_frecuente;
    const vendedorZona = vendedores.find((v) => (v.id_zonas ?? []).includes(zonaId));
    return vendedorZona?.id ?? null;
  }

  function abrirNuevo() {
    setFormZona("");
    setFormCliente("");
    setFormAuditor("");
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
    const cli = clientesMap.get(v.id_cliente);
    setFormZona(cli?.id_zona ?? "");
    setFormCliente(v.id_cliente);
    setFormAuditor(v.id_auditor ?? "");
    setFormFecha(v.fecha_visita);
    setFormHoraInicio(toTimeInput(v.hora_inicio));
    setFormHoraFin(toTimeInput(v.hora_fin));
    setFormObservaciones(v.observaciones || "");
    setFormEstado(v.estado);
    setError(null);
    setModal("editar");
  }

  function abrirDetalle(v: Visita) {
    setVisitaDetalle(v);
    setModal("detalle");
  }

  function limpiarFormulario() {
    setFormZona("");
    setFormCliente("");
    setFormAuditor("");
    setFormFecha(new Date().toISOString().slice(0, 10));
    setFormHoraInicio("");
    setFormHoraFin("");
    setFormObservaciones("");
    setFormEstado("pendiente");
    setError(null);
  }

  const handleCancelarConConfirmar = useCallback(() => {
    if (window.confirm("¿Está seguro que desea cancelar? Se perderán los cambios no guardados.")) {
      limpiarFormulario();
      setModal(null);
      setVisitaEdit(null);
    }
  }, []);

  const handleClickFuera = useCallback(() => {
    setModal(null);
  }, []);

  useEffect(() => {
    if (!modal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modal === "detalle") {
          setModal(null);
        } else if (modal === "nuevo" || modal === "editar") {
          if (window.confirm("¿Está seguro que desea cancelar? Se perderán los cambios no guardados.")) {
            limpiarFormulario();
            setModal(null);
            setVisitaEdit(null);
          }
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal]);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const idVendedor = getIdVendedorParaCliente(formCliente, formZona);
    if (!idVendedor) {
      setError("El cliente debe tener vendedor frecuente o la zona debe tener vendedores asignados");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/visitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: formCliente,
          id_vendedor: idVendedor,
          id_auditor: formAuditor || undefined,
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
      router.push(`/visitas?mes=${mes}&anio=${anio}&vista=${vista}`);
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
    const idVendedor = getIdVendedorParaCliente(formCliente, formZona);
    if (!idVendedor) {
      setError("El cliente debe tener vendedor frecuente o la zona debe tener vendedores asignados");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/visitas/${visitaEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: formCliente,
          id_vendedor: idVendedor,
          id_auditor: formAuditor || undefined,
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
      router.push(`/visitas?mes=${mes}&anio=${anio}&vista=${vista}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex-1 min-w-0">
        {/* Header calendario */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">
              Calendario de programación
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {canEdit && (
              <button
                onClick={abrirNuevo}
                className="w-fit px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium text-sm"
              >
                Programar visita
              </button>
            )}
            <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-2">
              <div className="flex items-center gap-2">
                <select
                  value={anio}
                  onChange={(e) => {
                    const nuevoAnio = parseInt(e.target.value, 10);
                    router.push(`/visitas?mes=${mes}&anio=${nuevoAnio}&vista=${vista === "semana" ? "completo" : vista}`);
                  }}
                  className="w-full md:w-auto px-3 py-1.5 text-sm border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={vista === "semana"}
                >
                  {ANIOS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={mes}
                  onChange={(e) => {
                    const nuevoMes = parseInt(e.target.value, 10);
                    router.push(`/visitas?mes=${nuevoMes}&anio=${anio}&vista=${vista === "semana" ? "completo" : vista}`);
                  }}
                  className="w-full md:w-auto px-3 py-1.5 text-sm border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={vista === "semana"}
                >
                  {MESES.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={vista}
                  onChange={(e) => {
                    const nuevaVista = e.target.value as "completo" | "semana";
                    router.push(`/visitas?mes=${mes}&anio=${anio}&vista=${nuevaVista}`);
                  }}
                  className="w-full md:w-auto px-3 py-1.5 text-sm border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="completo">Calendario completo</option>
                  <option value="semana">Semana actual</option>
                </select>
              </div>
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
                          className={`rounded px-2 py-1 text-xs min-w-0 flex items-center justify-center md:block ${ESTADO_COLORS[v.estado] || "bg-slate-600 text-slate-200"}`}
                        >
                          {/* Solo ícono en móvil */}
                          <button
                            onClick={() => abrirDetalle(v)}
                            className="p-1 rounded hover:bg-black/20 md:hidden"
                            title="Ver detalles"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          {/* Contenido completo en desktop */}
                          <div className="hidden md:flex md:items-start md:justify-between md:gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">
                                {ESTADOS.find((e) => e.value === v.estado)?.label ?? v.estado} · {idx + 1}º Visita · {v.clientes?.nombre || "—"}
                              </div>
                              <div className="truncate opacity-90 mt-0.5">
                                {formatTime(v.hora_inicio)} – {formatTime(v.hora_fin)}
                              </div>
                            </div>
                            <button
                              onClick={() => abrirDetalle(v)}
                              className="p-1 rounded hover:bg-black/20 shrink-0 self-center"
                              title="Ver detalles"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Zona *</label>
                <select
                  value={formZona}
                  onChange={(e) => {
                    setFormZona(e.target.value);
                    setFormCliente("");
                  }}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Seleccionar zona</option>
                  {zonas.map((z) => (
                    <option key={z.id} value={z.id}>{z.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Cliente *</label>
                <select
                  value={formCliente}
                  onChange={(e) => setFormCliente(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">{formZona ? "Seleccionar cliente" : "Seleccionar zona primero"}</option>
                  {clientesPorZona.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Auditor responsable</label>
                <select
                  value={formAuditor}
                  onChange={(e) => setFormAuditor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Seleccionar auditor</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre || u.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Fecha estimada *</label>
                <input
                  type="date"
                  value={formFecha}
                  onChange={(e) => setFormFecha(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Hora Inicio Estimada *</label>
                  <input
                    type="time"
                    value={formHoraInicio}
                    onChange={(e) => setFormHoraInicio(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Hora Fin Estimada *</label>
                  <input
                    type="time"
                    value={formHoraFin}
                    onChange={(e) => setFormHoraFin(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Estado *</label>
                <div className="space-y-2 pt-1">
                  {ESTADOS.map((e) => (
                    <label key={e.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="estado"
                        value={e.value}
                        checked={formEstado === e.value}
                        onChange={() => setFormEstado(e.value)}
                        className="rounded-full border-slate-500 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-slate-300">{e.label}</span>
                    </label>
                  ))}
                </div>
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
                  onClick={handleCancelarConConfirmar}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleCancelarConConfirmar}>
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-200">Editar visita</h2>
            {error && (
              <div className="mt-2 p-2 rounded bg-red-900/50 text-red-300 text-sm">{error}</div>
            )}
            <form onSubmit={handleEditar} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Zona *</label>
                <select
                  value={formZona}
                  onChange={(e) => {
                    setFormZona(e.target.value);
                    const clientesNuevaZona = clientes.filter((c) => c.id_zona === e.target.value);
                    if (!clientesNuevaZona.some((c) => c.id === formCliente)) setFormCliente("");
                  }}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Seleccionar zona</option>
                  {zonas.map((z) => (
                    <option key={z.id} value={z.id}>{z.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Cliente *</label>
                <select
                  value={formCliente}
                  onChange={(e) => setFormCliente(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">{formZona ? "Seleccionar cliente" : "Seleccionar zona primero"}</option>
                  {clientesPorZona.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Auditor responsable</label>
                <select
                  value={formAuditor}
                  onChange={(e) => setFormAuditor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Seleccionar auditor</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre || u.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Fecha estimada *</label>
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
                  <label className="block text-sm font-medium text-slate-300 mb-1">Hora Inicio Estimada *</label>
                  <input
                    type="time"
                    value={formHoraInicio}
                    onChange={(e) => setFormHoraInicio(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Hora Fin Estimada *</label>
                  <input
                    type="time"
                    value={formHoraFin}
                    onChange={(e) => setFormHoraFin(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Estado *</label>
                <div className="space-y-2 pt-1">
                  {ESTADOS.map((e) => (
                    <label key={e.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="estado-editar"
                        value={e.value}
                        checked={formEstado === e.value}
                        onChange={() => setFormEstado(e.value)}
                        className="rounded-full border-slate-500 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-slate-300">{e.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Observaciones</label>
                <textarea
                  value={formObservaciones}
                  onChange={(e) => setFormObservaciones(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={handleCancelarConConfirmar}
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

      {/* Modal Detalle */}
      {modal === "detalle" && visitaDetalle && (() => {
        const cli = clientesMap.get(visitaDetalle.id_cliente);
        const tieneUbicacion = cli?.calle && cli?.numero != null && cli?.localidad && cli?.provincia;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModal(null)}>
            <div className="bg-slate-850 rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-slate-700 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex-shrink-0 px-6 py-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-slate-200">Detalle de visita</h2>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {tieneUbicacion && (
                    <a
                      href={urlGoogleMaps(cli!.localidad!, cli!.provincia!, cli!.calle!, cli!.numero!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.preventDefault();
                        const url = urlGoogleMaps(cli!.localidad!, cli!.provincia!, cli!.calle!, cli!.numero!);
                        const w = window.open(url, "_blank", "noopener,noreferrer");
                        if (!w) window.location.href = url;
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg text-sm"
                      title="Ver ubicación"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Ubicación
                    </a>
                  )}
                  {canEdit && (
                    <Link
                      href={`/auditorias/nueva?id_cliente=${visitaDetalle.id_cliente}&id_vendedor=${visitaDetalle.id_vendedor}&id_visita=${visitaDetalle.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg text-sm"
                      title="Auditoría"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Auditoría
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      const fechaStr = new Date().toLocaleString("es-AR");
                      const auditorNombre = visitaDetalle.id_auditor
                        ? (usuariosMap.get(visitaDetalle.id_auditor)?.nombre || usuariosMap.get(visitaDetalle.id_auditor)?.email)
                        : null;
                      const contenido = contenidoPdfVisitaCompleto(
                        cli ?? { nombre: visitaDetalle.clientes?.nombre ?? "—" },
                        {
                          fecha_visita: visitaDetalle.fecha_visita,
                          hora_inicio: visitaDetalle.hora_inicio,
                          hora_fin: visitaDetalle.hora_fin,
                          estado: ESTADOS.find((e) => e.value === visitaDetalle.estado)?.label ?? visitaDetalle.estado,
                          observaciones: visitaDetalle.observaciones,
                          auditor_nombre: auditorNombre,
                        }
                      );
                      imprimirComoPdf(`Visita - ${visitaDetalle.clientes?.nombre ?? "—"}`, contenido, fechaStr);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg text-sm"
                    title="Ver detalle (PDF)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => {
                        setModal(null);
                        abrirEditar(visitaDetalle);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg text-sm"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Editar
                    </button>
                  )}
                  <button
                    onClick={() => setModal(null)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                    aria-label="Cerrar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {cli && (
                  <>
                    <section>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Datos del cliente</h3>
                      <dl className="space-y-2 text-sm">
                        <div><dt className="text-slate-500 inline">Nombre comercio:</dt> <dd className="text-slate-200 inline ml-1">{cli.nombre ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Nombre representante:</dt> <dd className="text-slate-200 inline ml-1">{cli.nombre_representante ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Contacto:</dt> <dd className="text-slate-200 inline ml-1">{cli.contacto ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Email:</dt> <dd className="text-slate-200 inline ml-1">{cli.email ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Código interno:</dt> <dd className="text-slate-200 inline ml-1">{cli.codigo_interno ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">CUIT:</dt> <dd className="text-slate-200 inline ml-1">{cli.cuit ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Tipo de comercio:</dt> <dd className="text-slate-200 inline ml-1">{cli.tipo_comercio_nombre ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Zona:</dt> <dd className="text-slate-200 inline ml-1">{cli.zona_nombre ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Localidad/Ciudad:</dt> <dd className="text-slate-200 inline ml-1">{cli.localidad ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Provincia:</dt> <dd className="text-slate-200 inline ml-1">{cli.provincia ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Calle:</dt> <dd className="text-slate-200 inline ml-1">{cli.calle ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Número:</dt> <dd className="text-slate-200 inline ml-1">{cli.numero ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Vendedor frecuente:</dt> <dd className="text-slate-200 inline ml-1">{cli.vendedor_nombre ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Transportista frecuente:</dt> <dd className="text-slate-200 inline ml-1">{cli.transportista_nombre ?? "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Observaciones:</dt> <dd className="text-slate-200 inline ml-1">{cli.observaciones ?? "—"}</dd></div>
                      </dl>
                    </section>
                    <section>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Datos de la visita</h3>
                      <dl className="space-y-2 text-sm">
                        <div><dt className="text-slate-500 inline">Auditor responsable:</dt> <dd className="text-slate-200 inline ml-1">{visitaDetalle.id_auditor ? (usuariosMap.get(visitaDetalle.id_auditor)?.nombre || usuariosMap.get(visitaDetalle.id_auditor)?.email || "—") : "—"}</dd></div>
                        <div><dt className="text-slate-500 inline">Fecha estimada:</dt> <dd className="text-slate-200 inline ml-1">{new Date(visitaDetalle.fecha_visita + "T12:00:00").toLocaleDateString("es-AR")}</dd></div>
                        <div><dt className="text-slate-500 inline">Hora inicio estimada:</dt> <dd className="text-slate-200 inline ml-1">{formatTime(visitaDetalle.hora_inicio)}</dd></div>
                        <div><dt className="text-slate-500 inline">Hora fin estimada:</dt> <dd className="text-slate-200 inline ml-1">{formatTime(visitaDetalle.hora_fin)}</dd></div>
                        <div><dt className="text-slate-500 inline">Estado:</dt> <dd className="text-slate-200 inline ml-1">{ESTADOS.find((e) => e.value === visitaDetalle.estado)?.label ?? visitaDetalle.estado}</dd></div>
                        <div><dt className="text-slate-500 inline">Observaciones:</dt> <dd className="text-slate-200 inline ml-1">{visitaDetalle.observaciones ?? "—"}</dd></div>
                      </dl>
                    </section>
                  </>
                )}
                {!cli && (
                  <p className="text-slate-400 text-sm">No se encontraron datos del cliente.</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
