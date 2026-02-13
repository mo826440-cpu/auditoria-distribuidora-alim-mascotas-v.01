"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Cliente = { id: string; nombre: string };
type Vendedor = { id: string; nombre: string };
type Visita = { id: string; fecha_visita: string };
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
  puntuacion_cliente: number | null;
  puntuacion_vendedor: number | null;
  puntuacion_repartidor: number | null;
  clasificacion_cliente: string | null;
  condiciones_generales?: { observaciones?: string } | null;
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

export function AuditoriasClient({
  auditorias,
  clientes,
  vendedores,
  visitas,
  transportistas,
  rol,
}: {
  auditorias: Auditoria[];
  clientes: Cliente[];
  vendedores: Vendedor[];
  visitas: Visita[];
  transportistas: Transportista[];
  rol: string;
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
    setError(null);
    setAuditoriaEdit(null);
    setModal("nuevo");
  }

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
    setFormObservaciones(a.condiciones_generales?.observaciones ?? "");
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
    };
    if (formObservaciones.trim()) {
      payload.condiciones_generales = { observaciones: formObservaciones.trim() };
    }
    return payload;
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!clientes.length || !vendedores.length) {
      setError("Debés tener al menos un cliente y un vendedor para crear una auditoría.");
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

  const clasificacionLabel = (v: string | null) =>
    CLASIFICACIONES.find((c) => c.value === v)?.label ?? "—";

  return (
    <div className="mt-6">
      {canEdit && (
        <button
          onClick={abrirNuevo}
          className="mb-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium"
        >
          Nueva auditoría
        </button>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Fecha</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Cliente</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Vendedor</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Punt. cliente</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Punt. vendedor</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Clasificación</th>
                {canEdit && (
                  <th className="text-right py-3 px-4 font-medium text-slate-700">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {auditorias.length === 0 ? (
                <tr>
                  <td
                    colSpan={canEdit ? 7 : 6}
                    className="py-8 px-4 text-center text-slate-500"
                  >
                    No hay auditorías registradas. {canEdit && "Creá una para comenzar."}
                  </td>
                </tr>
              ) : (
                auditorias.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      {new Date(a.fecha + "T12:00:00").toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {(a.clientes as { nombre: string } | null)?.nombre ?? "—"}
                    </td>
                    <td className="py-3 px-4">
                      {(a.vendedores as { nombre: string } | null)?.nombre ?? "—"}
                    </td>
                    <td className="py-3 px-4">{a.puntuacion_cliente ?? "—"}</td>
                    <td className="py-3 px-4">{a.puntuacion_vendedor ?? "—"}</td>
                    <td className="py-3 px-4">{clasificacionLabel(a.clasificacion_cliente)}</td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => abrirEditar(a)}
                          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => setDeleteConfirm(a.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded ml-1"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo / Editar */}
      {(modal === "nuevo" || modal === "editar") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl my-8">
            <h2 className="text-lg font-semibold text-slate-900">
              {modal === "nuevo" ? "Nueva auditoría" : "Editar auditoría"}
            </h2>
            {!clientes.length && (
              <div className="mt-2 p-3 rounded bg-amber-50 text-amber-800 text-sm">
                No hay clientes. Creá al menos un cliente antes de registrar una auditoría.
              </div>
            )}
            {!vendedores.length && (
              <div className="mt-2 p-3 rounded bg-amber-50 text-amber-800 text-sm">
                No hay vendedores. Creá al menos un vendedor antes de registrar una auditoría.
              </div>
            )}
            {error && (
              <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}
            <form
              onSubmit={modal === "nuevo" ? handleCrear : handleEditar}
              className="mt-4 space-y-6"
            >
              {/* Datos generales */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Datos generales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
                    <select
                      value={formCliente}
                      onChange={(e) => setFormCliente(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">Seleccionar</option>
                      {vendedores.map((v) => (
                        <option key={v.id} value={v.id}>{v.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
                    <input
                      type="date"
                      value={formFecha}
                      onChange={(e) => setFormFecha(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Visita programada</label>
                    <select
                      value={formVisita}
                      onChange={(e) => setFormVisita(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">Ninguna</option>
                      {visitas.map((v) => (
                        <option key={v.id} value={v.id}>
                          {new Date(v.fecha_visita + "T12:00:00").toLocaleDateString("es-AR")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Transportista</label>
                    <select
                      value={formTransportista}
                      onChange={(e) => setFormTransportista(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">Ninguno</option>
                      {transportistas.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
                              ? "bg-primary-100 text-primary-700"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !clientes.length || !vendedores.length}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? "Guardando..." : modal === "nuevo" ? "Crear auditoría" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">¿Eliminar auditoría?</h2>
            <p className="mt-2 text-slate-600">
              Esta acción no se puede deshacer. El registro de auditoría será eliminado.
            </p>
            {error && (
              <div className="mt-2 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>
            )}
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
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
