"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PROVINCIAS_ARGENTINA } from "@/data/provinciasArgentina";
import { LOCALIDADES_CORDOBA } from "@/data/localidadesCordoba";
import { imprimirComoPdf, contenidoPdfCliente } from "@/lib/pdfUtils";

type Zona = {
  id: string;
  nombre: string;
  localidades: string[];
};

type Vendedor = {
  id: string;
  nombre: string;
  id_zonas?: string[] | null;
};

type Transportista = {
  id: string;
  nombre: string;
};

type TipoComercio = {
  id: string;
  nombre: string;
  orden?: number;
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
  id_tipo_comercio?: string | null;
  tipo_comercio_nombre?: string | null;
  id_vendedor_frecuente?: string | null;
  id_transportista_frecuente?: string | null;
  zona_nombre?: string | null;
  vendedor_nombre?: string | null;
  transportista_nombre?: string | null;
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

function urlGoogleMaps(localidad: string, provincia: string, calle: string, numero: number): string {
  const direccion = `${localidad}, ${provincia}, ${calle} ${numero}, Argentina`;
  const q = encodeURIComponent(direccion);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function ClientesClient({
  clientes,
  zonas,
  tiposComercio = [],
  vendedores,
  transportistas,
  rol,
  usuarioNombre,
}: {
  clientes: Cliente[];
  zonas: Zona[];
  tiposComercio: TipoComercio[];
  vendedores: Vendedor[];
  transportistas: Transportista[];
  rol: string;
  usuarioNombre: string;
}) {
  const router = useRouter();
  const canEdit = ["administrador", "auditor"].includes(rol);

  const [modal, setModal] = useState<"nuevo" | "editar" | "detalle" | null>(null);
  const [clienteEdit, setClienteEdit] = useState<Cliente | null>(null);
  const [clienteDetalle, setClienteDetalle] = useState<Cliente | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [modalTiposComercio, setModalTiposComercio] = useState(false);
  const [modalZonas, setModalZonas] = useState(false);
  const [modalVendedores, setModalVendedores] = useState(false);
  const [modalTransportistas, setModalTransportistas] = useState(false);
  const [nuevoTipoNombre, setNuevoTipoNombre] = useState("");
  const [nuevoZonaNombre, setNuevoZonaNombre] = useState("");
  const [nuevoZonaLocalidades, setNuevoZonaLocalidades] = useState<string[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [loadingZonas, setLoadingZonas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formNombreRep, setFormNombreRep] = useState("");
  const [formContacto, setFormContacto] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCodigo, setFormCodigo] = useState("");
  const [formNombre, setFormNombre] = useState("");
  const [formCuit, setFormCuit] = useState("");
  const [formZona, setFormZona] = useState("");
  const [formTipoComercio, setFormTipoComercio] = useState("");
  const [formLocalidad, setFormLocalidad] = useState("");
  const [formProvincia, setFormProvincia] = useState("Córdoba");
  const [formCalle, setFormCalle] = useState("");
  const [formNumero, setFormNumero] = useState<string>("");
  const [formVendedor, setFormVendedor] = useState("");
  const [formTransportista, setFormTransportista] = useState("");
  const [formObservaciones, setFormObservaciones] = useState("");
  const [formActivo, setFormActivo] = useState(true);

  const localidadesZona = formZona
    ? (zonas.find((z) => z.id === formZona)?.localidades ?? [])
    : [];

  const vendedoresDeZona = formZona
    ? vendedores.filter((v) => (v.id_zonas ?? []).includes(formZona))
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
    setFormTipoComercio("");
    setFormLocalidad("");
    setFormProvincia("Córdoba");
    setFormCalle("");
    setFormNumero("0");
    setFormVendedor("");
    setFormTransportista("");
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
    setFormVendedor(c.id_vendedor_frecuente ?? "");
    setFormTransportista(c.id_transportista_frecuente ?? "");
    setFormObservaciones(c.observaciones ?? "");
    setFormActivo(c.activo);
    setError(null);
    setModal("editar");
  }

  function validarForm(): string | null {
    if (!formNombre.trim()) return "Nombre comercio obligatorio";
    if (formNombre.length > 100) return "Nombre comercio: máximo 100 caracteres";
    if (!formCuit.trim()) return "CUIT obligatorio";
    if (!validarCuit(formCuit)) return "CUIT formato XX-XXXXXXXX-X";
    if (!formCodigo.trim()) return "Código interno obligatorio";
    if (!CODIGO_INTERNO_REGEX.test(formCodigo)) return "Código interno: solo números y guiones";
    if (!formNombreRep.trim()) return "Nombre representante obligatorio";
    if (formNombreRep.length > 100) return "Nombre representante: máximo 100 caracteres";
    if (!formContacto.trim()) return "Contacto obligatorio";
    if (!E164_REGEX.test(formContacto)) return "Contacto en formato E.164 (ej: +5493511234567)";
    if (!formEmail.trim()) return "Email obligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) return "Email inválido";
    if (!formZona) return "Zona obligatoria";
    if (!formTipoComercio) return "Tipo de comercio obligatorio";
    if (!formLocalidad.trim()) return "Localidad/Ciudad obligatoria";
    if (!formProvincia.trim()) return "Provincia obligatoria";
    if (!formCalle.trim()) return "Calle obligatoria";
    if (formCalle.length > 100) return "Calle: máximo 100 caracteres";
    const num = Number(formNumero);
    if (isNaN(num) || !Number.isInteger(num)) return "Número debe ser entero";
    if (!formVendedor) return "Vendedor frecuente obligatorio";
    if (!formTransportista) return "Transportista frecuente obligatorio";
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
          email: formEmail.trim(),
          codigo_interno: formCodigo.trim(),
          nombre: formNombre.trim(),
          cuit: formCuit.replace(/\s/g, ""),
          id_zona: formZona || undefined,
          id_tipo_comercio: formTipoComercio || undefined,
          localidad: formLocalidad || undefined,
          provincia: formProvincia,
          calle: formCalle.trim(),
          numero: parseInt(formNumero, 10) || 0,
          id_vendedor_frecuente: formVendedor || undefined,
          id_transportista_frecuente: formTransportista || undefined,
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
          email: formEmail.trim(),
          codigo_interno: formCodigo.trim(),
          nombre: formNombre.trim(),
          cuit: formCuit.replace(/\s/g, ""),
          id_zona: formZona || undefined,
          id_tipo_comercio: formTipoComercio || undefined,
          localidad: formLocalidad || undefined,
          provincia: formProvincia,
          calle: formCalle.trim(),
          numero: parseInt(formNumero, 10) || 0,
          id_vendedor_frecuente: formVendedor || undefined,
          id_transportista_frecuente: formTransportista || undefined,
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

  async function handleAgregarTipoComercio() {
    const nombre = nuevoTipoNombre.trim();
    if (!nombre) return;
    setLoadingTipos(true);
    try {
      const res = await fetch("/api/referencias/tipos-comercio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al agregar");
      setNuevoTipoNombre("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agregar tipo");
    } finally {
      setLoadingTipos(false);
    }
  }

  async function handleEliminarTipoComercio(id: string) {
    if (!confirm("¿Eliminar este tipo de comercio?")) return;
    setLoadingTipos(true);
    try {
      const res = await fetch(`/api/referencias/tipos-comercio/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      if (formTipoComercio === id) setFormTipoComercio("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar tipo");
    } finally {
      setLoadingTipos(false);
    }
  }

  const localidadesZonaEnUso = new Set(zonas.flatMap((z) => z.localidades || []));
  function toggleNuevoZonaLocalidad(loc: string) {
    setNuevoZonaLocalidades((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  }
  function puedeSeleccionarLocalidadNueva(loc: string) {
    return !localidadesZonaEnUso.has(loc) || nuevoZonaLocalidades.includes(loc);
  }
  async function handleAgregarZona() {
    const nombre = nuevoZonaNombre.trim();
    if (!nombre) return;
    if (nuevoZonaLocalidades.length === 0) {
      setError("Seleccioná al menos una localidad");
      return;
    }
    setLoadingZonas(true);
    setError(null);
    try {
      const res = await fetch("/api/referencias/zonas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, localidades: nuevoZonaLocalidades }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al agregar");
      setNuevoZonaNombre("");
      setNuevoZonaLocalidades([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agregar zona");
    } finally {
      setLoadingZonas(false);
    }
  }
  async function handleEliminarZona(id: string) {
    if (!confirm("¿Eliminar esta zona?")) return;
    setLoadingZonas(true);
    try {
      const res = await fetch(`/api/referencias/zonas/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      if (formZona === id) setFormZona("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar zona");
    } finally {
      setLoadingZonas(false);
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

  function abrirDetalle(c: Cliente) {
    setClienteDetalle(c);
    setModal("detalle");
  }

  function imprimirPdfCliente(c: Cliente) {
    const fecha = c.updated_at || c.created_at;
    const fechaStr = fecha ? new Date(fecha).toLocaleString("es-AR") : "—";
    const contenido = contenidoPdfCliente(
      fechaStr,
      c.nombre_representante ?? "—",
      c.contacto ?? "—",
      c.email ?? "—",
      c.codigo_interno ?? "—",
      c.nombre ?? "—",
      c.tipo_comercio_nombre ?? "—",
      c.cuit ?? "—",
      c.zona_nombre ?? "—",
      c.localidad ?? "—",
      c.provincia ?? "—",
      c.calle ?? "—",
      c.numero ?? 0,
      c.vendedor_nombre ?? "—",
      c.transportista_nombre ?? "—",
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
        <label className="block text-sm font-medium text-slate-300 mb-1">Fecha de registro</label>
        <input
          type="text"
          value={fechaActual}
          readOnly
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Nombre Comercio *</label>
        <input
          type="text"
          value={formNombre}
          onChange={(e) => setFormNombre(e.target.value.slice(0, 100))}
          required
          maxLength={100}
          placeholder="Letras, espacios, puntos, guiones, números, acentos"
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-slate-300 mb-1 flex-1">Tipo de comercio *</label>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setNuevoTipoNombre("");
                setError(null);
                setModalTiposComercio(true);
              }}
              className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg"
              title="Agregar o eliminar opciones"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={formTipoComercio}
          onChange={(e) => setFormTipoComercio(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">— Seleccionar —</option>
          {tiposComercio.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">CUIT *</label>
        <input
          type="text"
          value={formCuit}
          onChange={(e) => setFormCuit(formatearCuit(e.target.value))}
          required
          placeholder="20-12345678-3"
          maxLength={13}
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Código Interno *</label>
        <input
          ref={refCodigo}
          type="text"
          inputMode="numeric"
          value={formCodigo}
          onChange={(e) => setFormCodigo(e.target.value.replace(/[^0-9\-]/g, ""))}
          required
          placeholder="Solo números y guiones (ej: 001-2024)"
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Nombre Representante *</label>
        <input
          type="text"
          value={formNombreRep}
          onChange={(e) => setFormNombreRep(e.target.value.slice(0, 100))}
          required
          maxLength={100}
          placeholder="Hasta 100 caracteres"
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Contacto * (E.164)</label>
        <input
          ref={refContacto}
          type="tel"
          value={formContacto}
          onChange={(e) => setFormContacto(e.target.value)}
          required
          placeholder="+5493511234567"
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
        <input
          type="email"
          value={formEmail}
          onChange={(e) => setFormEmail(e.target.value)}
          required
          placeholder="cliente@ejemplo.com"
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-slate-300 mb-1 flex-1">Zona *</label>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setNuevoZonaNombre("");
                setNuevoZonaLocalidades([]);
                setError(null);
                setModalZonas(true);
              }}
              className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg"
              title="Agregar o eliminar opciones"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
        <select
          ref={refZona}
          value={formZona}
          onChange={(e) => {
            const nuevaZona = e.target.value;
            setFormZona(nuevaZona);
            setFormLocalidad("");
            const vendedoresNuevaZona = nuevaZona
              ? vendedores.filter((v) => (v.id_zonas ?? []).includes(nuevaZona))
              : [];
            if (formVendedor && !vendedoresNuevaZona.some((v) => v.id === formVendedor)) {
              setFormVendedor("");
            }
            setTimeout(() => refLocalidad.current?.focus(), 0);
          }}
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
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
        <label className="block text-sm font-medium text-slate-300 mb-1">Localidad/Ciudad *</label>
        <select
          ref={refLocalidad}
          value={formLocalidad}
          onChange={(e) => {
            setFormLocalidad(e.target.value);
            setTimeout(() => refProvincia.current?.focus(), 0);
          }}
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
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
        <label className="block text-sm font-medium text-slate-300 mb-1">Provincia *</label>
        <select
          ref={refProvincia}
          value={formProvincia}
          onChange={(e) => {
            setFormProvincia(e.target.value);
            setTimeout(() => refCalle.current?.focus(), 0);
          }}
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          {PROVINCIAS_ARGENTINA.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Calle *</label>
        <input
          ref={refCalle}
          type="text"
          value={formCalle}
          onChange={(e) => setFormCalle(e.target.value.slice(0, 100))}
          required
          maxLength={100}
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Número *</label>
        <input
          type="number"
          value={formNumero}
          onChange={(e) => setFormNumero(e.target.value)}
          required
          min={0}
          step={1}
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-slate-300 mb-1 flex-1">Vendedor frecuente *</label>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setModalVendedores(true);
              }}
              className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg"
              title="Agregar o modificar opciones"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={formVendedor}
          onChange={(e) => setFormVendedor(e.target.value)}
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">
            {formZona ? "— Seleccionar —" : "— Seleccionar zona primero —"}
          </option>
          {modal === "editar" && formVendedor && !vendedoresDeZona.some((v) => v.id === formVendedor) && clienteEdit?.vendedor_nombre && (
            <option value={formVendedor}>{clienteEdit.vendedor_nombre}</option>
          )}
          {vendedoresDeZona.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-slate-300 mb-1 flex-1">Transportista frecuente *</label>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setModalTransportistas(true);
              }}
              className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg"
              title="Agregar o modificar opciones"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={formTransportista}
          onChange={(e) => setFormTransportista(e.target.value)}
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">— Seleccionar —</option>
          {modal === "editar" && formTransportista && !transportistas.some((t) => t.id === formTransportista) && clienteEdit?.transportista_nombre && (
            <option value={formTransportista}>{clienteEdit.transportista_nombre}</option>
          )}
          {transportistas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
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
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="activo-form"
          checked={formActivo}
          onChange={(e) => setFormActivo(e.target.checked)}
          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="activo-form" className="text-sm font-medium text-slate-300">
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

      <div className="bg-slate-850 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-200">Código</th>
                <th className="text-left py-3 px-4 font-medium text-slate-200">Cliente</th>
                <th className="text-left py-3 px-4 font-medium text-slate-200">Contacto</th>
                <th className="text-left py-3 px-4 font-medium text-slate-200">Ubicación</th>
                <th className="text-left py-3 px-4 font-medium text-slate-200">Estado</th>
                <th className="text-right py-3 px-4 font-medium text-slate-200">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 px-4 text-center text-slate-400"
                  >
                    No hay clientes. {canEdit && "Creá uno para comenzar."}
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 font-medium text-slate-200">{c.codigo_interno ?? "—"}</td>
                    <td className="py-3 px-4 text-slate-300">{c.nombre ?? "—"}</td>
                    <td className="py-3 px-4 text-slate-300">{c.contacto ?? "—"}</td>
                    <td className="py-3 px-4">
                      {c.calle && c.numero != null && c.localidad && c.provincia ? (
                        <a
                          href={urlGoogleMaps(
                            c.localidad,
                            c.provincia,
                            c.calle,
                            c.numero
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.preventDefault();
                            const url = urlGoogleMaps(c.localidad!, c.provincia!, c.calle!, c.numero!);
                            const w = window.open(url, "_blank", "noopener,noreferrer");
                            if (!w) window.location.href = url;
                          }}
                          className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 hover:underline cursor-pointer"
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
                          c.activo ? "bg-green-900/50 text-green-300" : "bg-slate-700 text-slate-400"
                        }`}
                      >
                        {c.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => abrirDetalle(c)}
                        className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-primary-900/40 rounded"
                        title="Ver detalles"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
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
          <div className="bg-slate-850 rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[85vh] border border-slate-700">
            <div className="flex-shrink-0 px-6 pt-6 pb-2">
              <h2 className="text-lg font-semibold text-slate-200">
                {modal === "nuevo" ? "Crear cliente" : "Editar cliente"}
              </h2>
              {error && (
                <div className="mt-2 p-2 rounded bg-red-900/50 text-red-300 text-sm">{error}</div>
              )}
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 min-h-0">
                {formContent}
              </div>
              <div className="flex-shrink-0 flex gap-2 justify-end px-6 py-4 border-t border-slate-700 bg-slate-800 rounded-b-xl">
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

      {/* Modal Detalle de cliente */}
      {modal === "detalle" && clienteDetalle && (() => {
        const c = clienteDetalle;
        const tieneUbicacion = c.calle && c.numero != null && c.localidad && c.provincia;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModal(null)}>
            <div className="bg-slate-850 rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-slate-700 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex-shrink-0 px-6 py-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-slate-200">Detalle de cliente</h2>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {tieneUbicacion && (
                    <a
                      href={urlGoogleMaps(c.localidad!, c.provincia!, c.calle!, c.numero!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.preventDefault();
                        const url = urlGoogleMaps(c.localidad!, c.provincia!, c.calle!, c.numero!);
                        const w = window.open(url, "_blank", "noopener,noreferrer");
                        if (!w) window.location.href = url;
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg text-sm"
                      title="Ver ubicación"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Ubicación
                    </a>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => {
                        setModal(null);
                        abrirEditar(c);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg text-sm"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Editar
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => {
                        setModal(null);
                        setDeleteConfirm(c.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-400 hover:text-red-400 hover:bg-red-900/40 rounded-lg text-sm"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  )}
                  <button
                    onClick={() => imprimirPdfCliente(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg text-sm"
                    title="Ver detalle (PDF)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF
                  </button>
                  <button
                    onClick={() => setModal(null)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                    aria-label="Cerrar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                <section>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Datos del cliente</h3>
                  <dl className="space-y-2 text-sm">
                    <div><dt className="text-slate-500 inline">Nombre comercio:</dt> <dd className="text-slate-200 inline ml-1">{c.nombre ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Nombre representante:</dt> <dd className="text-slate-200 inline ml-1">{c.nombre_representante ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Contacto:</dt> <dd className="text-slate-200 inline ml-1">{c.contacto ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Email:</dt> <dd className="text-slate-200 inline ml-1">{c.email ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Código interno:</dt> <dd className="text-slate-200 inline ml-1">{c.codigo_interno ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">CUIT:</dt> <dd className="text-slate-200 inline ml-1">{c.cuit ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Tipo de comercio:</dt> <dd className="text-slate-200 inline ml-1">{c.tipo_comercio_nombre ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Zona:</dt> <dd className="text-slate-200 inline ml-1">{c.zona_nombre ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Localidad/Ciudad:</dt> <dd className="text-slate-200 inline ml-1">{c.localidad ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Provincia:</dt> <dd className="text-slate-200 inline ml-1">{c.provincia ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Calle:</dt> <dd className="text-slate-200 inline ml-1">{c.calle ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Número:</dt> <dd className="text-slate-200 inline ml-1">{c.numero ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Vendedor frecuente:</dt> <dd className="text-slate-200 inline ml-1">{c.vendedor_nombre ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Transportista frecuente:</dt> <dd className="text-slate-200 inline ml-1">{c.transportista_nombre ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Observaciones:</dt> <dd className="text-slate-200 inline ml-1">{c.observaciones ?? "—"}</dd></div>
                    <div><dt className="text-slate-500 inline">Estado:</dt> <dd className="text-slate-200 inline ml-1">{c.activo ? "Activo" : "Inactivo"}</dd></div>
                  </dl>
                </section>
              </div>
            </div>
          </div>
        );
      })()}

      {modalTiposComercio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Gestionar tipos de comercio</h2>
            {error && (
              <div className="mb-3 p-2 rounded bg-red-900/50 text-red-300 text-sm">{error}</div>
            )}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={nuevoTipoNombre}
                onChange={(e) => setNuevoTipoNombre(e.target.value)}
                placeholder="Nuevo tipo (ej: Minorista)"
                maxLength={100}
                className="flex-1 px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAgregarTipoComercio())}
              />
              <button
                type="button"
                onClick={handleAgregarTipoComercio}
                disabled={loadingTipos || !nuevoTipoNombre.trim()}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto mb-4">
              {tiposComercio.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between py-2 px-3 bg-slate-800 rounded-lg"
                >
                  <span className="text-slate-200">{t.nombre}</span>
                  <button
                    type="button"
                    onClick={() => handleEliminarTipoComercio(t.id)}
                    disabled={loadingTipos}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/40 rounded"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
            {tiposComercio.length === 0 && (
              <p className="text-slate-400 text-sm mb-4">No hay tipos. Agregá uno arriba.</p>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setModalTiposComercio(false);
                  setError(null);
                }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalZonas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-slate-700 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Gestionar zonas</h2>
            {error && (
              <div className="mb-3 p-2 rounded bg-red-900/50 text-red-300 text-sm">{error}</div>
            )}
            <div className="space-y-3 mb-4 flex-shrink-0">
              <input
                type="text"
                value={nuevoZonaNombre}
                onChange={(e) => setNuevoZonaNombre(e.target.value)}
                placeholder="Nombre de zona (ej: Zona Norte)"
                maxLength={100}
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <div className="max-h-36 overflow-y-auto border border-slate-600 rounded-lg p-2 space-y-1 bg-slate-800">
                <p className="text-xs text-slate-400 mb-1">Localidades (al menos una)</p>
                {LOCALIDADES_CORDOBA.map((loc) => {
                  const disabled = !puedeSeleccionarLocalidadNueva(loc);
                  const checked = nuevoZonaLocalidades.includes(loc);
                  return (
                    <label
                      key={loc}
                      className={`flex items-center gap-2 cursor-pointer text-sm ${disabled && !checked ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => !disabled && toggleNuevoZonaLocalidad(loc)}
                        disabled={disabled && !checked}
                        className="rounded border-slate-300 text-primary-600"
                      />
                      <span className="text-slate-200">{loc}</span>
                    </label>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleAgregarZona}
                disabled={loadingZonas || !nuevoZonaNombre.trim() || nuevoZonaLocalidades.length === 0}
                className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50"
              >
                {loadingZonas ? "Guardando..." : "Agregar zona"}
              </button>
            </div>
            <ul className="space-y-2 overflow-y-auto flex-1 min-h-0 mb-4">
              {zonas.map((z) => (
                <li
                  key={z.id}
                  className="flex items-center justify-between py-2 px-3 bg-slate-800 rounded-lg flex-shrink-0"
                >
                  <span className="text-slate-200">{z.nombre}</span>
                  <button
                    type="button"
                    onClick={() => handleEliminarZona(z.id)}
                    disabled={loadingZonas}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/40 rounded"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
            {zonas.length === 0 && (
              <p className="text-slate-400 text-sm mb-4">No hay zonas. Agregá una arriba.</p>
            )}
            <div className="flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setModalZonas(false);
                  setError(null);
                  router.refresh();
                }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalVendedores && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-2">Gestionar vendedores</h2>
            <p className="text-slate-300 text-sm mb-4">
              Los vendedores se gestionan en la página dedicada. Los cambios que hagas allí se verán en este listado y en la página Vendedores.
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              <a
                href="/vendedores"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium"
              >
                Abrir página Vendedores
              </a>
              <button
                type="button"
                onClick={() => {
                  setModalVendedores(false);
                  router.refresh();
                }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalTransportistas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-2">Gestionar transportistas</h2>
            <p className="text-slate-300 text-sm mb-4">
              Los transportistas se gestionan en la página dedicada. Los cambios que hagas allí se verán en este listado y en la página Transportistas.
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              <a
                href="/transportistas"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium"
              >
                Abrir página Transportistas
              </a>
              <button
                type="button"
                onClick={() => {
                  setModalTransportistas(false);
                  router.refresh();
                }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200">¿Eliminar cliente?</h2>
            <p className="mt-2 text-slate-300">
              Esta acción no se puede deshacer. Se eliminará el cliente y sus datos asociados.
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
