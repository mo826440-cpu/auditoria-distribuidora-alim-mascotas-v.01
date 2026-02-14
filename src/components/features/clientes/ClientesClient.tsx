"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PROVINCIAS_ARGENTINA } from "@/data/provinciasArgentina";
import { imprimirComoPdf, contenidoPdfCliente } from "@/lib/pdfUtils";

type Zona = {
  id: string;
  nombre: string;
  localidades: string[];
};

type Cliente = {
  id: string;
  nombre: string;
  nombre_representante?: string | null;
  contacto?: string | null;
  email?: string | null;
  codigo_interno?: string | null;
  cuit?: string | null;
  id_zona?: string | null;
  zona_nombre?: string | null;
  localidad?: string | null;
  provincia?: string | null;
  calle?: string | null;
  numero?: number | null;
  observaciones?: string | null;
  activo: boolean;
  created_at: string;
  updated_at?: string;
  usuario_registro?: string;
};

const E164_REGEX = /^\+[1-9]\d{6,14}$/;
const CODIGO_INTERNO_REGEX = /^[0-9\-]+$/;
const CUIT_REGEX = /^\d{2}-\d{8}-\d{1}$/;

function validarCuit(v: string): boolean {
  const s = v.replace(/\s/g, "");
  return CUIT_REGEX.test(s);
}

function formatearCuit(v: string): string {
  const s = v.replace(/\D/g, "");
  if (s.length >= 11) {
    return `${s.slice(0, 2)}-${s.slice(2, 10)}-${s.slice(10, 11)}`;
  }
  if (s.length >= 10) return `${s.slice(0, 2)}-${s.slice(2, 10)}-${s.slice(10)}`;
  if (s.length >= 2) return `${s.slice(0, 2)}-${s.slice(2)}`;
  return s;
}

