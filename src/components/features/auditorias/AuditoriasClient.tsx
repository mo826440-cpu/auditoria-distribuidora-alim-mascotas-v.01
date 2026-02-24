"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { estrellasDesdePuntaje } from "@/data/evaluacionCriterios";

type Cliente = { id: string; nombre: string; id_transportista_frecuente?: string | null; tipo_comercio_nombre?: string | null };
type Vendedor = { id: string; nombre: string };
type Visita = { id: string; fecha_visita: string; id_cliente?: string; id_vendedor?: string };
type Transportista = { id: string; nombre: string };

type Auditoria = {
  id: string;
  fecha: string;
  id_cliente: string;
  id_vendedor: string;
  id_visita: string | null;
  id_transportista: string | null;
  local_limpio_ordenado?: boolean | null;
  productos_bien_exhibidos?: number | null;
  stock_suficiente?: boolean | null;
  rotacion_productos?: number | null;
  cumple_plazos_pago?: boolean | null;
  metodos_pago_frecuentes?: string[] | null;
  frecuencia_envios?: string | null;
  promedio_kg_mes?: string | null;
  monto_compra_mes?: string | null;
  puntuacion_cliente: number | null;
  puntuacion_vendedor: number | null;
  puntuacion_repartidor: number | null;
  puntuacion_cliente_360?: number | null;
  puntuacion_vendedor_360?: number | null;
  puntuacion_general_360?: number | null;
  resultado_360?: string | null;
  puntaje_final?: number | null;
  clasificacion_cliente: string | null;
  condiciones_generales?: Record<string, unknown> | null;
  exhibicion_productos?: Record<string, unknown> | null;
  stock_rotacion?: Record<string, unknown> | null;
  precios_comercializacion?: Record<string, unknown> | null;
  relacion_distribuidora?: Record<string, unknown> | null;
  gestion_comercial?: Record<string, unknown> | null;
  conocimiento_producto?: Record<string, unknown> | null;
  relacion_cliente?: Record<string, unknown> | null;
  cumplimiento_administrativo?: Record<string, unknown> | null;
  logistica_servicio?: Record<string, unknown> | null;
  clientes: { nombre: string } | null;
  vendedores: { nombre: string } | null;
};

const CLASIFICACIONES = [
  { value: "estrategico", label: "Estratégico" },
  { value: "potencial", label: "Potencial" },
  { value: "regular", label: "Regular" },
  { value: "critico", label: "Crítico" },
];

const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "cheque_10", label: "Cheque 10 días" },
  { value: "cheque_30", label: "Cheque 30 días" },
  { value: "cheque_90", label: "Cheque 90 días" },
  { value: "otro", label: "Otro" },
];

const FRECUENCIA_ENVIOS = [
  { value: "menos_1_mes", label: "Menos de 1 mes" },
  { value: "1_a_3_mes", label: "1 a 3 meses" },
  { value: "3_a_4_mes", label: "3 a 4 meses" },
  { value: "4_a_5_mes", label: "4 a 5 meses" },
  { value: "mas_5_mes", label: "Más de 5 meses" },
];

const PROMEDIO_KG_MES = [
  { value: "menos_1000", label: "Menos de 1000 kg" },
  { value: "1000_2000", label: "1000-2000 kg" },
  { value: "2000_3000", label: "2000-3000 kg" },
  { value: "3000_4000", label: "3000-4000 kg" },
  { value: "4000_5000", label: "4000-5000 kg" },
  { value: "5000_6000", label: "5000-6000 kg" },
  { value: "6000_7000", label: "6000-7000 kg" },
  { value: "7000_8000", label: "7000-8000 kg" },
  { value: "mas_8000", label: "Más de 8000 kg" },
];

const MONTO_COMPRA_MES = [
  { value: "menos_1M", label: "Menos de 1M" },
  { value: "1M_2M", label: "1M - 2M" },
  { value: "2M_3M", label: "2M - 3M" },
  { value: "3M_4M", label: "3M - 4M" },
  { value: "4M_5M", label: "4M - 5M" },
  { value: "mas_5M", label: "Más de 5M" },
];

