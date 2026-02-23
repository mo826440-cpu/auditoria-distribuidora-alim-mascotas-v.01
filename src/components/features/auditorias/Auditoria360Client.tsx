"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DESCRIPCIONES_360 } from "@/data/descripciones360";

type Cliente = { id: string; nombre: string; id_transportista_frecuente?: string | null; tipo_comercio_nombre?: string | null };
type Vendedor = { id: string; nombre: string };
type Visita = { id: string; fecha_visita: string; id_cliente?: string; id_vendedor?: string };
type Transportista = { id: string; nombre: string };

const OPCIONES_PUNTAJE = [
  { value: 1, label: "Malo" },
  { value: 2, label: "Regular" },
  { value: 3, label: "Bueno" },
  { value: 4, label: "Muy Bueno" },
];

function resultadoPuntaje(p: number): string {
  if (p >= 3.5) return "Excelente";
  if (p >= 2.5) return "Bueno";
  if (p >= 1.5) return "Regular";
  return "Malo";
}

const CAMPOS_360 = {
  cliente_eval_vendedor: [
    { key: "cliente_eval_vendedor_pasa_regularmente", label: "Pasa regularmente" },
    { key: "cliente_eval_vendedor_responde", label: "Responde consultas" },
    { key: "cliente_eval_vendedor_cumple", label: "Cumple acuerdos" },
    { key: "cliente_eval_vendedor_promos", label: "Informa promociones" },
    { key: "cliente_eval_vendedor_entendimiento", label: "Entendimiento del producto" },
    { key: "cliente_eval_vendedor_actitud", label: "Actitud profesional" },
    { key: "cliente_eval_vendedor_facilidad", label: "Facilidad para contactar" },
  ],
  cliente_eval_transporte: [
    { key: "cliente_eval_transporte_horario", label: "Cumple horario" },
    { key: "cliente_eval_transporte_avisa", label: "Avisa antes de llegar" },
    { key: "cliente_eval_transporte_trato", label: "Trato educado" },
    { key: "cliente_eval_transporte_completo", label: "Pedido completo" },
    { key: "cliente_eval_transporte_estado", label: "Estado del producto" },
    { key: "cliente_eval_transporte_descarga", label: "Descarga ordenada" },
    { key: "cliente_eval_transporte_actitud", label: "Actitud del chofer" },
  ],
  vendedor_eval_cliente: [
    { key: "vendedor_eval_cliente_atencion", label: "Atención al vendedor" },
    { key: "vendedor_eval_cliente_predisposicion", label: "Predisposición" },
    { key: "vendedor_eval_cliente_pedidos", label: "Pedidos claros" },
    { key: "vendedor_eval_cliente_condiciones", label: "Condiciones del local" },
    { key: "vendedor_eval_cliente_sugerencias", label: "Receptivo a sugerencias" },
    { key: "vendedor_eval_cliente_exhibicion", label: "Exhibición de productos" },
    { key: "vendedor_eval_cliente_orden", label: "Orden y limpieza" },
  ],
  transporte_eval_cliente: [
    { key: "transporte_eval_cliente_atencion", label: "Atención al recibir" },
    { key: "transporte_eval_cliente_descarga", label: "Facilidad para descargar" },
    { key: "transporte_eval_cliente_firma", label: "Firma documentación" },
    { key: "transporte_eval_cliente_horarios", label: "Horarios de recepción" },
    { key: "transporte_eval_cliente_espacio", label: "Espacio para descarga" },
    { key: "transporte_eval_cliente_demoras", label: "Sin demoras injustificadas" },
    { key: "transporte_eval_cliente_predisposicion", label: "Predisposición" },
  ],
  vendedor_eval_transporte: [
    { key: "vendedor_eval_transporte_comunicacion", label: "Comunicación" },
    { key: "vendedor_eval_transporte_cumplimiento", label: "Cumplimiento de horarios" },
    { key: "vendedor_eval_transporte_avisos", label: "Avisos de llegada" },
    { key: "vendedor_eval_transporte_coordinacion", label: "Coordinación" },
    { key: "vendedor_eval_transporte_errores", label: "Sin errores en pedido" },
  ],
  transporte_eval_vendedor: [
    { key: "transporte_eval_vendedor_claridad", label: "Claridad en pedidos" },
    { key: "transporte_eval_vendedor_correctos", label: "Datos correctos" },
    { key: "transporte_eval_vendedor_cambios", label: "Manejo de cambios" },
    { key: "transporte_eval_vendedor_coordinacion", label: "Coordinación" },
    { key: "transporte_eval_vendedor_confusion", label: "Sin confusiones" },
  ],
};