function urlGoogleMaps(calle: string, numero: number, localidad: string, provincia: string): string {
  const q = encodeURIComponent(`${calle} ${numero}, ${localidad}, ${provincia}, Argentina`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function ClientesClient({
  clientes,
  zonas,
  rol,
  usuarioNombre,
}: {
  clientes: Cliente[];
  zonas: Zona[];
  rol: string;
  usuarioNombre: string;
}) {
  const router = useRouter();
  const canEdit = ["administrador", "auditor"].includes(rol);

  const [modal, setModal] = useState<"nuevo" | "editar" | null>(null);
  const [clienteEdit, setClienteEdit] = useState<Cliente | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formNombreRep, setFormNombreRep] = useState("");
  const [formContacto, setFormContacto] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCodigo, setFormCodigo] = useState("");
  const [formNombre, setFormNombre] = useState("");
  const [formCuit, setFormCuit] = useState("");
  const [formZona, setFormZona] = useState("");
  const [formLocalidad, setFormLocalidad] = useState("");
  const [formProvincia, setFormProvincia] = useState("Córdoba");
  const [formCalle, setFormCalle] = useState("");
  const [formNumero, setFormNumero] = useState<string>("");
  const [formObservaciones, setFormObservaciones] = useState("");
  const [formActivo, setFormActivo] = useState(true);

  const localidadesZona = formZona
    ? (zonas.find((z) => z.id === formZona)?.localidades ?? [])
    : [];

  const refContacto = useRef<HTMLInputElement>(null);
  const refCodigo = useRef<HTMLInputElement>(null);
  const refZona = useRef<HTMLSelectElement>(null);
  const refLocalidad = useRef<HTMLSelectElement>(null);
  const refProvincia = useRef<HTMLSelectElement>(null);
  const refCalle = useRef<HTMLInputElement>(null);

  function abrirNuevo() {
    setFormNombreRep("");
    setFormContacto("+54");
    setFormEmail("");
    setFormCodigo("");
    setFormNombre("");
    setFormCuit("");
    setFormZona("");
    setFormLocalidad("");
    setFormProvincia("Córdoba");
    setFormCalle("");
    setFormNumero("0");
    setFormObservaciones("");
    setFormActivo(true);
    setError(null);
    setClienteEdit(null);
    setModal("nuevo");
  }

  function abrirEditar(c: Cliente) {
    setClienteEdit(c);
    setFormNombreRep(c.nombre_representante ?? "");
    setFormContacto(c.contacto ?? "");
    setFormEmail(c.email ?? "");
    setFormCodigo(c.codigo_interno ?? "");
    setFormNombre(c.nombre ?? "");
    setFormCuit(c.cuit ?? "");
    setFormZona(c.id_zona ?? "");
    setFormLocalidad(c.localidad ?? "");
    setFormProvincia(c.provincia ?? "Córdoba");
    setFormCalle(c.calle ?? "");
    setFormNumero(c.numero != null ? String(c.numero) : "0");
    setFormObservaciones(c.observaciones ?? "");
    setFormActivo(c.activo);
    setError(null);
    setModal("editar");
  }

  function validarForm(): string | null {
    if (!formNombreRep.trim()) return "Nombre representante obligatorio";
    if (formNombreRep.length > 100) return "Nombre representante: máximo 100 caracteres";
    if (!formContacto.trim()) return "Contacto obligatorio";
    if (!E164_REGEX.test(formContacto)) return "Contacto en formato E.164 (ej: +5493511234567)";
    if (!formCodigo.trim()) return "Código interno obligatorio";
    if (!CODIGO_INTERNO_REGEX.test(formCodigo)) return "Código interno: solo números y guiones";
    if (!formNombre.trim()) return "Nombre comercio obligatorio";
    if (formNombre.length > 100) return "Nombre comercio: máximo 100 caracteres";
    if (!formCuit.trim()) return "CUIT obligatorio";
    if (!validarCuit(formCuit)) return "CUIT formato XX-XXXXXXXX-X";
    if (!formCalle.trim()) return "Calle obligatoria";
    if (formCalle.length > 100) return "Calle: máximo 100 caracteres";
    const num = Number(formNumero);
    if (isNaN(num) || !Number.isInteger(num)) return "Número debe ser entero";
    if (formEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) return "Email inválido";
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
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_representante: formNombreRep.trim(),
          contacto: formContacto.trim(),
          email: formEmail.trim() || undefined,
          codigo_interno: formCodigo.trim(),
          nombre: formNombre.trim(),
          cuit: formCuit.replace(/\s/g, ""),
          id_zona: formZona || undefined,
          localidad: formLocalidad || undefined,
          provincia: formProvincia,
          calle: formCalle.trim(),
          numero: parseInt(formNumero, 10) || 0,
          observaciones: formObservaciones.trim() || undefined,
          activo: formActivo,
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
    const err = validarForm();
    if (err) {
      setError(err);
      return;
    }
    if (!confirm("¿Confirmar edición de datos?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clientes/${clienteEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_representante: formNombreRep.trim(),
          contacto: formContacto.trim(),
          email: formEmail.trim() || undefined,
          codigo_interno: formCodigo.trim(),
          nombre: formNombre.trim(),
          cuit: formCuit.replace(/\s/g, ""),
          id_zona: formZona || undefined,
          localidad: formLocalidad || undefined,
          provincia: formProvincia,
          calle: formCalle.trim(),
          numero: parseInt(formNumero, 10) || 0,
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
    if (!confirm("¿Eliminar este cliente? Esta acción no se puede deshacer.")) return;
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

  function handleVerDetalle(c: Cliente) {
    const fecha = c.updated_at || c.created_at;
    const fechaStr = fecha ? new Date(fecha).toLocaleString("es-AR") : "—";
    const contenido = contenidoPdfCliente(
      fechaStr,
      c.nombre_representante ?? "—",
      c.contacto ?? "—",
      c.email ?? "—",
      c.codigo_interno ?? "—",
      c.nombre ?? "—",
      c.cuit ?? "—",
      c.zona_nombre ?? "—",
      c.localidad ?? "—",
      c.provincia ?? "—",
      c.calle ?? "—",
      c.numero ?? 0,
      c.observaciones ?? "—",
      c.activo ? "Activo" : "Inactivo"
    );
    const pie = `${c.usuario_registro ?? usuarioNombre} — Página 1`;
    imprimirComoPdf(`Detalle Cliente - ${c.nombre}`, contenido, pie);
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
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Representante *</label>
        <input
          type="text"
          value={formNombreRep}
          onChange={(e) => setFormNombreRep(e.target.value.slice(0, 100))}
          required
          maxLength={100}
          placeholder="Hasta 100 caracteres"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contacto * (E.164)</label>
        <input
          ref={refContacto}
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
          placeholder="cliente@ejemplo.com"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Código Interno *</label>
        <input
          ref={refCodigo}
          type="text"
          inputMode="numeric"
          value={formCodigo}
          onChange={(e) => setFormCodigo(e.target.value.replace(/[^0-9\-]/g, ""))}
          required
          placeholder="Solo números y guiones (ej: 001-2024)"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Comercio *</label>
        <input
          type="text"
          value={formNombre}
          onChange={(e) => setFormNombre(e.target.value.slice(0, 100))}
          required
          maxLength={100}
          placeholder="Letras, espacios, puntos, guiones, números, acentos"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">CUIT *</label>
        <input
          type="text"
          value={formCuit}
          onChange={(e) => setFormCuit(formatearCuit(e.target.value))}
          required
          placeholder="20-12345678-3"
          maxLength={13}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Zona</label>
        <select
          ref={refZona}
          value={formZona}
          onChange={(e) => {
            setFormZona(e.target.value);
            setFormLocalidad("");
            setTimeout(() => refLocalidad.current?.focus(), 0);
          }}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">— Seleccionar —</option>
          {zonas.map((z) => (
            <option key={z.id} value={z.id}>
              {z.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Localidad/Ciudad</label>
        <select
          ref={refLocalidad}
          value={formLocalidad}
          onChange={(e) => {
            setFormLocalidad(e.target.value);
            setTimeout(() => refProvincia.current?.focus(), 0);
          }}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">— Seleccionar —</option>
          {localidadesZona.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Provincia</label>
        <select
          ref={refProvincia}
          value={formProvincia}
          onChange={(e) => {
            setFormProvincia(e.target.value);
            setTimeout(() => refCalle.current?.focus(), 0);
          }}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          {PROVINCIAS_ARGENTINA.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Calle *</label>
        <input
          ref={refCalle}
          type="text"
          value={formCalle}
          onChange={(e) => setFormCalle(e.target.value.slice(0, 100))}
          required
          maxLength={100}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Número *</label>
        <input
          type="number"
          value={formNumero}
          onChange={(e) => setFormNumero(e.target.value)}
          required
          min={0}
          step={1}
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
          id="activo-form"
          checked={formActivo}
          onChange={(e) => setFormActivo(e.target.checked)}
          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="activo-form" className="text-sm font-medium text-slate-700">
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
          Crear cliente
        </button>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Código</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Cliente</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Contacto</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Ubicación</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Estado</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 px-4 text-center text-slate-500"
                  >
                    No hay clientes. {canEdit && "Creá uno para comenzar."}
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{c.codigo_interno ?? "—"}</td>
                    <td className="py-3 px-4">{c.nombre ?? "—"}</td>
                    <td className="py-3 px-4">{c.contacto ?? "—"}</td>
                    <td className="py-3 px-4">
                      {c.calle && c.numero != null && c.localidad && c.provincia ? (
                        <a
                          href={urlGoogleMaps(
                            c.calle,
                            c.numero,
                            c.localidad,
                            c.provincia
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                          title="Ver en Google Maps"
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
                          c.activo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleVerDetalle(c)}
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
                {modal === "nuevo" ? "Crear cliente" : "Editar cliente"}
              </h2>
              {error && (
                <div className="mt-2 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>
              )}
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
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
