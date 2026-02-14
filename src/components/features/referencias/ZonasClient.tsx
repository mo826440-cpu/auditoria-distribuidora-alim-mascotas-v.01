"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALIDADES_CORDOBA } from "@/data/localidadesCordoba";
import { imprimirComoPdf, contenidoPdfZona } from "@/lib/pdfUtils";

type Zona = {
  id: string;
  nombre: string;
  localidades: string[];
  observaciones: string | null;
  created_at: string;
  updated_at: string;
  usuarios?: { nombre: string } | null;
};

export function ZonasClient({
  zonas,
  usuarioNombre,
  rol,
}: {
  zonas: Zona[];
  usuarioNombre: string;
  rol: string;
}) {
  const router = useRouter();
  const canEdit = ["administrador", "auditor"].includes(rol);

  const [modal, setModal] = useState<"nuevo" | "editar" | null>(null);
  const [zonaEdit, setZonaEdit] = useState<Zona | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formNombre, setFormNombre] = useState("");
  const [formLocalidades, setFormLocalidades] = useState<string[]>([]);
  const [formObservaciones, setFormObservaciones] = useState("");

  const localidadesEnUso = new Set(
    zonas
      .filter((z) => !zonaEdit || z.id !== zonaEdit.id)
      .flatMap((z) => z.localidades || [])
  );

  function abrirNuevo() {
    setFormNombre("");
    setFormLocalidades([]);
    setFormObservaciones("");
    setError(null);
    setZonaEdit(null);
    setModal("nuevo");
  }

  function abrirEditar(z: Zona) {
    setZonaEdit(z);
    setFormNombre(z.nombre);
    setFormLocalidades(z.localidades || []);
    setFormObservaciones(z.observaciones || "");
    setError(null);
    setModal("editar");
  }

  function toggleLocalidad(loc: string) {
    setFormLocalidades((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  }

  function puedeSeleccionar(loc: string) {
    if (formLocalidades.includes(loc)) return true;
    if (!zonaEdit) return !localidadesEnUso.has(loc);
    return !localidadesEnUso.has(loc) || zonaEdit.localidades?.includes(loc);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!formNombre.trim()) {
      setError("El nombre de zona es obligatorio");
      return;
    }
    if (!formLocalidades.length) {
      setError("Debés seleccionar al menos una localidad");
      return;
    }
    if (!confirm("¿Confirmar registro de datos?")) return;

    setLoading(true);
    try {
      const url = zonaEdit ? `/api/referencias/zonas/${zonaEdit.id}` : "/api/referencias/zonas";
      const method = zonaEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formNombre.trim(),
          localidades: formLocalidades,
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
    if (!confirm("¿Estás seguro de eliminar esta zona?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/referencias/zonas/${id}`, { method: "DELETE" });
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

  function descargarPdf(z: Zona) {
    const fechaHora = new Date(z.updated_at || z.created_at).toLocaleString("es-AR");
    const contenido = contenidoPdfZona(
      fechaHora,
      z.nombre,
      z.localidades || [],
      z.observaciones || ""
    );
    const pie = `Registrado por: ${(z.usuarios as { nombre?: string })?.nombre || "—"} | Página 1`;
    imprimirComoPdf(`Detalle Zona - ${z.nombre}`, contenido, pie);
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
          Nueva zona
        </button>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-slate-700">Fecha</th>
              <th className="text-left py-3 px-4 font-medium text-slate-700">Zona</th>
              {canEdit && (
                <th className="text-right py-3 px-4 font-medium text-slate-700">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {zonas.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 3 : 2} className="py-8 px-4 text-center text-slate-500">
                  No hay zonas cargadas. {canEdit && "Creá una para comenzar."}
                </td>
              </tr>
            ) : (
              zonas.map((z) => (
                <tr key={z.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">{formatFecha(z.updated_at || z.created_at)}</td>
                  <td className="py-3 px-4 font-medium">{z.nombre}</td>
                  {canEdit && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => abrirEditar(z)}
                        className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => descargarPdf(z)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded ml-1"
                        title="Ver detalle (PDF)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(z.id)}
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

      {/* Modal Nuevo / Editar */}
      {(modal === "nuevo" || modal === "editar") && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-6 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl my-2 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900">
              {modal === "nuevo" ? "Nueva zona" : "Editar zona"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Fecha de registro: {new Date().toLocaleString("es-AR")} (automática)
            </p>
            {error && (
              <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleGuardar} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre zona *</label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  required
                  placeholder="Ej: Zona Norte"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Localidades y ciudades (Córdoba) * — Seleccioná al menos una
                </label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-2">
                  {LOCALIDADES_CORDOBA.map((loc) => {
                    const disabled = !puedeSeleccionar(loc);
                    const checked = formLocalidades.includes(loc);
                    return (
                      <label
                        key={loc}
                        className={`flex items-center gap-2 cursor-pointer ${disabled && !checked ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => !disabled && toggleLocalidad(loc)}
                          disabled={disabled && !checked}
                          className="rounded border-slate-300 text-primary-600"
                        />
                        <span>{loc}</span>
                      </label>
                    );
                  })}
                </div>
                {formLocalidades.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {formLocalidades.length} seleccionada(s)
                  </p>
                )}
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">¿Eliminar zona?</h2>
            <p className="mt-2 text-slate-600">
              Esta acción no se puede deshacer. ¿Estás seguro?
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