const TODOS_LOS_CAMPOS_360 = (Object.values(CAMPOS_360) as { key: string }[][]).flat().map((c) => c.key);

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
  const [formObservaciones, setFormObservaciones] = useState("");
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
      setFormFecha(v?.fecha_visita ? v.fecha_visita.slice(0, 10) : new Date().toISOString().slice(0, 10));
    } else {
      setFormFecha(new Date().toISOString().slice(0, 10));
    }
  }, [desdeVisita, clientes, visitas]);

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
          const vals: Record<string, number | ""> = {};
          for (const grupo of Object.values(CAMPOS_360)) {
            for (const c of grupo as { key: string }[]) {
              const v = data[c.key];
              vals[c.key] = typeof v === "number" && v >= 1 && v <= 4 ? v : "";
            }
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

  function promedio(nums: (number | "")[]): number {
    const valid = nums.filter((n): n is number => typeof n === "number" && n >= 1 && n <= 4);
    if (valid.length === 0) return 0;
    return valid.reduce((a, b) => a + b, 0) / valid.length;
  }

  const clienteEvalVendedor = CAMPOS_360.cliente_eval_vendedor.map((c) => getCampo(c.key));
  const clienteEvalTransporte = CAMPOS_360.cliente_eval_transporte.map((c) => getCampo(c.key));
  const vendedorEvalCliente = CAMPOS_360.vendedor_eval_cliente.map((c) => getCampo(c.key));
  const transporteEvalCliente = CAMPOS_360.transporte_eval_cliente.map((c) => getCampo(c.key));
  const vendedorEvalTransporte = CAMPOS_360.vendedor_eval_transporte.map((c) => getCampo(c.key));
  const transporteEvalVendedor = CAMPOS_360.transporte_eval_vendedor.map((c) => getCampo(c.key));

  const puntajeCliente = promedio([...vendedorEvalCliente, ...transporteEvalCliente]);
  const puntajeVendedor = promedio([...clienteEvalVendedor, ...transporteEvalVendedor]);
  const puntajeTransporte = promedio([...clienteEvalTransporte, ...vendedorEvalTransporte]);
  const puntajeGeneral =
    puntajeCliente + puntajeVendedor + puntajeTransporte > 0
      ? (puntajeCliente + puntajeVendedor + puntajeTransporte) / 3
      : 0;

  const todosLosCamposCargados = TODOS_LOS_CAMPOS_360.every(
    (key) => typeof formValues[key] === "number" && formValues[key] >= 1 && formValues[key] <= 4
  );
  const puedeGuardar = !!formCliente && !!formVendedor && !!formFecha && todosLosCamposCargados;

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
      puntuacion_cliente_360: puntajeCliente > 0 ? Math.round(puntajeCliente * 10) / 10 : null,
      puntuacion_vendedor_360: puntajeVendedor > 0 ? Math.round(puntajeVendedor * 10) / 10 : null,
      puntuacion_repartidor_360: puntajeTransporte > 0 ? Math.round(puntajeTransporte * 10) / 10 : null,
      puntuacion_general_360: puntajeGeneral > 0 ? Math.round(puntajeGeneral * 10) / 10 : null,
      resultado_360: puntajeGeneral > 0 ? resultadoPuntaje(puntajeGeneral) : null,
    };
    for (const key of Object.keys(formValues)) {
      const v = formValues[key];
      if (typeof v === "number" && v >= 1 && v <= 4) payload[key] = v;
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
      setError("Debe completar todos los campos de evaluación (1 a 4 en cada ítem) para poder guardar la auditoría.");
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

  function SelectPuntaje({ campo }: { campo: string }) {
    const val = getCampo(campo);
    return (
      <select
        value={val === "" ? "" : val}
        onChange={(e) => setCampo(campo, e.target.value === "" ? "" : parseInt(e.target.value, 10))}
        className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
      >
        <option value="">—</option>
        {OPCIONES_PUNTAJE.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  function CampoConAyuda({ campo, label }: { campo: string; label: string }) {
    const desc = DESCRIPCIONES_360[campo];
    return (
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
          <SelectPuntaje campo={campo} />
        </div>
        {desc && (
          <span
            className="mt-5 shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-600 text-slate-300 cursor-help"
            title={desc}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        )}
      </div>
    );
  }

  function SeccionEvaluacion({
    titulo,
    campos,
  }: {
    titulo: string;
    campos: { key: string; label: string }[];
  }) {
    return (
      <div className="space-y-4" id={titulo.replace(/\s/g, "-")}>
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">{titulo}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {campos.map((c) => (
            <div key={c.key}>
              <CampoConAyuda campo={c.key} label={c.label} />
            </div>
          ))}
        </div>
      </div>
    );
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
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-3 rounded-lg bg-red-900/50 border border-red-800 text-red-300 text-sm font-medium">
            {error}
          </div>
        )}

        {/* SECCIÓN 1 - Datos de la Auditoría (solo lectura) */}
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-200">Datos de la Auditoría</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {datosSoloLectura ? (
              <>
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">Cliente</span>
                  <span className="text-slate-200 font-medium block py-2">
                    {clientes.find((c) => c.id === formCliente)?.nombre ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">Vendedor</span>
                  <span className="text-slate-200 font-medium block py-2">
                    {vendedores.find((v) => v.id === formVendedor)?.nombre ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">Transportista</span>
                  <span className="text-slate-200 font-medium block py-2">
                    {formTransportista ? transportistas.find((t) => t.id === formTransportista)?.nombre ?? "—" : "Ninguno"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">Fecha</span>
                  <span className="text-slate-200 font-medium block py-2">
                    {formFecha ? new Date(formFecha + "T12:00:00").toLocaleDateString("es-AR") : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">Visita programada</span>
                  <span className="text-slate-200 font-medium block py-2">
                    {formVisita
                      ? `${new Date((visitas.find((v) => v.id === formVisita)?.fecha_visita ?? "") + "T12:00:00").toLocaleDateString("es-AR")} — ${clientes.find((c) => c.id === visitas.find((v) => v.id === formVisita)?.id_cliente)?.nombre ?? "—"}`
                      : "Ninguna"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Cliente *</label>
                  <select
                    value={formCliente}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormCliente(val);
                      const cli = clientes.find((c) => c.id === val);
                      setFormTransportista(cli?.id_transportista_frecuente ?? "");
                    }}
                    required
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Seleccionar</option>
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
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Seleccionar</option>
                    {vendedores.map((v) => (
                      <option key={v.id} value={v.id}>{v.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Transportista</label>
                  <select
                    value={formTransportista}
                    onChange={(e) => setFormTransportista(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Ninguno</option>
                    {transportistas.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
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
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Visita programada</label>
                  <select
                    value={formVisita}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormVisita(val);
                      const v = visitas.find((x) => x.id === val);
                      if (v?.fecha_visita) setFormFecha(v.fecha_visita.slice(0, 10));
                      if (v?.id_cliente) {
                        setFormCliente(v.id_cliente);
                        const cli = clientes.find((c) => c.id === v.id_cliente);
                        setFormTransportista(cli?.id_transportista_frecuente ?? "");
                      }
                      if (v?.id_vendedor) setFormVendedor(v.id_vendedor);
                    }}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Ninguna</option>
                    {visitas.map((v) => (
                      <option key={v.id} value={v.id}>
                        {new Date(v.fecha_visita + "T12:00:00").toLocaleDateString("es-AR")} — {clientes.find((c) => c.id === v.id_cliente)?.nombre ?? "—"}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
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
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Observaciones generales</label>
            {datosSoloLectura ? (
              <div className="py-2 text-slate-200 whitespace-pre-wrap">{formObservaciones || "—"}</div>
            ) : (
              <textarea
                value={formObservaciones}
                onChange={(e) => setFormObservaciones(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Observaciones..."
              />
            )}
          </div>
        </div>

        {/* SECCIONES 2-7 - Evaluación 360° */}
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-6 space-y-8">
          <SeccionEvaluacion titulo="Cliente evalúa Vendedor" campos={CAMPOS_360.cliente_eval_vendedor} />
          <SeccionEvaluacion titulo="Cliente evalúa Transporte" campos={CAMPOS_360.cliente_eval_transporte} />
          <SeccionEvaluacion titulo="Vendedor evalúa Cliente" campos={CAMPOS_360.vendedor_eval_cliente} />
          <SeccionEvaluacion titulo="Transporte evalúa Cliente" campos={CAMPOS_360.transporte_eval_cliente} />
          <SeccionEvaluacion titulo="Vendedor evalúa Transporte" campos={CAMPOS_360.vendedor_eval_transporte} />
          <SeccionEvaluacion titulo="Transporte evalúa Vendedor" campos={CAMPOS_360.transporte_eval_vendedor} />
        </div>

        {/* Puntajes calculados */}
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Puntajes calculados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-slate-800 border border-slate-600">
              <span className="text-xs text-slate-500 block">Puntaje Cliente</span>
              <span className="text-lg font-semibold text-slate-200">
                {puntajeCliente > 0 ? puntajeCliente.toFixed(1) : "—"}
              </span>
              {puntajeCliente > 0 && (
                <span className="text-sm text-slate-400 ml-1">({resultadoPuntaje(puntajeCliente)})</span>
              )}
            </div>
            <div className="p-3 rounded-lg bg-slate-800 border border-slate-600">
              <span className="text-xs text-slate-500 block">Puntaje Vendedor</span>
              <span className="text-lg font-semibold text-slate-200">
                {puntajeVendedor > 0 ? puntajeVendedor.toFixed(1) : "—"}
              </span>
              {puntajeVendedor > 0 && (
                <span className="text-sm text-slate-400 ml-1">({resultadoPuntaje(puntajeVendedor)})</span>
              )}
            </div>
            <div className="p-3 rounded-lg bg-slate-800 border border-slate-600">
              <span className="text-xs text-slate-500 block">Puntaje Transporte</span>
              <span className="text-lg font-semibold text-slate-200">
                {puntajeTransporte > 0 ? puntajeTransporte.toFixed(1) : "—"}
              </span>
              {puntajeTransporte > 0 && (
                <span className="text-sm text-slate-400 ml-1">({resultadoPuntaje(puntajeTransporte)})</span>
              )}
            </div>
            <div className="p-3 rounded-lg bg-slate-800 border border-slate-600">
              <span className="text-xs text-slate-500 block">Puntaje General</span>
              <span className="text-lg font-semibold text-slate-200">
                {puntajeGeneral > 0 ? puntajeGeneral.toFixed(1) : "—"}
              </span>
              {puntajeGeneral > 0 && (
                <span className="text-sm text-slate-400 ml-1">({resultadoPuntaje(puntajeGeneral)})</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading || !puedeGuardar}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Guardando..." : idAuditoria ? "Actualizar auditoría" : "Guardar auditoría"}
          </button>
          <button
            type="button"
            onClick={handleCancelarConConfirmar}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
