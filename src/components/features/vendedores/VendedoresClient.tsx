"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { imprimirComoPdf, contenidoPdfVendedor } from "@/lib/pdfUtils";

type Zona = {
  id: string;
  nombre: string;
};

type Vendedor = {
  id: string;
  nombre: string;
  contacto?: string | null;
  email?: string | null;
  codigo_interno?: string | null;
  dni?: string | null;
  id_zonas?: string[] | null;
  zonas_nombres?: string | null;
  residencia?: string | null;
  observaciones?: string | null;
  activo: boolean;
  created_at: string;
  updated_at?: string;
  usuario_registro?: string;
};

const E164_REGEX = /^\+[1-9]\d{6,14}$/;
const CODIGO_INTERNO_REGEX = /^[0-9\-]+$/;
const DNI_REGEX = /^\d{2}\.\d{3}\.\d{3}$/;

function formatearDni(v: string): string {
  const s = v.replace(/\D/g, "").slice(0, 8);
  if (s.length >= 8) return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}`;
  if (s.length >= 5) return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5)}`;
  if (s.length >= 2) return `${s.slice(0, 2)}.${s.slice(2)}`;
  return s;
}

function urlGoogleMaps(residencia: string): string {
  const q = encodeURIComponent(`${residencia}, Argentina`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function VendedoresClient({
  vendedores,
  zonas,
  rol,
  usuarioNombre,
}: {
  vendedores: Vendedor[];
  zonas: Zona[];
  rol: string;
  usuarioNombre: string;
}) {
  const router = useRouter();
  const canEdit = ["administrador", "auditor"].includes(rol);

  const [modal, setModal] = useState<"nuevo" | "editar" | null>(null);
  const [vendedorEdit, setVendedorEdit] = useState<Vendedor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formNombre, setFormNombre] = useState("");
  const [formContacto, setFormContacto] = useState("+54");
  const [formEmail, setFormEmail] = useState("");
  const [formCodigo, setFormCodigo] = useState("");
  const [formDni, setFormDni] = useState("");
  const [formZonas, setFormZonas] = useState<string[]>([]);
  const [formResidencia, setFormResidencia] = useState("");
  const [formObservaciones, setFormObservaciones] = useState("");
  const [formActivo, setFormActivo] = useState(true);

  function abrirNuevo() {
    setFormNombre("");
    setFormContacto("+54");
    setFormEmail("");
    setFormCodigo("");
    setFormDni("");
    setFormZonas([]);
    setFormResidencia("");
    setFormObservaciones("");
    setFormActivo(true);
    setError(null);
    setVendedorEdit(null);
    setModal("nuevo");
  }

  function abrirEditar(v: Vendedor) {
    setVendedorEdit(v);
    setFormNombre(v.nombre ?? "");
    setFormContacto(v.contacto ?? "+54");
    setFormEmail(v.email ?? "");
    setFormCodigo(v.codigo_interno ?? "");
    setFormDni(v.dni ?? "");
    setFormZonas(v.id_zonas ?? []);
    setFormResidencia(v.residencia ?? "");
    setFormObservaciones(v.observaciones ?? "");
    setFormActivo(v.activo);
    setError(null);
    setModal("editar");
  }

  function toggleZona(zonaId: string) {
    setFormZonas((prev) =>
      prev.includes(zonaId) ? prev.filter((id) => id !== zonaId) : [...prev, zonaId]
    );
  }

  function validarForm(): string | null {
    if (!formNombre.trim()) return "Nombre obligatorio";
    if (formNombre.length > 100) return "Nombre: máximo 100 caracteres";
    if (!formContacto.trim()) return "Contacto obligatorio";
    if (!E164_REGEX.test(formContacto)) return "Contacto en formato E.164 (ej: +5493511234567)";
    if (!formCodigo.trim()) return "Código interno obligatorio";
    if (!CODIGO_INTERNO_REGEX.test(formCodigo)) return "Código interno: solo números y guiones";
    const dniFormateado = formatearDni(formDni);
    if (dniFormateado.length !== 10 || !DNI_REGEX.test(dniFormateado)) {
      return "DNI debe tener exactamente 8 dígitos (formato XX.XXX.XXX)";
    }
    if (formEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) return "Email inválido";
    if (formResidencia.length > 100) return "Residencia: máximo 100 caracteres";
    return null;
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const err = validarForm();
    if (err) {
      setError(err);
      return;
    }
    if (!confirm("¿Confirmar registro de datos?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/vendedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formNombre.trim(),
          contacto: formContacto.trim(),
          email: formEmail.trim() || undefined,
          codigo_interno: formCodigo.trim(),
          dni: formatearDni(formDni),
          id_zonas: formZonas.length > 0 ? formZonas : undefined,
          residencia: formResidencia.trim() || undefined,
          observaciones: formObservaciones.trim() || undefined,
          activo: formActivo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear vendedor");
      setModal(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear vendedor");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditar(e: React.FormEvent) {
    e.preventDefault();
    if (!vendedorEdit) return;
    setError(null);
    const err = validarForm();
    if (err) {
      setError(err);
      return;
    }
    if (!confirm("¿Confirmar edición de datos?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vendedores/${vendedorEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formNombre.trim(),
          contacto: formContacto.trim(),
          email: formEmail.trim() || undefined,
          codigo_interno: formCodigo.trim(),
          dni: formatearDni(formDni),
          id_zonas: formZonas,
          residencia: formResidencia.trim() || undefined,
          observaciones: formObservaciones.trim() || undefined,
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
    if (!confirm("¿Eliminar este vendedor? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vendedores/${id}`, { method: "DELETE" });
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

  function handleVerDetalle(v: Vendedor) {
    const fecha = v.updated_at || v.created_at;
    const fechaStr = fecha ? new Date(fecha).toLocaleString("es-AR") : "—";
    const contenido = contenidoPdfVendedor(
      fechaStr,
      v.nombre ?? "—",
      v.contacto ?? "—",
      v.email ?? "—",
      v.codigo_interno ?? "—",
      v.dni ?? "—",
      v.zonas_nombres ?? "—",
      v.residencia ?? "—",
      v.observaciones ?? "—",
      v.activo ? "Activo" : "Inactivo"
    );
    const pie = `${v.usuario_registro ?? usuarioNombre} — Página 1`;
    imprimirComoPdf(`Detalle Vendedor - ${v.nombre}`, contenido, pie);
  }

  const fechaActual = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isNuevo = modal === "nuevo";
  const handleSubmit = isNuevo ? handleCrear : handleEditar;

  const formContent = (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de registro</label>
        <input
          type="text"
          value={fechaActual}
          readOnly
          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Vendedor *</label>
        <input
          type="text"
          value={formNombre}
          onChange={(e) => setFormNombre(e.target.value.slice(0, 100))}
          required
          maxLength={100}
          placeholder="Hasta 100 caracteres"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contacto * (E.164)</label>
        <input
          type="tel"
          value={formContacto}
          onChange={(e) => setFormContacto(e.target.value)}
          required
          placeholder="+5493511234567"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          value={formEmail}
          onChange={(e) => setFormEmail(e.target.value)}
          placeholder="vendedor@ejemplo.com"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Código Interno *</label>
        <input
          type="text"
          inputMode="numeric"
          value={formCodigo}
          onChange={(e) => setFormCodigo(e.target.value.replace(/[^0-9\-]/g, ""))}
          required
          placeholder="Solo números y guiones"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">DNI * (8 dígitos)</label>
        <input
          type="text"
          inputMode="numeric"
          value={formDni}
          onChange={(e) => setFormDni(formatearDni(e.target.value))}
          required
          placeholder="35.145.907"
          maxLength={10}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Zona (puede elegir varias)</label>
        <div className="border border-slate-200 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
          {zonas.map((z) => (
            <label key={z.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formZonas.includes(z.id)}
                onChange={() => toggleZona(z.id)}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">{z.nombre}</span>
            </label>
          ))}
          {zonas.length === 0 && (
            <p className="text-sm text-slate-500">No hay zonas cargadas. Creá zonas en Referencias.</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Residencia</label>
        <input
          type="text"
          value={formResidencia}
          onChange={(e) => setFormResidencia(e.target.value.slice(0, 100))}
          maxLength={100}
          placeholder="Letras, números, espacios, acentos, puntos, comas"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
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
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="activo-vendedor"
          checked={formActivo}
          onChange={(e) => setFormActivo(e.target.checked)}
          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="activo-vendedor" className="text-sm font-medium text-slate-700">
          Estado Activo
        </label>
      </div>
    </>
  );

  return (
    <div className="mt-6">
      {canEdit && (
        <button
          onClick={abrirNuevo}
          className="mb-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium"
        >
          Crear vendedor
        </button>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Código</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Vendedor</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Contacto</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Residencia</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Estado</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-slate-500">
                    No hay vendedores. {canEdit && "Creá uno para comenzar."}
                  </td>
                </tr>
              ) : (
                vendedores.map((v) => (
                  <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{v.codigo_interno ?? "—"}</td>
                    <td className="py-3 px-4">{v.nombre ?? "—"}</td>
                    <td className="py-3 px-4">{v.contacto ?? "—"}</td>
                    <td className="py-3 px-4">
                      {v.residencia ? (
                        <a
                          href={urlGoogleMaps(v.residencia)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                          title="Ver ubicación"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Ubicación
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          v.activo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {v.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleVerDetalle(v)}
                        className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                        title="Ver detalle (PDF)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {canEdit && (
                        <>
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
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(modal === "nuevo" || modal === "editar") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[85vh]">
            <div className="flex-shrink-0 px-6 pt-6 pb-2">
              <h2 className="text-lg font-semibold text-slate-900">
                {modal === "nuevo" ? "Crear vendedor" : "Editar vendedor"}
              </h2>
              {error && (
                <div className="mt-2 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 min-h-0">
                {formContent}
              </div>
              <div className="flex-shrink-0 flex gap-2 justify-end px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg"
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

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">¿Eliminar vendedor?</h2>
            <p className="mt-2 text-slate-600">
              Esta acción no se puede deshacer. Se eliminará el vendedor y sus datos asociados.
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