export function AuditoriasClient({
  auditorias,
  clientes,
  vendedores,
  visitas,
  transportistas,
  rol,
  abrirNuevaDesdeVisita,
}: {
  auditorias: Auditoria[];
  clientes: Cliente[];
  vendedores: Vendedor[];
  visitas: Visita[];
  transportistas: Transportista[];
  rol: string;
  abrirNuevaDesdeVisita?: { id_cliente: string; id_vendedor: string; id_visita: string };
}) {
  const router = useRouter();
  const canEdit = ["administrador", "auditor"].includes(rol);
  const canDelete = rol === "administrador";

  const [modal, setModal] = useState<"nuevo" | "editar" | "ver" | null>(null);
  const [auditoriaEdit, setAuditoriaEdit] = useState<Auditoria | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formCliente, setFormCliente] = useState("");
  const [formVendedor, setFormVendedor] = useState("");
  const [formVisita, setFormVisita] = useState("");
  const [formTransportista, setFormTransportista] = useState("");
  const [formFecha, setFormFecha] = useState("");
  const [formLocalLimpio, setFormLocalLimpio] = useState<boolean | null>(null);
  const [formProductosExhibidos, setFormProductosExhibidos] = useState("");
  const [formStockSuficiente, setFormStockSuficiente] = useState<boolean | null>(null);
  const [formRotacion, setFormRotacion] = useState("");
  const [formPlazosPago, setFormPlazosPago] = useState<boolean | null>(null);
  const [formMetodosPago, setFormMetodosPago] = useState<string[]>([]);
  const [formPuntuacionCliente, setFormPuntuacionCliente] = useState("");
  const [formPuntuacionVendedor, setFormPuntuacionVendedor] = useState("");
  const [formPuntuacionRepartidor, setFormPuntuacionRepartidor] = useState("");
  const [formClasificacion, setFormClasificacion] = useState("");
  const [formObservaciones, setFormObservaciones] = useState("");
  const [formFrecuenciaEnvios, setFormFrecuenciaEnvios] = useState("");
  const [formPromedioKg, setFormPromedioKg] = useState("");
  const [formMontoCompra, setFormMontoCompra] = useState("");
  const [formCondicionesLocal, setFormCondicionesLocal] = useState("");
  const [formCondicionesIluminacion, setFormCondicionesIluminacion] = useState("");
  const [formCondicionesSector, setFormCondicionesSector] = useState("");
  const [formCondicionesHigiene, setFormCondicionesHigiene] = useState("");
  const [formExhibicionVisible, setFormExhibicionVisible] = useState("");
  const [formExhibicionUbicacion, setFormExhibicionUbicacion] = useState("");
  const [formExhibicionCarteleria, setFormExhibicionCarteleria] = useState("");
  const [formExhibicionComparacion, setFormExhibicionComparacion] = useState("");
  const [formExhibicionObs, setFormExhibicionObs] = useState("");
  const [formStockObs, setFormStockObs] = useState("");
  const [formPreciosObs, setFormPreciosObs] = useState("");
  const [formRelacionObs, setFormRelacionObs] = useState("");
  const [formGestionObs, setFormGestionObs] = useState("");
  const [formConocimientoObs, setFormConocimientoObs] = useState("");
  const [formRelacionClienteObs, setFormRelacionClienteObs] = useState("");
  const [formCumplimientoObs, setFormCumplimientoObs] = useState("");
  const [formLogisticaObs, setFormLogisticaObs] = useState("");

  useEffect(() => {
    if (formVisita) {
      const v = visitas.find((x) => x.id === formVisita);
      if (v?.fecha_visita) setFormFecha(v.fecha_visita);
    }
  }, [formVisita, visitas]);

  function abrirNuevo() {
    setFormCliente("");
    setFormVendedor("");
    setFormVisita("");
    setFormTransportista("");
    setFormFecha(new Date().toISOString().slice(0, 10));
    setFormLocalLimpio(null);
    setFormProductosExhibidos("");
    setFormStockSuficiente(null);
    setFormRotacion("");
    setFormPlazosPago(null);
    setFormMetodosPago([]);
    setFormPuntuacionCliente("");
    setFormPuntuacionVendedor("");
    setFormPuntuacionRepartidor("");
    setFormClasificacion("");
    setFormObservaciones("");
    setFormFrecuenciaEnvios("");
    setFormPromedioKg("");
    setFormMontoCompra("");
    setFormCondicionesLocal("");
    setFormCondicionesIluminacion("");
    setFormCondicionesSector("");
    setFormCondicionesHigiene("");
    setFormExhibicionVisible("");
    setFormExhibicionUbicacion("");
    setFormExhibicionCarteleria("");
    setFormExhibicionComparacion("");
    setFormExhibicionObs("");
    setFormStockObs("");
    setFormPreciosObs("");
    setFormRelacionObs("");
    setFormGestionObs("");
    setFormConocimientoObs("");
    setFormRelacionClienteObs("");
    setFormCumplimientoObs("");
    setFormLogisticaObs("");
    setError(null);
    setAuditoriaEdit(null);
    setModal("nuevo");
  }

  function limpiarFormulario() {
    setFormCliente("");
    setFormVendedor("");
    setFormVisita("");
    setFormTransportista("");
    setFormFecha(new Date().toISOString().slice(0, 10));
    setFormLocalLimpio(null);
    setFormProductosExhibidos("");
    setFormStockSuficiente(null);
    setFormRotacion("");
    setFormPlazosPago(null);
    setFormMetodosPago([]);
    setFormPuntuacionCliente("");
    setFormPuntuacionVendedor("");
    setFormPuntuacionRepartidor("");
    setFormClasificacion("");
    setFormObservaciones("");
    setFormFrecuenciaEnvios("");
    setFormPromedioKg("");
    setFormMontoCompra("");
    setFormCondicionesLocal("");
    setFormCondicionesIluminacion("");
    setFormCondicionesSector("");
    setFormCondicionesHigiene("");
    setFormExhibicionVisible("");
    setFormExhibicionUbicacion("");
    setFormExhibicionCarteleria("");
    setFormExhibicionComparacion("");
    setFormExhibicionObs("");
    setFormStockObs("");
    setFormPreciosObs("");
    setFormRelacionObs("");
    setFormGestionObs("");
    setFormConocimientoObs("");
    setFormRelacionClienteObs("");
    setFormCumplimientoObs("");
    setFormLogisticaObs("");
    setError(null);
  }

  const handleCancelarConConfirmar = useCallback(() => {
    if (window.confirm("¿Está seguro que desea cancelar? Se perderán los cambios no guardados.")) {
      limpiarFormulario();
      setModal(null);
      setAuditoriaEdit(null);
    }
  }, []);

  const handleClickFuera = useCallback(() => {
    setModal(null);
  }, []);

  useEffect(() => {
    if (!modal || (modal !== "nuevo" && modal !== "editar")) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (window.confirm("¿Está seguro que desea cancelar? Se perderán los cambios no guardados.")) {
          limpiarFormulario();
          setModal(null);
          setAuditoriaEdit(null);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal]);

  function abrirEditar(a: Auditoria) {
    setAuditoriaEdit(a);
    setFormCliente(a.id_cliente);
    setFormVendedor(a.id_vendedor);
    setFormVisita(a.id_visita || "");
    setFormTransportista(a.id_transportista || "");
    setFormFecha(a.fecha);
    setFormLocalLimpio(a.local_limpio_ordenado ?? null);
    setFormProductosExhibidos(a.productos_bien_exhibidos?.toString() ?? "");
    setFormStockSuficiente(a.stock_suficiente ?? null);
    setFormRotacion(a.rotacion_productos?.toString() ?? "");
    setFormPlazosPago(a.cumple_plazos_pago ?? null);
    setFormMetodosPago(a.metodos_pago_frecuentes ?? []);
    setFormPuntuacionCliente(a.puntuacion_cliente?.toString() ?? "");
    setFormPuntuacionVendedor(a.puntuacion_vendedor?.toString() ?? "");
    setFormPuntuacionRepartidor(a.puntuacion_repartidor?.toString() ?? "");
    setFormClasificacion(a.clasificacion_cliente ?? "");
    setFormObservaciones((a.condiciones_generales as { observaciones?: string })?.observaciones ?? "");
    setFormFrecuenciaEnvios(a.frecuencia_envios ?? "");
    setFormPromedioKg(a.promedio_kg_mes ?? "");
    setFormMontoCompra(a.monto_compra_mes ?? "");
    const cg = a.condiciones_generales as Record<string, unknown> | undefined;
    setFormCondicionesLocal(String(cg?.local_limpio ?? ""));
    setFormCondicionesIluminacion(String(cg?.buena_iluminacion ?? ""));
    setFormCondicionesSector(String(cg?.sector_mascotas_identificado ?? ""));
    setFormCondicionesHigiene(String(cg?.cumple_normas_higiene ?? ""));
    const ep = a.exhibicion_productos as Record<string, unknown> | undefined;
    setFormExhibicionVisible(String(ep?.productos_visibles ?? ""));
    setFormExhibicionUbicacion(String(ep?.ubicacion_estrategica ?? ""));
    setFormExhibicionCarteleria(String(ep?.carteleria ?? ""));
    setFormExhibicionComparacion(String(ep?.comparacion_competencia ?? ""));
    setFormExhibicionObs(String(ep?.observaciones ?? ""));
    setFormStockObs(String((a.stock_rotacion as Record<string, unknown>)?.observaciones ?? ""));
    setFormPreciosObs(String((a.precios_comercializacion as Record<string, unknown>)?.observaciones ?? ""));
    setFormRelacionObs(String((a.relacion_distribuidora as Record<string, unknown>)?.observaciones ?? ""));
    setFormGestionObs(String((a.gestion_comercial as Record<string, unknown>)?.observaciones ?? ""));
    setFormConocimientoObs(String((a.conocimiento_producto as Record<string, unknown>)?.observaciones ?? ""));
    setFormRelacionClienteObs(String((a.relacion_cliente as Record<string, unknown>)?.observaciones ?? ""));
    setFormCumplimientoObs(String((a.cumplimiento_administrativo as Record<string, unknown>)?.observaciones ?? ""));
    setFormLogisticaObs(String((a.logistica_servicio as Record<string, unknown>)?.observaciones ?? ""));
    setError(null);
    setModal("editar");
  }

  function toggleMetodoPago(value: string) {
    setFormMetodosPago((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    );
  }

  function buildPayload() {
    const payload: Record<string, unknown> = {
      id_cliente: formCliente,
      id_vendedor: formVendedor,
      fecha: formFecha,
      id_visita: formVisita || undefined,
      id_transportista: formTransportista || undefined,
      puntuacion_cliente: formPuntuacionCliente ? parseInt(formPuntuacionCliente, 10) : null,
      puntuacion_vendedor: formPuntuacionVendedor ? parseInt(formPuntuacionVendedor, 10) : null,
      puntuacion_repartidor: formPuntuacionRepartidor ? parseInt(formPuntuacionRepartidor, 10) : null,
      clasificacion_cliente: formClasificacion || null,
      local_limpio_ordenado: formLocalLimpio,
      productos_bien_exhibidos: formProductosExhibidos ? parseInt(formProductosExhibidos, 10) : null,
      stock_suficiente: formStockSuficiente,
      rotacion_productos: formRotacion ? parseInt(formRotacion, 10) : null,
      cumple_plazos_pago: formPlazosPago,
      metodos_pago_frecuentes: formMetodosPago.length ? formMetodosPago : null,
      frecuencia_envios: formFrecuenciaEnvios || null,
      promedio_kg_mes: formPromedioKg || null,
      monto_compra_mes: formMontoCompra || null,
    };

    const condiciones: Record<string, unknown> = {};
    if (formObservaciones.trim()) condiciones.observaciones = formObservaciones.trim();
    if (formCondicionesLocal) condiciones.local_limpio = parseInt(formCondicionesLocal, 10);
    if (formCondicionesIluminacion) condiciones.buena_iluminacion = parseInt(formCondicionesIluminacion, 10);
    if (formCondicionesSector) condiciones.sector_mascotas_identificado = parseInt(formCondicionesSector, 10);
    if (formCondicionesHigiene) condiciones.cumple_normas_higiene = parseInt(formCondicionesHigiene, 10);
    if (Object.keys(condiciones).length) payload.condiciones_generales = condiciones;

    const exhibicion: Record<string, unknown> = {};
    if (formExhibicionVisible) exhibicion.productos_visibles = parseInt(formExhibicionVisible, 10);
    if (formExhibicionUbicacion) exhibicion.ubicacion_estrategica = parseInt(formExhibicionUbicacion, 10);
    if (formExhibicionCarteleria) exhibicion.carteleria = parseInt(formExhibicionCarteleria, 10);
    if (formExhibicionComparacion) exhibicion.comparacion_competencia = formExhibicionComparacion;
    if (formExhibicionObs.trim()) exhibicion.observaciones = formExhibicionObs.trim();
    if (Object.keys(exhibicion).length) payload.exhibicion_productos = exhibicion;

    if (formStockObs.trim()) payload.stock_rotacion = { observaciones: formStockObs.trim() };
    if (formPreciosObs.trim()) payload.precios_comercializacion = { observaciones: formPreciosObs.trim() };
    if (formRelacionObs.trim()) payload.relacion_distribuidora = { observaciones: formRelacionObs.trim() };
    if (formGestionObs.trim()) payload.gestion_comercial = { observaciones: formGestionObs.trim() };
    if (formConocimientoObs.trim()) payload.conocimiento_producto = { observaciones: formConocimientoObs.trim() };
    if (formRelacionClienteObs.trim()) payload.relacion_cliente = { observaciones: formRelacionClienteObs.trim() };
    if (formCumplimientoObs.trim()) payload.cumplimiento_administrativo = { observaciones: formCumplimientoObs.trim() };
    if (formLogisticaObs.trim()) payload.logistica_servicio = { observaciones: formLogisticaObs.trim() };

    return payload;
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!clientes.length || !vendedores.length) {
      setError("Debés tener al menos un cliente y un vendedor para crear una auditoría.");
      return;
    }
    if (!window.confirm("¿Está de acuerdo en cerrar la auditoría? Se registrarán todos los datos y la visita pasará a estado Realizada.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auditorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Error del servidor (${res.status}). La respuesta no es válida.`);
      }
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status} al crear auditoría`);
      }
      if (formVisita) {
        const patchRes = await fetch(`/api/visitas/${formVisita}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "realizada" }),
        });
        if (!patchRes.ok) {
          const patchData = await patchRes.json().catch(() => ({}));
          console.warn("No se pudo actualizar visita a realizada:", patchData.error);
        }
      }
      setModal(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear auditoría");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditar(e: React.FormEvent) {
    e.preventDefault();
    if (!auditoriaEdit) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auditorias/${auditoriaEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Error del servidor (${res.status}). La respuesta no es válida.`);
      }
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status} al guardar`);
      }
      setModal(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminar(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/auditorias/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      setDeleteConfirm(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="bg-slate-850 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-600 border-b border-primary-700">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-white">Fecha</th>
                <th className="text-left py-3 px-4 font-semibold text-white">Cliente</th>
                <th className="text-left py-3 px-4 font-semibold text-white">Clasificación</th>
                {canEdit && (
                  <th className="text-right py-3 px-4 font-semibold text-white">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {auditorias.length === 0 ? (
                <tr>
                  <td
                    colSpan={canEdit ? 4 : 3}
                    className="py-8 px-4 text-center text-slate-400"
                  >
                    No hay auditorías registradas. Creá una desde una visita programada.
                  </td>
                </tr>
              ) : (
                auditorias.map((a) => {
                  const estrellas = a.puntaje_final != null ? estrellasDesdePuntaje(a.puntaje_final) : (a.puntuacion_general_360 != null ? Math.round(Math.min(5, Math.max(1, Number(a.puntuacion_general_360)))) : 0);
                  return (
                    <tr key={a.id} className="border-b border-slate-700 hover:bg-slate-700/50 bg-slate-800/50">
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(a.fecha + "T12:00:00").toLocaleDateString("es-AR")}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {(a.clientes as { nombre: string } | null)?.nombre ?? "—"}
                      </td>
                      <td className="py-3 px-4">
                        {estrellas > 0 ? (
                          <span className="flex items-center gap-0.5" title={a.puntaje_final != null ? `${a.puntaje_final} puntos` : undefined}>
                            {[1, 2, 3, 4, 5].map((i) => (
                              <svg key={i} className={`w-5 h-5 ${i <= estrellas ? "text-yellow-400" : "text-slate-600"}`} fill={i <= estrellas ? "currentColor" : "none"} stroke="currentColor" strokeWidth={i <= estrellas ? 0 : 1.5} viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/auditorias/nueva?id=${a.id}`}
                            className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-primary-900/40 rounded inline-block"
                            title="Ver detalle auditoría"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo / Editar */}
      {(modal === "nuevo" || modal === "editar") && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-6 px-4"
          onClick={handleClickFuera}
        >
          <div
            className="bg-slate-850 rounded-xl p-6 w-full max-w-2xl shadow-xl my-2 max-h-[calc(100vh-3rem)] overflow-y-auto border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-200">
              {modal === "nuevo" ? "Auditoría" : "Editar auditoría"}
            </h2>
            {!clientes.length && (
              <div className="mt-2 p-3 rounded bg-amber-900/50 text-amber-300 text-sm">
                No hay clientes. Creá al menos un cliente antes de registrar una auditoría.
              </div>
            )}
            {!vendedores.length && (
              <div className="mt-2 p-3 rounded bg-amber-900/50 text-amber-300 text-sm">
                No hay vendedores. Creá al menos un vendedor antes de registrar una auditoría.
              </div>
            )}
            {error && (
              <div className="mt-2 p-3 rounded-lg bg-red-900/50 border border-red-800 text-red-300 text-sm font-medium">
                {error}
              </div>
            )}
            <form
              onSubmit={modal === "nuevo" ? handleCrear : handleEditar}
              className="mt-4 space-y-6"
            >
              {/* Fecha y Visita (ocultos cuando hay visita; fecha visible cuando no) */}
              {!formVisita && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
                    <input
                      type="date"
                      value={formFecha}
                      onChange={(e) => setFormFecha(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Visita programada</label>
                    <select
                      value={formVisita}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormVisita(val);
                        const v = visitas.find((x) => x.id === val);
                        if (v?.fecha_visita) setFormFecha(v.fecha_visita);
                        if (v?.id_cliente) {
                          setFormCliente(v.id_cliente);
                          const cli = clientes.find((c) => c.id === v.id_cliente);
                          setFormTransportista(cli?.id_transportista_frecuente ?? "");
                        }
                        if (v?.id_vendedor) setFormVendedor(v.id_vendedor);
                      }}
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">Ninguna</option>
                      {visitas.map((v) => (
                        <option key={v.id} value={v.id}>
                          {new Date(v.fecha_visita + "T12:00:00").toLocaleDateString("es-AR")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {/* Datos generales */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Datos generales
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block mb-0.5">Cliente</span>
                    <span className="text-slate-200 font-medium">
                      {clientes.find((c) => c.id === formCliente)?.nombre ?? "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-0.5">Vendedor</span>
                    <span className="text-slate-200 font-medium">
                      {vendedores.find((v) => v.id === formVendedor)?.nombre ?? "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-0.5">Transportista</span>
                    <span className="text-slate-200 font-medium">
                      {formTransportista
                        ? transportistas.find((t) => t.id === formTransportista)?.nombre ?? "—"
                        : "Ninguno"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-0.5">Tipo de comercio</span>
                    <span className="text-slate-200 font-medium">
                      {clientes.find((c) => c.id === formCliente)?.tipo_comercio_nombre ?? "—"}
                    </span>
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
                </div>
                {!formCliente && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
                      <select
                        value={formCliente}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormCliente(val);
                          const cli = clientes.find((c) => c.id === val);
                          setFormTransportista(cli?.id_transportista_frecuente ?? "");
                        }}
                        required
                        className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        <option value="">Seleccionar</option>
                        {clientes.map((c) => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Vendedor *</label>
                      <select
                        value={formVendedor}
                        onChange={(e) => setFormVendedor(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        <option value="">Seleccionar</option>
                        {vendedores.map((v) => (
                          <option key={v.id} value={v.id}>{v.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Cliente */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Evaluación del cliente
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Local limpio y ordenado</label>
                    <select
                      value={formLocalLimpio === null ? "" : formLocalLimpio ? "true" : "false"}
                      onChange={(e) =>
                        setFormLocalLimpio(e.target.value === "" ? null : e.target.value === "true")
                      }
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">—</option>
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Productos bien exhibidos (1-5)</label>
                    <select
                      value={formProductosExhibidos}
                      onChange={(e) => setFormProductosExhibidos(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">—</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock suficiente</label>
                    <select
                      value={formStockSuficiente === null ? "" : formStockSuficiente ? "true" : "false"}
                      onChange={(e) =>
                        setFormStockSuficiente(e.target.value === "" ? null : e.target.value === "true")
                      }
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">—</option>
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rotación productos (1-5)</label>
                    <select
                      value={formRotacion}
                      onChange={(e) => setFormRotacion(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">—</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cumple plazos de pago</label>
                    <select
                      value={formPlazosPago === null ? "" : formPlazosPago ? "true" : "false"}
                      onChange={(e) =>
                        setFormPlazosPago(e.target.value === "" ? null : e.target.value === "true")
                      }
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">—</option>
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Métodos de pago frecuentes</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {METODOS_PAGO.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => toggleMetodoPago(m.value)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            formMetodosPago.includes(m.value)
                              ? "bg-primary-900/40 text-primary-300"
                              : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Frecuencia envíos</label>
                    <select
                      value={formFrecuenciaEnvios}
                      onChange={(e) => setFormFrecuenciaEnvios(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">—</option>
                      {FRECUENCIA_ENVIOS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Promedio kg/mes</label>
                    <select
                      value={formPromedioKg}
                      onChange={(e) => setFormPromedioKg(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">—</option>
                      {PROMEDIO_KG_MES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Monto compra/mes</label>
                    <select
                      value={formMontoCompra}
                      onChange={(e) => setFormMontoCompra(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">—</option>
                      {MONTO_COMPRA_MES.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Condiciones generales del local */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Condiciones generales del local (1-5)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Local limpio</label>
                    <select value={formCondicionesLocal} onChange={(e) => setFormCondicionesLocal(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="">—</option>
                      {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Iluminación</label>
                    <select value={formCondicionesIluminacion} onChange={(e) => setFormCondicionesIluminacion(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="">—</option>
                      {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sector mascotas</label>
                    <select value={formCondicionesSector} onChange={(e) => setFormCondicionesSector(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="">—</option>
                      {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Normas higiene</label>
                    <select value={formCondicionesHigiene} onChange={(e) => setFormCondicionesHigiene(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="">—</option>
                      {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Exhibición de productos */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Exhibición de productos (1-5)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Productos visibles</label>
                    <select value={formExhibicionVisible} onChange={(e) => setFormExhibicionVisible(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="">—</option>
                      {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación estratégica</label>
                    <select value={formExhibicionUbicacion} onChange={(e) => setFormExhibicionUbicacion(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="">—</option>
                      {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cartelería</label>
                    <select value={formExhibicionCarteleria} onChange={(e) => setFormExhibicionCarteleria(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="">—</option>
                      {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vs. competencia</label>
                    <select value={formExhibicionComparacion} onChange={(e) => setFormExhibicionComparacion(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="">—</option>
                      <option value="mejor">Mejor</option>
                      <option value="igual">Igual</option>
                      <option value="peor">Peor</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones exhibición</label>
                  <textarea value={formExhibicionObs} onChange={(e) => setFormExhibicionObs(e.target.value)} rows={2} placeholder="..." className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>

              {/* Stock, precios, relación */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Stock, precios y relación
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones stock y rotación</label>
                    <textarea value={formStockObs} onChange={(e) => setFormStockObs(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones precios y comercialización</label>
                    <textarea value={formPreciosObs} onChange={(e) => setFormPreciosObs(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones relación con distribuidora</label>
                    <textarea value={formRelacionObs} onChange={(e) => setFormRelacionObs(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Auditoría del vendedor */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Auditoría del vendedor
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gestión comercial</label>
                    <textarea value={formGestionObs} onChange={(e) => setFormGestionObs(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Conocimiento del producto</label>
                    <textarea value={formConocimientoObs} onChange={(e) => setFormConocimientoObs(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Relación con cliente</label>
                    <textarea value={formRelacionClienteObs} onChange={(e) => setFormRelacionClienteObs(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cumplimiento administrativo</label>
                    <textarea value={formCumplimientoObs} onChange={(e) => setFormCumplimientoObs(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Logística y servicio</label>
                    <textarea value={formLogisticaObs} onChange={(e) => setFormLogisticaObs(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Puntuaciones */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Puntuaciones (1-10)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                    <select
                      value={formPuntuacionCliente}
                      onChange={(e) => setFormPuntuacionCliente(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">—</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vendedor</label>
                    <select
                      value={formPuntuacionVendedor}
                      onChange={(e) => setFormPuntuacionVendedor(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">—</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Repartidor</label>
                    <select
                      value={formPuntuacionRepartidor}
                      onChange={(e) => setFormPuntuacionRepartidor(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">—</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Clasificación del cliente</label>
                  <select
                    value={formClasificacion}
                    onChange={(e) => setFormClasificacion(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">—</option>
                    {CLASIFICACIONES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
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
                  disabled={loading || !clientes.length || !vendedores.length}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? "Guardando..." : modal === "nuevo" ? "Cierre Auditoría" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200">¿Eliminar auditoría?</h2>
            <p className="mt-2 text-slate-300">
              Esta acción no se puede deshacer. El registro de auditoría será eliminado.
            </p>
            {error && (
              <div className="mt-2 p-2 rounded bg-red-900/50 text-red-300 text-sm">{error}</div>
            )}
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(deleteConfirm)}
                disabled={loading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
