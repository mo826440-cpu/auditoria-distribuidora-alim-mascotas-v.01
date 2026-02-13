"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Cliente = {
  id: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  localidad: string | null;
  provincia: string | null;
  activo: boolean;
  created_at: string;
};

export function ClientesClient({
  clientes,
  rol,
}: {
  clientes: Cliente[];
  rol: string;
}) {
  const router = useRouter();
  const canEdit = ["administrador", "auditor"].includes(rol);

  const [modal, setModal] = useState<"nuevo" | "editar" | null>(null);
  const [clienteEdit, setClienteEdit] = useState<Cliente | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formNombre, setFormNombre] = useState("");
  const [formDireccion, setFormDireccion] = useState("");
  const [formTelefono, setFormTelefono] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formLocalidad, setFormLocalidad] = useState("");
  const [formProvincia, setFormProvincia] = useState("Córdoba");
  const [formActivo, setFormActivo] = useState(true);

  function abrirNuevo() {
    setFormNombre("");
    setFormDireccion("");
    setFormTelefono("");
    setFormEmail("");
    setFormLocalidad("");
    setFormProvincia("Córdoba");
    setFormActivo(true);
    setError(null);
    setModal("nuevo");
  }

  function abrirEditar(c: Cliente) {
    setClienteEdit(c);
    setFormNombre(c.nombre);
    setFormDireccion(c.direccion || "");
    setFormTelefono(c.telefono || "");
    setFormEmail(c.email || "");
    setFormLocalidad(c.localidad || "");
    setFormProvincia(c.provincia || "Córdoba");
    setFormActivo(c.activo);
    setError(null);
    setModal("editar");
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formNombre,
          direccion: formDireccion || undefined,
          telefono: formTelefono || undefined,
          email: formEmail || undefined,
          localidad: formLocalidad || undefined,
          provincia: formProvincia || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear cliente");
      setModal(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cliente");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditar(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteEdit) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/clientes/${clienteEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formNombre,
          direccion: formDireccion || undefined,
          telefono: formTelefono || undefined,
          email: formEmail || undefined,
          localidad: formLocalidad || undefined,
          provincia: formProvincia || undefined,
          activo: formActivo,
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
      const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
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
      {canEdit && (
        <button
          onClick={abrirNuevo}
          className="mb-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium"
        >
          Crear cliente
        </button>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Nombre</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Dirección</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Teléfono</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Localidad</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Estado</th>
                {canEdit && (
                  <th className="text-right py-3 px-4 font-medium text-slate-700">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={canEdit ? 6 : 5}
                    className="py-8 px-4 text-center text-slate-500"
                  >
                    No hay clientes. {canEdit && "Creá uno para comenzar."}
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{c.nombre}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate" title={c.direccion || ""}>
                      {c.direccion || "—"}
                    </td>
                    <td className="py-3 px-4">{c.telefono || "—"}</td>
                    <td className="py-3 px-4">{c.localidad || "—"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          c.activo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => abrirEditar(c)}
                          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(c.id)}
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
            <h2 className="text-lg font-semibold text-slate-900">Crear cliente</h2>
            {error && (
              <div className="mt-2 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>
            )}
            <form onSubmit={handleCrear} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  required
                  placeholder="Ej: Farmacia del Centro"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formDireccion}
                  onChange={(e) => setFormDireccion(e.target.value)}
                  placeholder="Calle, número"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formTelefono}
                    onChange={(e) => setFormTelefono(e.target.value)}
                    placeholder="0353 1234567"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Localidad</label>
                  <input
                    type="text"
                    value={formLocalidad}
                    onChange={(e) => setFormLocalidad(e.target.value)}
                    placeholder="Villa María"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Provincia</label>
                  <input
                    type="text"
                    value={formProvincia}
                    onChange={(e) => setFormProvincia(e.target.value)}
                    placeholder="Córdoba"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
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
                  {loading ? "Creando..." : "Crear cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modal === "editar" && clienteEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900">Editar cliente</h2>
            {error && (
              <div className="mt-2 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>
            )}
            <form onSubmit={handleEditar} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formDireccion}
                  onChange={(e) => setFormDireccion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formTelefono}
                    onChange={(e) => setFormTelefono(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Localidad</label>
                  <input
                    type="text"
                    value={formLocalidad}
                    onChange={(e) => setFormLocalidad(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Provincia</label>
                  <input
                    type="text"
                    value={formProvincia}
                    onChange={(e) => setFormProvincia(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formActivo}
                  onChange={(e) => setFormActivo(e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="activo" className="text-sm font-medium text-slate-700">
                  Cliente activo
                </label>
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
            <h2 className="text-lg font-semibold text-slate-900">¿Eliminar cliente?</h2>
            <p className="mt-2 text-slate-600">
              Esta acción no se puede deshacer. Se eliminará el cliente y sus datos asociados.
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
