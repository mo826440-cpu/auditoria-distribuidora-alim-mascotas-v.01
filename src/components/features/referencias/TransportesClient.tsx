"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { imprimirComoPdf, contenidoPdfTransporte } from "@/lib/pdfUtils";

type Transporte = {
  id: string;
  tipo: string;
  marca: string;
  dominio_patente: string;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
  usuarios?: { nombre: string } | null;
};

const TIPOS = [
  { value: "camion", label: "Camión" },
  { value: "utilitario", label: "Utilitario" },
  { value: "auto", label: "Auto" },
  { value: "camioneta", label: "Camioneta" },
  { value: "moto", label: "Moto" },
  { value: "acoplado", label: "Acoplado" },
  { value: "otro", label: "Otro" },
];

export function TransportesClient({
  transportes,
  rol,
}: {
  transportes: Transporte[];
  rol: string;
}) {
  const router = useRouter();
  const canEdit = ["administrador", "auditor"].includes(rol);

  const [modal, setModal] = useState<"nuevo" | "editar" | null>(null);
  const [transporteEdit, setTransporteEdit] = useState<Transporte | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formTipo, setFormTipo] = useState("");
  const [formMarca, setFormMarca] = useState("");
  const [formDominio, setFormDominio] = useState("");
  const [formObservaciones, setFormObservaciones] = useState("");

  function abrirNuevo() {
    setFormTipo("");
    setFormMarca("");
    setFormDominio("");
    setFormObservaciones("");
    setError(null);
    setTransporteEdit(null);
    setModal("nuevo");
  }

  function abrirEditar(t: Transporte) {
    setTransporteEdit(t);
    setFormTipo(t.tipo);
    setFormMarca(t.marca);
    setFormDominio(t.dominio_patente);
    setFormObservaciones(t.observaciones || "");
    setError(null);
    setModal("editar");
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!formTipo.trim()) {
      setError("El tipo es obligatorio");
      return;
    }
    if (!formMarca.trim()) {
      setError("La marca es obligatoria");
      return;
    }
    if (!formDominio.trim()) {
      setError("El dominio/patente es obligatorio");
      return;
    }
    if (!confirm("¿Confirmar registro de datos?")) return;

    setLoading(true);
    try {
      const url = transporteEdit
        ? `/api/referencias/transportes/${transporteEdit.id}`
        : "/api/referencias/transportes";
      const method = transporteEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: formTipo,
          marca: formMarca.trim(),
          dominio_patente: formDominio.trim(),
          observaciones: formObservaciones.trim() || undefined,
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
    if (!confirm("¿Estás seguro de eliminar este transporte?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/referencias/transportes/${id}`, { method: "DELETE" });
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

  function descargarPdf(t: Transporte) {
    const fechaHora = new Date(t.updated_at || t.created_at).toLocaleString("es-AR");
    const contenido = contenidoPdfTransporte(
      fechaHora,
      t.tipo,
      t.marca,
      t.dominio_patente,
      t.observaciones || ""
    );
    const pie = `Registrado por: ${(t.usuarios as { nombre?: string })?.nombre || "—"} | Página 1`;
    imprimirComoPdf(`Detalle Transporte - ${t.marca}`, contenido, pie);
  }

  const formatFecha = (d: string) =>
    new Date(d).toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });

  return (
    <div className="mt-6">
      {canEdit && (
        <button
          onClick={abrirNuevo}
          className="mb-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium"
        >
          Nuevo transporte
        </button>
      )}

      <div className="bg-slate-850 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 border-b border-slate-700">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Fecha</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Transporte</th>
              {canEdit && (
                <th className="text-right py-3 px-4 font-medium text-slate-200">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {transportes.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 3 : 2} className="py-8 px-4 text-center text-slate-400">
                  No hay transportes cargados. {canEdit && "Creá uno para comenzar."}
                </td>
              </tr>
            ) : (
              transportes.map((t) => (
                <tr key={t.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="py-3 px-4 text-slate-300">{formatFecha(t.updated_at || t.created_at)}</td>
                  <td className="py-3 px-4 font-medium text-slate-200">{t.marca}</td>
                  {canEdit && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => abrirEditar(t)}
                        className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => descargarPdf(t)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-900/40 rounded ml-1"
                        title="Ver detalle (PDF)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(t.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/40 rounded ml-1"
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

      {/* Modal Nuevo / Editar */}
      {(modal === "nuevo" || modal === "editar") && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-6 px-4">
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-md shadow-xl my-2 border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200">
              {modal === "nuevo" ? "Nuevo transporte" : "Editar transporte"}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Fecha de registro: {new Date().toLocaleString("es-AR")} (automática)
            </p>
            {error && (
              <div className="mt-2 p-3 rounded-lg bg-red-900/50 border border-red-800 text-red-300 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleGuardar} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tipo *</label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Seleccionar</option>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Marca *</label>
                <input
                  type="text"
                  value={formMarca}
                  onChange={(e) => setFormMarca(e.target.value)}
                  required
                  placeholder="Ej: Fiat, Mercedes"
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Dominio/Patente *</label>
                <input
                  type="text"
                  value={formDominio}
                  onChange={(e) => setFormDominio(e.target.value)}
                  required
                  placeholder="Ej: ABC 123"
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                />
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
                  {loading ? "Guardando..." : "Registrar"}
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
            <h2 className="text-lg font-semibold text-slate-200">¿Eliminar transporte?</h2>
            <p className="mt-2 text-slate-300">
              Esta acción no se puede deshacer. ¿Estás seguro?
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
