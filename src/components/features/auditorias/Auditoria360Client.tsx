"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SECCIONES_EVALUACION,
  TODAS_LAS_CLAVES_EVALUACION,
  puntajeMaximo,
  estrellasDesdePuntaje,
} from "@/data/evaluacionCriterios";

type Cliente = { id: string; nombre: string; id_transportista_frecuente?: string | null; tipo_comercio_nombre?: string | null };
type Vendedor = { id: string; nombre: string };
type Visita = { id: string; fecha_visita: string; id_cliente?: string; id_vendedor?: string; hora_inicio?: string | null; hora_fin?: string | null };
type Transportista = { id: string; nombre: string };

function toTimeInput(t: string | null | undefined): string {
  if (!t) return "";
  if (t.length <= 5) return t;
  return t.slice(0, 5);
}

export function Auditoria360Client({
  clientes,
  vendedores,
  visitas,
  transportistas,
  idAuditoria,
  desdeVisita,
}: {
  clientes: Cliente[];
  vendedores: Vendedor[];
  visitas: Visita[];
  transportistas: Transportista[];
  idAuditoria?: string;
  desdeVisita?: { id_cliente: string; id_vendedor: string; id_visita: string };
}) {
  const router = useRouter();
  const scrollRef = useRef<number>(0);
  const [formCliente, setFormCliente] = useState("");
  const [formVendedor, setFormVendedor] = useState("");
  const [formVisita, setFormVisita] = useState("");
  const [formTransportista, setFormTransportista] = useState("");
  const [formFecha, setFormFecha] = useState("");
  const [formHoraInicio, setFormHoraInicio] = useState("");
  const [formHoraFin, setFormHoraFin] = useState("");
  const [formObservaciones, setFormObservaciones] = useState("");
  const [formAnalisisFinal, setFormAnalisisFinal] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(!!idAuditoria);
  const [error, setError] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<Record<string, number | "">>({});
  const datosSoloLectura = !!desdeVisita || !!idAuditoria;

  useEffect(() => {
    if (desdeVisita) {
      setFormCliente(desdeVisita.id_cliente);
      setFormVendedor(desdeVisita.id_vendedor);
      setFormVisita(desdeVisita.id_visita);
      const cli = clientes.find((c) => c.id === desdeVisita.id_cliente);
      setFormTransportista(cli?.id_transportista_frecuente ?? "");
      const v = visitas.find((x) => x.id === desdeVisita.id_visita);
      if (v?.fecha_visita) setFormFecha(v.fecha_visita.slice(0, 10));
      setFormHoraInicio(toTimeInput((v as { hora_inicio?: string })?.hora_inicio) || "");
      setFormHoraFin(toTimeInput((v as { hora_fin?: string })?.hora_fin) || "");
    } else if (!idAuditoria) {
      setFormFecha(new Date().toISOString().slice(0, 10));
    }
  }, [desdeVisita, clientes, visitas, idAuditoria]);

  useEffect(() => {
    if (idAuditoria) {
      fetch(`/api/auditorias/${idAuditoria}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setFormCliente(data.id_cliente ?? "");
          setFormVendedor(data.id_vendedor ?? "");
          setFormVisita(data.id_visita ?? "");
          setFormTransportista(data.id_transportista ?? "");
          setFormFecha(data.fecha ? data.fecha.slice(0, 10) : "");
          setFormObservaciones(data.observaciones_generales ?? "");
          setFormAnalisisFinal(data.analisis_final ?? "");
          setFormHoraInicio(toTimeInput(data.hora_inicio) || "");
          setFormHoraFin(toTimeInput(data.hora_fin) || "");
          const vals: Record<string, number | ""> = {};
          for (const key of TODAS_LAS_CLAVES_EVALUACION) {
            const v = data[key];
            vals[key] = typeof v === "number" && v >= 1 && v <= 5 ? v : "";
          }
          setFormValues(vals);
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar"))
        .finally(() => setLoadingAudit(false));
    }
  }, [idAuditoria]);

  useEffect(() => {
    if (formVisita && !idAuditoria) {
      const v = visitas.find((x) => x.id === formVisita);
      if (v?.fecha_visita) setFormFecha(v.fecha_visita.slice(0, 10));
      setFormHoraInicio(toTimeInput((v as { hora_inicio?: string })?.hora_inicio) || formHoraInicio);
      setFormHoraFin(toTimeInput((v as { hora_fin?: string })?.hora_fin) || formHoraFin);
    }
  }, [formVisita, visitas, idAuditoria]);

  const setCampo = useCallback((key: string, value: number | "") => {
    scrollRef.current = window.scrollY;
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    if (scrollRef.current > 0) {
      const saved = scrollRef.current;
      scrollRef.current = 0;
      const raf = requestAnimationFrame(() => {
        window.scrollTo({ top: saved, behavior: "auto" });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [formValues]);

  function getCampo(key: string): number | "" {
    return formValues[key] ?? "";
  }

  const totalesPorSeccion = SECCIONES_EVALUACION.map((seccion) =>
    seccion.criterios.reduce((sum, c) => {
      const v = getCampo(c.key);
      return sum + (typeof v === "number" && v >= 1 && v <= 5 ? v : 0);
    }, 0)
  );
  const puntajeFinal = totalesPorSeccion.reduce((a, b) => a + b, 0);
  const estrellas = estrellasDesdePuntaje(puntajeFinal);
  const maxPuntos = puntajeMaximo();

  const todosLosCamposCargados = TODAS_LAS_CLAVES_EVALUACION.every(
    (key) => typeof formValues[key] === "number" && formValues[key] >= 1 && formValues[key] <= 5
  );
  const puedeGuardar = !!formCliente && !!formVendedor && !!formFecha && todosLosCamposCargados;

  /** Genera un análisis final tipo FODA a partir de los totales por sección. */
  function generarAnalisisFinal(): string {
    const maxPorSeccion = SECCIONES_EVALUACION.map((s) => s.criterios.length * 5);
    const promedios = totalesPorSeccion.map((t, i) => (maxPorSeccion[i] ? t / maxPorSeccion[i] : 0));
    const promedioGeneral = totalesPorSeccion.reduce((a, b) => a + b, 0) / (maxPuntos || 1);
    const fortalezas: string[] = [];
    const debilidades: string[] = [];
    SECCIONES_EVALUACION.forEach((s, i) => {
      const nombre = s.titulo.charAt(0) + s.titulo.slice(1).toLowerCase();
      if (promedios[i] >= 0.7) fortalezas.push(nombre);
      else if (promedios[i] < 0.5) debilidades.push(nombre);
    });
    const lineas: string[] = [];
    lineas.push(`Puntaje total: ${puntajeFinal} / ${maxPuntos} puntos.`);
    if (fortalezas.length) lineas.push(`\nFortalezas: ${fortalezas.join(", ")}.`);
    if (debilidades.length) lineas.push(`Debilidades: ${debilidades.join(", ")}.`);
    lineas.push(promedioGeneral >= 0.7 ? "\nOportunidades: Buen nivel general; conviene sostener y profundizar la relación." : promedioGeneral >= 0.5 ? "\nOportunidades: Hay margen de mejora en aspectos puntuales." : "\nOportunidades: Trabajar en las áreas más bajas para mejorar el vínculo y los resultados.");
    lineas.push("\nAmenazas: Evaluar según contexto comercial y competencia.");
    return lineas.join("");
  }

  useEffect(() => {
    if (!todosLosCamposCargados || formAnalisisFinal.trim() || loadingAudit) return;
    setFormAnalisisFinal(generarAnalisisFinal());
    // Solo re-ejecutar cuando cambie si todos los campos están cargados o si termina de cargar la auditoría
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formAnalisisFinal se lee dentro; no debe ser dependencia para evitar array de tamaño variable
  }, [todosLosCamposCargados, loadingAudit]);

  const handleCancelarConConfirmar = useCallback(() => {
    if (window.confirm("¿Está seguro que desea cancelar? Se perderán los cambios no guardados.")) {
      router.push("/auditorias");
    }
  }, [router]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (window.confirm("¿Está seguro que desea cancelar? Se perderán los cambios no guardados.")) {
          router.push("/auditorias");
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  function buildPayload() {
    const payload: Record<string, unknown> = {
      id_cliente: formCliente,
      id_vendedor: formVendedor,
      fecha: formFecha,
      id_visita: formVisita || undefined,
      id_transportista: formTransportista || undefined,
      observaciones_generales: formObservaciones.trim() || null,
      hora_inicio: formHoraInicio ? formHoraInicio + (formHoraInicio.length === 5 ? ":00" : "") : null,
      hora_fin: formHoraFin ? formHoraFin + (formHoraFin.length === 5 ? ":00" : "") : null,
      analisis_final: formAnalisisFinal.trim() || null,
      puntaje_final: puntajeFinal || null,
    };
    for (const key of TODAS_LAS_CLAVES_EVALUACION) {
      const v = formValues[key];
      if (typeof v === "number" && v >= 1 && v <= 5) payload[key] = v;
    }
    return payload;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!formCliente || !formVendedor || !formFecha) {
      setError("Cliente, vendedor y fecha son obligatorios.");
      return;
    }
    if (!todosLosCamposCargados) {
      setError("Debe completar todos los campos de evaluación (1 a 5 en cada ítem) para poder guardar la auditoría.");
      return;
    }
    if (!idAuditoria && !window.confirm("¿Está de acuerdo en cerrar la auditoría? Se registrarán todos los datos y la visita pasará a estado Realizada.")) {
      return;
    }
    setLoading(true);
    try {
      if (idAuditoria) {
        const res = await fetch(`/api/auditorias/${idAuditoria}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { error?: string }).error || `Error ${res.status}`);
      } else {
        const res = await fetch("/api/auditorias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { error?: string }).error || `Error ${res.status}`);
        if (formVisita) {
          await fetch(`/api/visitas/${formVisita}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "realizada" }),
          });
        }
      }
      router.push("/auditorias");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar auditoría");
    } finally {
      setLoading(false);
    }
  }

  if (loadingAudit) {
    return (
      <div className="mt-6 p-8 text-center text-slate-400">
        Cargando auditoría...
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Header con íconos */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div />
        <div className="flex flex-wrap items-center gap-2">
          {formVisita && (
            <Link
              href={`/visitas?ver=${formVisita}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg text-sm"
              title="Ver detalle de visita"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver detalle visita
            </Link>
          )}
          <Link
            href="/auditorias/descripcion"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg text-sm"
            title="Ver descripción de evaluación"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descripción de evaluación
          </Link>
          <button
            type="button"
            onClick={() => {
              const fechaStr = new Date().toISOString().slice(0, 10);
              const titulo = `Auditoría - ${clientes.find((c) => c.id === formCliente)?.nombre ?? "—"} - ${fechaStr}`;
              window.print();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg text-sm"
            title="Descargar / imprimir auditoría (PDF)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-3 rounded-lg bg-red-900/50 border border-red-800 text-red-300 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Datos de la Auditoría */}
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-200">Datos de la Auditoría</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {datosSoloLectura ? (
              <>
                <div><span className="text-xs text-slate-500 block mb-0.5">Fecha</span><span className="text-slate-200 font-medium py-2 block">{formFecha ? new Date(formFecha + "T12:00:00").toLocaleDateString("es-AR") : "—"}</span></div>
                <div><span className="text-xs text-slate-500 block mb-0.5">Hora inicio</span><span className="text-slate-200 font-medium py-2 block">{formHoraInicio || "—"}</span></div>
                <div><span className="text-xs text-slate-500 block mb-0.5">Hora fin</span><span className="text-slate-200 font-medium py-2 block">{formHoraFin || "—"}</span></div>
                <div><span className="text-xs text-slate-500 block mb-0.5">Cliente</span><span className="text-slate-200 font-medium py-2 block">{clientes.find((c) => c.id === formCliente)?.nombre ?? "—"}</span></div>
                <div><span className="text-xs text-slate-500 block mb-0.5">Vendedor</span><span className="text-slate-200 font-medium py-2 block">{vendedores.find((v) => v.id === formVendedor)?.nombre ?? "—"}</span></div>
                <div><span className="text-xs text-slate-500 block mb-0.5">Transportista</span><span className="text-slate-200 font-medium py-2 block">{formTransportista ? transportistas.find((t) => t.id === formTransportista)?.nombre ?? "—" : "Ninguno"}</span></div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Cliente *</label>
                  <select value={formCliente} onChange={(e) => { const v = e.target.value; setFormCliente(v); const c = clientes.find((x) => x.id === v); setFormTransportista(c?.id_transportista_frecuente ?? ""); }} required className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">Seleccionar</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Vendedor *</label>
                  <select value={formVendedor} onChange={(e) => setFormVendedor(e.target.value)} required className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">Seleccionar</option>
                    {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Transportista</label>
                  <select value={formTransportista} onChange={(e) => setFormTransportista(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">Ninguno</option>
                    {transportistas.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Fecha *</label>
                  <input type="date" value={formFecha} onChange={(e) => setFormFecha(e.target.value)} required className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Hora inicio</label>
                  <input type="time" value={formHoraInicio} onChange={(e) => setFormHoraInicio(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Hora fin</label>
                  <input type="time" value={formHoraFin} onChange={(e) => setFormHoraFin(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Visita programada</label>
                  <select value={formVisita} onChange={(e) => { const v = e.target.value; setFormVisita(v); const vis = visitas.find((x) => x.id === v); if (vis?.fecha_visita) setFormFecha(vis.fecha_visita.slice(0, 10)); if (vis?.id_cliente) { setFormCliente(vis.id_cliente); const c = clientes.find((x) => x.id === vis.id_cliente); setFormTransportista(c?.id_transportista_frecuente ?? ""); } if (vis?.id_vendedor) setFormVendedor(vis.id_vendedor); setFormHoraInicio(toTimeInput((vis as { hora_inicio?: string })?.hora_inicio) || ""); setFormHoraFin(toTimeInput((vis as { hora_fin?: string })?.hora_fin) || ""); }} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">Ninguna</option>
                    {visitas.map((v) => <option key={v.id} value={v.id}>{new Date(v.fecha_visita + "T12:00:00").toLocaleDateString("es-AR")} — {clientes.find((c) => c.id === v.id_cliente)?.nombre ?? "—"}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Observaciones generales</label>
            {datosSoloLectura ? <div className="py-2 text-slate-200 whitespace-pre-wrap">{formObservaciones || "—"}</div> : <textarea value={formObservaciones} onChange={(e) => setFormObservaciones(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Observaciones..." />}
          </div>
        </div>

        {/* Resumen de puntajes por sección + Puntaje final */}
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            {SECCIONES_EVALUACION.map((s, i) => (
              <div key={s.id} className="p-3 rounded-lg bg-primary-900/30 border border-primary-700/50 text-center">
                <span className="text-xs text-slate-400 block truncate">{s.titulo}</span>
                <span className="text-xl font-bold text-slate-200">{totalesPorSeccion[i] ?? 0}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-700">
            <div>
              <span className="text-sm text-slate-500 block">Puntaje final</span>
              <span className="text-2xl font-bold text-slate-200">{puntajeFinal} <span className="text-base font-normal text-slate-400">/ {maxPuntos} puntos</span></span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} className={`w-8 h-8 ${i <= estrellas ? "text-yellow-400" : "text-slate-600"}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              ))}
            </div>
          </div>
        </div>

        {/* Análisis final */}
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-3">Análisis final</h2>
          {datosSoloLectura ? (
            <div className="py-2 text-slate-200 whitespace-pre-wrap">{formAnalisisFinal || "—"}</div>
          ) : (
            <textarea value={formAnalisisFinal} onChange={(e) => setFormAnalisisFinal(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ej.: Fortalezas, oportunidades, debilidades, amenazas (FODA)..." />
          )}
        </div>

        {/* Secciones de evaluación */}
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-6 space-y-8">
          {SECCIONES_EVALUACION.map((seccion) => (
            <div key={seccion.id}>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">{seccion.titulo}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-2 pr-4 font-medium text-slate-400">Criterio</th>
                      <th className="text-center py-2 px-1 font-medium text-slate-400 min-w-[6rem]">5</th>
                      <th className="text-center py-2 px-1 font-medium text-slate-400 min-w-[6rem]">4</th>
                      <th className="text-center py-2 px-1 font-medium text-slate-400 min-w-[6rem]">3</th>
                      <th className="text-center py-2 px-1 font-medium text-slate-400 min-w-[6rem]">2</th>
                      <th className="text-center py-2 px-1 font-medium text-slate-400 min-w-[6rem]">1</th>
                      <th className="text-center py-2 pl-2 font-medium text-slate-400 w-14">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seccion.criterios.map((c) => {
                      const val = getCampo(c.key);
                      return (
                        <tr key={c.key} className="border-b border-slate-700/70">
                          <td className="py-2 pr-4 text-slate-300 align-top">{c.label}</td>
                          {c.opciones.map((o) => (
                            <td key={o.value} className="py-2 px-1 text-center align-top">
                              <label className="flex flex-col items-center gap-1 cursor-pointer">
                                <input type="radio" name={c.key} value={o.value} checked={val === o.value} onChange={() => setCampo(c.key, o.value)} className="w-4 h-4 text-primary-500 border-slate-600 bg-slate-800 focus:ring-primary-500 shrink-0" />
                                <span className="text-xs text-slate-400 leading-tight max-w-[7rem]">{o.label}</span>
                              </label>
                            </td>
                          ))}
                          <td className="py-2 pl-2 text-center font-medium text-slate-200 w-14 align-top">{typeof val === "number" ? val : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-600">
                      <td className="py-2 pr-4 font-medium text-slate-300">Total</td>
                      <td colSpan={5} />
                      <td className="py-2 pl-2 text-center font-bold text-slate-200">
                        {seccion.criterios.reduce((s, c) => { const v = formValues[c.key]; return s + (typeof v === "number" ? v : 0); }, 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={loading || !puedeGuardar} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50">
            {loading ? "Guardando..." : idAuditoria ? "Actualizar auditoría" : "Guardar auditoría"}
          </button>
          <button type="button" onClick={handleCancelarConConfirmar} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
