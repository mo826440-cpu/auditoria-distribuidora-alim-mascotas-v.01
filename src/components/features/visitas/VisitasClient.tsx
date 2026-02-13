"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export function VisitasClient({
  visitas,
  clientes,
  vendedores,
  rol,
}: {
  visitas: Visita[];
  clientes: Cliente[];
  vendedores: Vendedor[];
  rol: string;
}) {
  const router = useRouter();
  const canEdit = ["administrador", "auditor"].includes(rol);

  const [modal, setModal] = useState<"nuevo" | "editar" | null>(null);
  const [visitaEdit, setVisitaEdit] = useState<Visita | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formCliente, setFormCliente] = useState("");
  const [formVendedor, setFormVendedor] = useState("");
  const [formFecha, setFormFecha] = useState("");
  const [formHoraInicio, setFormHoraInicio] = useState("");
  const [formHoraFin, setFormHoraFin] = useState("");
  const [formObservaciones, setFormObservaciones] = useState("");
  const [formEstado, setFormEstado] = useState("pendiente");

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
      const res = await fetch(`/api/visitas/${id}`, { method: "DELETE" });
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

  const estadoBadge = (estado: string) => {
    const styles: Record<string, string> = {
      pendiente: "bg-amber-100 text-amber-700",
      realizada: "bg-green-100 text-green-700",
      cancelada: "bg-red-100 text-red-700",
      reprogramada: "bg-blue-100 text-blue-700",
    };
    const label = ESTADOS.find((e) => e.value === estado)?.label || estado;
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${styles[estado] || "bg-slate-100 text-slate-600"}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="mt-6">
      {canEdit && (
        <button
          onClick={abrirNuevo}
          className="mb-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium"
        >
          Programar visita
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
                <th className="text-left py-3 px-4 font-medium text-slate-700">Horario</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Estado</th>
                {canEdit && (
                  <th className="text-right py-3 px-4 font-medium text-slate-700">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {visitas.length === 0 ? (
                <tr>
                  <td
                    colSpan={canEdit ? 6 : 5}
                    className="py-8 px-4 text-center text-slate-500"
                  >
                    No hay visitas programadas. {canEdit && "Programá una para comenzar."}
                  </td>
                </tr>
              ) : (
                visitas.map((v) => (
                  <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      {new Date(v.fecha_visita + "T12:00:00").toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {v.clientes?.nombre || "—"}
                    </td>
                    <td className="py-3 px-4">{v.vendedores?.nombre || "—"}</td>
                    <td className="py-3 px-4">
                      {formatTime(v.hora_inicio)} – {formatTime(v.hora_fin)}
                    </td>
                    <td className="py-3 px-4">{estadoBadge(v.estado)}</td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => abrirEditar(v)}
                          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(v.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded ml-1"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo */}
      {modal === "nuevo" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900">Programar visita</h2>
            {error && (
              <div className="mt-2 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>
            )}
            <form onSubmit={handleCrear} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
                <select
                  value={formCliente}
                  onChange={(e) => setFormCliente(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Seleccionar cliente</option>
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
                  <option value="">Seleccionar vendedor</option>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora inicio</label>
                  <input
                    type="time"
                    value={formHoraInicio}
                    onChange={(e) => setFormHoraInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora fin</label>
                  <input
                    type="time"
                    value={formHoraFin}
                    onChange={(e) => setFormHoraFin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select
                  value={formEstado}
                  onChange={(e) => setFormEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900">Editar visita</h2>
            {error && (
              <div className="mt-2 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>
            )}
            <form onSubmit={handleEditar} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
                <select
                  value={formCliente}
                  onChange={(e) => setFormCliente(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora inicio</label>
                  <input
                    type="time"
                    value={formHoraInicio}
                    onChange={(e) => setFormHoraInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora fin</label>
                  <input
                    type="time"
                    value={formHoraFin}
                    onChange={(e) => setFormHoraFin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select
                  value={formEstado}
                  onChange={(e) => setFormEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                <textarea
                  value={formObservaciones}
                  onChange={(e) => setFormObservaciones(e.target.value)}
                  rows={3}
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

      {/* Confirmar eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">¿Eliminar visita?</h2>
            <p className="mt-2 text-slate-600">
              Esta acción no se puede deshacer. La visita programada será eliminada.
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
