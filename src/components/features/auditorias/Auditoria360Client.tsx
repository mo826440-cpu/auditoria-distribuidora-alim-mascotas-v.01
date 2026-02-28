"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SECCIONES_EVALUACION,
  TODAS_LAS_CLAVES_EVALUACION,
  puntajeMaximo,
  estrellasDesdePuntaje,
} from "@/data/evaluacionCriterios";
import {
  SECCIONES_ENCUESTA,
  TODAS_LAS_CLAVES_ENCUESTA,
  PUNTAJE_MAXIMO_ENCUESTA,
  PREGUNTAS_CLAVE,
  estrellasDesdePuntajeSatisfaccion,
} from "@/data/encuestaSatisfaccionCriterios";

type Cliente = { id: string; nombre: string; id_transportista_frecuente?: string | null; tipo_comercio_nombre?: string | null };
type Vendedor = { id: string; nombre: string };
type Visita = { id: string; fecha_visita: string; id_cliente?: string; id_vendedor?: string; hora_inicio?: string | null; hora_fin?: string | null };
type Transportista = { id: string; nombre: string };

function toTimeInput(t: string | null | undefined): string {
  if (!t) return "";
  if (t.length <= 5) return t;
  return t.slice(0, 5);
}

const PONDERACIONES_DEFAULT = [20, 20, 20, 20, 20];
const PONDERACIONES_ENCUESTA_DEFAULT = [20, 20, 20, 20, 20];

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
  const [formHoraInicio, setFormHoraInicio] = useState("");
  const [formHoraFin, setFormHoraFin] = useState("");
  const [formObservaciones, setFormObservaciones] = useState("");
  const [formAnalisisFinal, setFormAnalisisFinal] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(!!idAuditoria);
  const [error, setError] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<Record<string, number | "">>({});
  const [formPonderaciones, setFormPonderaciones] = useState<number[]>(() => [...PONDERACIONES_DEFAULT]);
  const [modalPonderaciones, setModalPonderaciones] = useState(false);
  const [editPonderaciones, setEditPonderaciones] = useState<number[]>([...PONDERACIONES_DEFAULT]);
  const [errorPonderaciones, setErrorPonderaciones] = useState<string | null>(null);
  const [openEncuesta, setOpenEncuesta] = useState(false);
  const [openEvaluacion, setOpenEvaluacion] = useState(false);
  const [formEncuesta, setFormEncuesta] = useState<Record<string, number | "">>({});
  const [formPreguntasClave, setFormPreguntasClave] = useState<Record<string, string>>({
    pregunta_clave_mejorar: "",
    pregunta_clave_productos_agregar: "",
    pregunta_clave_problema_reciente: "",
    pregunta_clave_otra_distribuidora: "",
  });
  const [formAnalisisEncuesta, setFormAnalisisEncuesta] = useState("");
  const [formPonderacionesEncuesta, setFormPonderacionesEncuesta] = useState<number[]>(() => [...PONDERACIONES_ENCUESTA_DEFAULT]);
  const [modalPonderacionesEncuesta, setModalPonderacionesEncuesta] = useState(false);
  const [editPonderacionesEncuesta, setEditPonderacionesEncuesta] = useState<number[]>([...PONDERACIONES_ENCUESTA_DEFAULT]);
  const [errorPonderacionesEncuesta, setErrorPonderacionesEncuesta] = useState<string | null>(null);
  const [promptGenerado, setPromptGenerado] = useState<string | null>(null);
  const [tipoPromptGenerado, setTipoPromptGenerado] = useState<"encuesta" | "evaluacion" | null>(null);
  const [modalGuardarParcial, setModalGuardarParcial] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const datosSoloLectura = false;
  const datosAuditoriaSoloLectura = !!idAuditoria || !!desdeVisita;

  useEffect(() => {
    if (desdeVisita) {
      setFormCliente(desdeVisita.id_cliente);
      setFormVendedor(desdeVisita.id_vendedor);
      setFormVisita(desdeVisita.id_visita);
      const cli = clientes.find((c) => c.id === desdeVisita.id_cliente);
      setFormTransportista(cli?.id_transportista_frecuente ?? "");
      const v = visitas.find((x) => x.id === desdeVisita.id_visita);
      if (v?.fecha_visita) setFormFecha(v.fecha_visita.slice(0, 10));
      setFormHoraInicio(toTimeInput((v as { hora_inicio?: string })?.hora_inicio) || "");
      setFormHoraFin(toTimeInput((v as { hora_fin?: string })?.hora_fin) || "");
    } else if (!idAuditoria) {
      setFormFecha(new Date().toISOString().slice(0, 10));
    }
  }, [desdeVisita, clientes, visitas, idAuditoria]);

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
          setFormAnalisisFinal(data.analisis_final ?? "");
          setFormHoraInicio(toTimeInput(data.hora_inicio) || "");
          setFormHoraFin(toTimeInput(data.hora_fin) || "");
          const vals: Record<string, number | ""> = {};
          for (const key of TODAS_LAS_CLAVES_EVALUACION) {
            const v = data[key];
            vals[key] = typeof v === "number" && v >= 1 && v <= 3 ? v : "";
          }
          setFormValues(vals);
          if (Array.isArray(data.ponderaciones) && (data.ponderaciones.length === 5 || data.ponderaciones.length === 6) && data.ponderaciones.every((n: unknown) => typeof n === "number" && n >= 0 && n <= 100)) {
            const pond = data.ponderaciones as number[];
            setFormPonderaciones(pond.length === 5 ? pond : [20, 20, 20, 20, 20]);
          }
          const encuestaVals: Record<string, number | ""> = {};
          for (const key of TODAS_LAS_CLAVES_ENCUESTA) {
            const v = data[key];
            encuestaVals[key] = typeof v === "number" && v >= 1 && v <= 3 ? v : "";
          }
          setFormEncuesta(encuestaVals);
          if (Array.isArray(data.ponderaciones_encuesta) && data.ponderaciones_encuesta.length === 5 && data.ponderaciones_encuesta.every((n: unknown) => typeof n === "number" && n >= 0 && n <= 100)) {
            setFormPonderacionesEncuesta(data.ponderaciones_encuesta as number[]);
          }
          setFormPreguntasClave({
            pregunta_clave_mejorar: (data.pregunta_clave_mejorar as string) ?? "",
            pregunta_clave_productos_agregar: (data.pregunta_clave_productos_agregar as string) ?? "",
            pregunta_clave_problema_reciente: (data.pregunta_clave_problema_reciente as string) ?? "",
            pregunta_clave_otra_distribuidora: (data.pregunta_clave_otra_distribuidora as string) ?? "",
          });
          setFormAnalisisEncuesta((data.analisis_encuesta_satisfaccion as string) ?? "");
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar"))
        .finally(() => setLoadingAudit(false));
    }
  }, [idAuditoria]);

  useEffect(() => {
    if (formVisita && !idAuditoria) {
      const v = visitas.find((x) => x.id === formVisita);
      if (v?.fecha_visita) setFormFecha(v.fecha_visita.slice(0, 10));
      setFormHoraInicio(toTimeInput((v as { hora_inicio?: string })?.hora_inicio) || formHoraInicio);
      setFormHoraFin(toTimeInput((v as { hora_fin?: string })?.hora_fin) || formHoraFin);
    }
  }, [formVisita, visitas, idAuditoria]);

  const setCampo = useCallback((key: string, value: number | "") => {
    scrollRef.current = window.scrollY;
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setCampoEncuesta = useCallback((key: string, value: number | "") => {
    setFormEncuesta((prev) => ({ ...prev, [key]: value }));
  }, []);

  function getCampoEncuesta(key: string): number | "" {
    return formEncuesta[key] ?? "";
  }

  const puntajeSatisfaccion = TODAS_LAS_CLAVES_ENCUESTA.reduce((sum, key) => {
    const v = formEncuesta[key];
    return sum + (typeof v === "number" && v >= 1 && v <= 3 ? v : 0);
  }, 0);

  const totalesPorSeccionEncuesta = SECCIONES_ENCUESTA.map((seccion) =>
    seccion.criterios.reduce((s, c) => { const v = formEncuesta[c.key]; return s + (typeof v === "number" ? v : 0); }, 0)
  );
  const maxPorSeccionEncuesta = SECCIONES_ENCUESTA.map((s) => s.criterios.length * 3);

  const weightedRatioEncuesta = PUNTAJE_MAXIMO_ENCUESTA > 0
    ? totalesPorSeccionEncuesta.reduce((acc, total, i) => {
        const ratioSeccion = maxPorSeccionEncuesta[i] > 0 ? total / maxPorSeccionEncuesta[i] : 0;
        const peso = (formPonderacionesEncuesta[i] ?? 0) / 100;
        return acc + ratioSeccion * peso;
      }, 0)
    : 0;
  const puntajePonderadoEncuesta = Math.round(weightedRatioEncuesta * PUNTAJE_MAXIMO_ENCUESTA);

  const encuestaTieneDatos = totalesPorSeccionEncuesta.some((t) => t > 0);

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

  const totalesPorSeccion = SECCIONES_EVALUACION.map((seccion) =>
    seccion.criterios.reduce((sum, c) => {
      const v = getCampo(c.key);
      return sum + (typeof v === "number" && v >= 1 && v <= 3 ? v : 0);
    }, 0)
  );
  const maxPorSeccion = SECCIONES_EVALUACION.map((s) => s.criterios.length * 3);
  const maxPuntos = puntajeMaximo();
  const weightedRatio = maxPuntos > 0
    ? totalesPorSeccion.reduce((acc, total, i) => {
        const ratioSeccion = maxPorSeccion[i] > 0 ? total / maxPorSeccion[i] : 0;
        const peso = (formPonderaciones[i] ?? 0) / 100;
        return acc + ratioSeccion * peso;
      }, 0)
    : 0;
  const puntajeFinal = Math.round(weightedRatio * maxPuntos);
  const estrellas = estrellasDesdePuntaje(puntajeFinal);

  const todosLosCamposCargados = TODAS_LAS_CLAVES_EVALUACION.every(
    (key) => typeof formValues[key] === "number" && formValues[key] >= 1 && formValues[key] <= 3
  );
  const encuestaCompleta = TODAS_LAS_CLAVES_ENCUESTA.every(
    (key) => typeof formEncuesta[key] === "number" && formEncuesta[key] >= 1 && formEncuesta[key] <= 3
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
      hora_inicio: formHoraInicio ? formHoraInicio + (formHoraInicio.length === 5 ? ":00" : "") : null,
      hora_fin: formHoraFin ? formHoraFin + (formHoraFin.length === 5 ? ":00" : "") : null,
      analisis_final: formAnalisisFinal.trim() || null,
      puntaje_final: puntajeFinal || null,
      ponderaciones: formPonderaciones,
    };
    for (const key of TODAS_LAS_CLAVES_EVALUACION) {
      const v = formValues[key];
      if (typeof v === "number" && v >= 1 && v <= 3) payload[key] = v;
    }
    for (const key of TODAS_LAS_CLAVES_ENCUESTA) {
      const v = formEncuesta[key];
      if (typeof v === "number" && v >= 1 && v <= 3) payload[key] = v;
    }
    payload.puntaje_satisfaccion = puntajeSatisfaccion || null;
    payload.analisis_encuesta_satisfaccion = formAnalisisEncuesta.trim() || null;
    payload.ponderaciones_encuesta = formPonderacionesEncuesta;
    payload.pregunta_clave_mejorar = formPreguntasClave.pregunta_clave_mejorar?.trim() || null;
    payload.pregunta_clave_productos_agregar = formPreguntasClave.pregunta_clave_productos_agregar?.trim() || null;
    payload.pregunta_clave_problema_reciente = formPreguntasClave.pregunta_clave_problema_reciente?.trim() || null;
    payload.pregunta_clave_otra_distribuidora = formPreguntasClave.pregunta_clave_otra_distribuidora?.trim() || null;
    return payload;
  }

  function buildPromptEncuesta(): string {
    const clienteNombre = clientes.find((c) => c.id === formCliente)?.nombre ?? "—";
    const vendedorNombre = vendedores.find((v) => v.id === formVendedor)?.nombre ?? "—";
    const lineas: string[] = [
      "DATOS DE LA AUDITORÍA",
      `Cliente: ${clienteNombre}`,
      `Vendedor: ${vendedorNombre}`,
      `Fecha: ${formFecha || "—"}`,
      `Observaciones generales: ${formObservaciones.trim() || "—"}`,
      "",
      "ENCUESTA DE SATISFACCIÓN DEL CLIENTE (detalle por criterio)",
    ];
    SECCIONES_ENCUESTA.forEach((seccion, i) => {
      lineas.push("");
      lineas.push(`${seccion.titulo} (ponderación ${formPonderacionesEncuesta[i] ?? 20}%)`);
      seccion.criterios.forEach((c) => {
        const v = formEncuesta[c.key];
        const puntaje = typeof v === "number" && v >= 1 && v <= 3 ? v : "—";
        lineas.push(`  - ${c.label}: ${c.descripcion} → ${puntaje}/3`);
      });
      const total = seccion.criterios.reduce((s, c) => { const val = formEncuesta[c.key]; return s + (typeof val === "number" ? val : 0); }, 0);
      const max = seccion.criterios.length * 3;
      lineas.push(`  Total sección: ${total}/${max}`);
    });
    lineas.push("");
    lineas.push(`Puntaje total encuesta: ${puntajeSatisfaccion} / ${PUNTAJE_MAXIMO_ENCUESTA}`);
    lineas.push("");
    lineas.push("Preguntas clave:");
    PREGUNTAS_CLAVE.forEach((p) => lineas.push(`- ${p.label}: ${formPreguntasClave[p.key] || "—"}`));
    lineas.push("");
    lineas.push("---");
    lineas.push("INSTRUCCIÓN: Basándote en los datos anteriores (cada criterio y su puntuación), generá un análisis FODA de la encuesta de satisfacción del cliente (Fortalezas, Debilidades, Oportunidades, Amenazas) e incluyendo recomendaciones de mejora. Responde en español, claro y concreto.");
    return lineas.join("\n");
  }

  function buildPromptEvaluacion(): string {
    const clienteNombre = clientes.find((c) => c.id === formCliente)?.nombre ?? "—";
    const vendedorNombre = vendedores.find((v) => v.id === formVendedor)?.nombre ?? "—";
    const lineas: string[] = [
      "DATOS DE LA AUDITORÍA",
      `Cliente: ${clienteNombre}`,
      `Vendedor: ${vendedorNombre}`,
      `Fecha: ${formFecha || "—"}`,
      `Observaciones generales: ${formObservaciones.trim() || "—"}`,
      "",
      "EVALUACIÓN DEL CLIENTE (detalle por criterio)",
    ];
    SECCIONES_EVALUACION.forEach((seccion, i) => {
      lineas.push("");
      lineas.push(`${seccion.titulo} (ponderación ${formPonderaciones[i] ?? 20}%)`);
      seccion.criterios.forEach((c) => {
        const v = formValues[c.key];
        const puntaje = typeof v === "number" && v >= 1 && v <= 3 ? v : "—";
        lineas.push(`  - ${c.label}: ${c.descripcion} → ${puntaje}/3`);
      });
      const total = seccion.criterios.reduce((s, c) => { const val = formValues[c.key]; return s + (typeof val === "number" ? val : 0); }, 0);
      const max = seccion.criterios.length * 3;
      lineas.push(`  Total sección: ${total}/${max}`);
    });
    lineas.push("");
    lineas.push(`Puntaje final evaluación: ${puntajeFinal} / ${maxPuntos}`);
    lineas.push("");
    lineas.push("---");
    lineas.push("INSTRUCCIÓN: Basándote en los datos anteriores (cada criterio y su puntuación), generá un análisis final FODA de la evaluación del cliente (Fortalezas, Debilidades, Oportunidades, Amenazas) con recomendaciones de mejora para la relación comercial. Responde en español, claro y concreto.");
    return lineas.join("\n");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!formCliente || !formVendedor || !formFecha) {
      setError("Cliente, vendedor y fecha son obligatorios.");
      return;
    }
    const datosCompletos = encuestaCompleta && todosLosCamposCargados;
    if (!datosCompletos) {
      setModalGuardarParcial(true);
      return;
    }
    if (!idAuditoria && !window.confirm("¿Está de acuerdo en cerrar la auditoría? Se registrarán todos los datos y la visita pasará a estado Realizada.")) {
      return;
    }
    await doSave(false);
  }

  async function doSave(asParcial: boolean) {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const estado = asParcial ? "parcial" : (encuestaCompleta && todosLosCamposCargados ? "completa" : "parcial");
      const payload = { ...buildPayload(), estado_auditoria: estado };
      if (idAuditoria) {
        const res = await fetch(`/api/auditorias/${idAuditoria}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { error?: string }).error || `Error ${res.status}`);
        if (asParcial) {
          setModalGuardarParcial(false);
          setSuccessMessage("Guardado como parcial. Podés seguir completando y guardar de nuevo.");
          if (formVisita) {
            const patchRes = await fetch(`/api/visitas/${formVisita}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ estado: "parcial" }),
            });
            if (!patchRes.ok) {
              const patchData = await patchRes.json().catch(() => ({}));
              setError((patchData as { error?: string }).error || "No se pudo actualizar la visita.");
            }
          }
        } else {
          if (formVisita) {
            const patchRes = await fetch(`/api/visitas/${formVisita}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ estado: "realizada" }),
            });
            if (!patchRes.ok) {
              const patchData = await patchRes.json().catch(() => ({}));
              throw new Error((patchData as { error?: string }).error || "No se pudo actualizar la visita a Realizada.");
            }
          }
          router.push("/auditorias");
          router.refresh();
        }
      } else {
        const res = await fetch("/api/auditorias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({})) as { error?: string; id?: string };
        if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
        if (asParcial && data.id) {
          setModalGuardarParcial(false);
          if (formVisita) {
            const patchRes = await fetch(`/api/visitas/${formVisita}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ estado: "parcial" }),
            });
            if (!patchRes.ok) {
              const patchData = await patchRes.json().catch(() => ({}));
              setError((patchData as { error?: string }).error || "No se pudo actualizar la visita.");
            }
          }
          if (typeof sessionStorage !== "undefined") sessionStorage.setItem("auditoria_parcial_guardada", "1");
          router.push(`/auditorias/nueva?id=${data.id}`);
          router.refresh();
        } else if (!asParcial) {
          if (formVisita) {
            const patchRes = await fetch(`/api/visitas/${formVisita}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ estado: "realizada" }),
            });
            if (!patchRes.ok) {
              const patchData = await patchRes.json().catch(() => ({}));
              throw new Error((patchData as { error?: string }).error || "No se pudo actualizar la visita a Realizada.");
            }
          }
          router.push("/auditorias");
          router.refresh();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar auditoría");
    } finally {
      setLoading(false);
    }
  }

  const alMenosUnCriterioMarcado = TODAS_LAS_CLAVES_EVALUACION.some(
    (key) => typeof formValues[key] === "number" && formValues[key] >= 1 && formValues[key] <= 3
  );
  const alMenosUnCriterioEncuesta = TODAS_LAS_CLAVES_ENCUESTA.some(
    (key) => typeof formEncuesta[key] === "number" && formEncuesta[key] >= 1 && formEncuesta[key] <= 3
  );

  useEffect(() => {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("auditoria_parcial_guardada")) {
      sessionStorage.removeItem("auditoria_parcial_guardada");
      setSuccessMessage("Guardado como parcial. Podés seguir completando y guardar de nuevo.");
    }
  }, []);

  if (loadingAudit) {
    return (
      <div className="mt-6 p-8 text-center text-slate-400">
        Cargando auditoría...
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Header con íconos */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div />
        <div className="flex flex-wrap items-center gap-2">
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
          <Link
            href="/auditorias/descripcion"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg text-sm"
            title="Ver descripción de evaluación"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descripción de evaluación
          </Link>
          <button
            type="button"
            onClick={() => {
              const fechaStr = new Date().toISOString().slice(0, 10);
              const titulo = `Auditoría - ${clientes.find((c) => c.id === formCliente)?.nombre ?? "—"} - ${fechaStr}`;
              window.print();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg text-sm"
            title="Descargar / imprimir auditoría (PDF)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-3 rounded-lg bg-red-900/50 border border-red-800 text-red-300 text-sm font-medium">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-3 rounded-lg bg-green-900/50 border border-green-800 text-green-300 text-sm font-medium">
            {successMessage}
          </div>
        )}

        {/* Datos de la Auditoría */}
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-200">Datos de la Auditoría</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {datosAuditoriaSoloLectura ? (
              <>
                <div><span className="text-xs text-slate-500 block mb-0.5">Fecha</span><span className="text-slate-200 font-medium py-2 block">{formFecha ? new Date(formFecha + "T12:00:00").toLocaleDateString("es-AR") : "—"}</span></div>
                <div><span className="text-xs text-slate-500 block mb-0.5">Hora inicio</span><span className="text-slate-200 font-medium py-2 block">{formHoraInicio || "—"}</span></div>
                <div><span className="text-xs text-slate-500 block mb-0.5">Hora fin</span><span className="text-slate-200 font-medium py-2 block">{formHoraFin || "—"}</span></div>
                <div><span className="text-xs text-slate-500 block mb-0.5">Cliente</span><span className="text-slate-200 font-medium py-2 block">{clientes.find((c) => c.id === formCliente)?.nombre ?? "—"}</span></div>
                <div><span className="text-xs text-slate-500 block mb-0.5">Vendedor</span><span className="text-slate-200 font-medium py-2 block">{vendedores.find((v) => v.id === formVendedor)?.nombre ?? "—"}</span></div>
                <div><span className="text-xs text-slate-500 block mb-0.5">Transportista</span><span className="text-slate-200 font-medium py-2 block">{formTransportista ? transportistas.find((t) => t.id === formTransportista)?.nombre ?? "—" : "Ninguno"}</span></div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Cliente *</label>
                  <select value={formCliente} onChange={(e) => { const v = e.target.value; setFormCliente(v); const c = clientes.find((x) => x.id === v); setFormTransportista(c?.id_transportista_frecuente ?? ""); }} required className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">Seleccionar</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Vendedor *</label>
                  <select value={formVendedor} onChange={(e) => setFormVendedor(e.target.value)} required className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">Seleccionar</option>
                    {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Transportista</label>
                  <select value={formTransportista} onChange={(e) => setFormTransportista(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">Ninguno</option>
                    {transportistas.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Fecha *</label>
                  <input type="date" value={formFecha} onChange={(e) => setFormFecha(e.target.value)} required className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Hora inicio</label>
                  <input type="time" value={formHoraInicio} onChange={(e) => setFormHoraInicio(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Hora fin</label>
                  <input type="time" value={formHoraFin} onChange={(e) => setFormHoraFin(e.target.value)} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Visita programada</label>
                  <select value={formVisita} onChange={(e) => { const v = e.target.value; setFormVisita(v); const vis = visitas.find((x) => x.id === v); if (vis?.fecha_visita) setFormFecha(vis.fecha_visita.slice(0, 10)); if (vis?.id_cliente) { setFormCliente(vis.id_cliente); const c = clientes.find((x) => x.id === vis.id_cliente); setFormTransportista(c?.id_transportista_frecuente ?? ""); } if (vis?.id_vendedor) setFormVendedor(vis.id_vendedor); setFormHoraInicio(toTimeInput((vis as { hora_inicio?: string })?.hora_inicio) || ""); setFormHoraFin(toTimeInput((vis as { hora_fin?: string })?.hora_fin) || ""); }} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">Ninguna</option>
                    {visitas.map((v) => <option key={v.id} value={v.id}>{new Date(v.fecha_visita + "T12:00:00").toLocaleDateString("es-AR")} — {clientes.find((c) => c.id === v.id_cliente)?.nombre ?? "—"}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Observaciones generales</label>
            {datosAuditoriaSoloLectura ? <div className="py-2 text-slate-200 whitespace-pre-wrap">{formObservaciones || "—"}</div> : <textarea value={formObservaciones} onChange={(e) => setFormObservaciones(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Observaciones..." />}
          </div>
        </div>

        {/* Sección colapsable: ENCUESTA DE SATISFACCIÓN DEL CLIENTE */}
        <div className="rounded-xl border border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenEncuesta((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-left"
          >
            <span className="text-base font-semibold text-slate-200">ENCUESTA DE SATISFACCIÓN DEL CLIENTE</span>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${openEncuesta ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openEncuesta && (
            <div className="bg-slate-850 border-t border-slate-700 p-6 space-y-8">
              {/* Ponderación por sesión (encuesta) - igual que evaluación */}
              <div className="bg-slate-850 rounded-xl border border-slate-700 p-6">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-slate-400">Ponderación por sesión</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditPonderacionesEncuesta([...formPonderacionesEncuesta]);
                      setErrorPonderacionesEncuesta(null);
                      setModalPonderacionesEncuesta(true);
                    }}
                    className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg shrink-0"
                    title="Modificar ponderación encuesta"
                    aria-label="Modificar ponderación encuesta"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                  {SECCIONES_ENCUESTA.map((seccion, i) => {
                    const total = seccion.criterios.reduce((s, c) => { const v = formEncuesta[c.key]; return s + (typeof v === "number" ? v : 0); }, 0);
                    const max = seccion.criterios.length * 3;
                    return (
                      <div key={seccion.id} className="flex flex-col items-center gap-1.5">
                        <span className="text-sm font-medium text-slate-200">{formPonderacionesEncuesta[i] ?? 0}%</span>
                        <div className="w-full p-3 rounded-lg bg-primary-900/30 border border-primary-700/50 text-center">
                          <span className="text-xs text-slate-400 block truncate">{seccion.titulo}</span>
                          <span className="text-xl font-bold text-slate-200">{total}<span className="text-base font-normal text-slate-400"> / {max}</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-sm text-slate-400 -mt-2">Puntaje total encuesta satisfacción: <span className="font-semibold text-slate-200">{puntajeSatisfaccion} / {PUNTAJE_MAXIMO_ENCUESTA}</span></p>
              <p className="text-sm text-slate-400">Puntaje ponderado: <span className="font-semibold text-slate-200">{puntajePonderadoEncuesta} / {PUNTAJE_MAXIMO_ENCUESTA}</span></p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <span className="text-sm text-slate-500">Nivel de satisfacción</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className={`w-8 h-8 ${i <= estrellasDesdePuntajeSatisfaccion(puntajePonderadoEncuesta) ? "text-yellow-400" : "text-slate-600"}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  ))}
                </div>
              </div>
              <div className="bg-slate-850 rounded-xl border border-slate-700 p-6 mt-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h2 className="text-base font-semibold text-slate-200">Análisis FODA (encuesta de satisfacción)</h2>
                  <button
                    type="button"
                    onClick={() => { setPromptGenerado(buildPromptEncuesta()); setTipoPromptGenerado("encuesta"); }}
                    disabled={!encuestaCompleta}
                    title={encuestaCompleta ? "Generar prompt para copiar en ChatGPT u otra IA" : "Completá todos los ítems de la encuesta para habilitar"}
                    className="px-3 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium"
                  >
                    Generar prompt para FODA (encuesta)
                  </button>
                </div>
                {datosSoloLectura ? (
                  <div className="py-2 text-slate-200 whitespace-pre-wrap">{formAnalisisEncuesta || "—"}</div>
                ) : (
                  <textarea value={formAnalisisEncuesta} onChange={(e) => setFormAnalisisEncuesta(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Fortalezas, oportunidades, debilidades, amenazas (FODA)..." />
                )}
              </div>

              {SECCIONES_ENCUESTA.map((seccion) => (
                <div key={seccion.id}>
                  <h3 className="text-sm font-medium text-primary-400 uppercase tracking-wide mb-4">{seccion.titulo}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-600">
                          <th className="text-left py-2 pr-4 font-medium text-slate-400">Criterio</th>
                          <th className="text-left py-2 pr-4 font-medium text-slate-400 max-w-[200px]">Descripción</th>
                          <th className="text-center py-2 px-1 font-medium text-slate-400 min-w-[5rem]">3</th>
                          <th className="text-center py-2 px-1 font-medium text-slate-400 min-w-[5rem]">2</th>
                          <th className="text-center py-2 px-1 font-medium text-slate-400 min-w-[5rem]">1</th>
                          <th className="text-center py-2 pl-2 font-medium text-slate-400 w-14">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seccion.criterios.map((c) => {
                          const val = getCampoEncuesta(c.key);
                          return (
                            <tr key={c.key} className="border-b border-slate-700/70">
                              <td className="py-2 pr-4 text-slate-300 align-top">{c.label}</td>
                              <td className="py-2 pr-4 text-slate-400 text-xs align-top">{c.descripcion}</td>
                              {c.opciones.map((o) => (
                                <td key={o.value} className="py-2 px-1 text-center align-top">
                                  <label className="flex flex-col items-center gap-0.5 cursor-pointer">
                                    <input type="radio" name={c.key} value={o.value} checked={val === o.value} onChange={() => setCampoEncuesta(c.key, o.value)} className="w-4 h-4 text-primary-500 border-slate-600 bg-slate-800 focus:ring-primary-500 shrink-0" />
                                    <span className="text-xs text-slate-400 leading-tight">{o.label}</span>
                                  </label>
                                </td>
                              ))}
                              <td className="py-2 pl-2 text-center font-medium text-slate-200 w-14 align-top">{typeof val === "number" ? val : "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-600">
                          <td className="py-2 pr-4 font-medium text-slate-300">Total</td>
                          <td />
                          <td colSpan={3} />
                          <td className="py-2 pl-2 text-center font-bold text-slate-200">
                            {seccion.criterios.reduce((s, c) => { const v = formEncuesta[c.key]; return s + (typeof v === "number" ? v : 0); }, 0)} / {seccion.criterios.length * 3}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ))}
              <div>
                <h3 className="text-sm font-medium text-primary-400 uppercase tracking-wide mb-4">PREGUNTAS CLAVE</h3>
                <p className="text-slate-400 text-sm mb-3">Cargá las respuestas del cliente en cada campo.</p>
                <div className="space-y-4">
                  {PREGUNTAS_CLAVE.map((p) => (
                    <div key={p.key}>
                      <label className="block text-sm font-medium text-slate-300 mb-1">{p.label}</label>
                      {datosSoloLectura ? (
                        <div className="py-2 px-3 rounded-lg bg-slate-800/50 text-slate-200 whitespace-pre-wrap border border-slate-700 min-h-[4rem]">{formPreguntasClave[p.key] || "—"}</div>
                      ) : (
                        <textarea value={formPreguntasClave[p.key] ?? ""} onChange={(e) => setFormPreguntasClave((prev) => ({ ...prev, [p.key]: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Escribí la respuesta aquí..." />
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-slate-500">Total encuesta satisfacción: <span className="font-semibold text-slate-300">{puntajeSatisfaccion} / {PUNTAJE_MAXIMO_ENCUESTA}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Sección colapsable: EVALUACIÓN DEL CLIENTE */}
        <div className="rounded-xl border border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenEvaluacion((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-left"
          >
            <span className="text-base font-semibold text-slate-200">EVALUACIÓN DEL CLIENTE</span>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${openEvaluacion ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openEvaluacion && (
            <div className="bg-slate-850 border-t border-slate-700 p-6 space-y-8">
        {/* Resumen de puntajes por sección + Puntaje final */}
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-medium text-slate-400">Ponderación por sesión</span>
            <button
              type="button"
              onClick={() => {
                setEditPonderaciones([...formPonderaciones]);
                setErrorPonderaciones(null);
                setModalPonderaciones(true);
              }}
              className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-900/40 rounded-lg shrink-0"
              title="Modificar ponderación"
              aria-label="Modificar ponderación"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            {SECCIONES_EVALUACION.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center gap-1.5">
                <span className="text-sm font-medium text-slate-200">{formPonderaciones[i] ?? 0}%</span>
                <div className="w-full p-3 rounded-lg bg-primary-900/30 border border-primary-700/50 text-center">
                  <span className="text-xs text-slate-400 block truncate">{s.titulo}</span>
                  <span className="text-xl font-bold text-slate-200">{totalesPorSeccion[i] ?? 0}<span className="text-base font-normal text-slate-400"> / {maxPorSeccion[i]}</span></span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-700">
            <div>
              <span className="text-sm text-slate-500 block">Puntaje final</span>
              <span className="text-2xl font-bold text-slate-200">{puntajeFinal} <span className="text-base font-normal text-slate-400">/ {maxPuntos} puntos</span></span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} className={`w-8 h-8 ${i <= estrellas ? "text-yellow-400" : "text-slate-600"}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              ))}
            </div>
          </div>
        </div>

        {/* Análisis final */}
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="text-base font-semibold text-slate-200">Análisis final</h2>
            <button
              type="button"
              onClick={() => { setPromptGenerado(buildPromptEvaluacion()); setTipoPromptGenerado("evaluacion"); }}
              disabled={!todosLosCamposCargados}
              title={todosLosCamposCargados ? "Generar prompt para copiar en ChatGPT u otra IA" : "Completá todos los ítems de la evaluación para habilitar"}
              className="px-3 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium"
            >
              Generar prompt para análisis final
            </button>
          </div>
          {datosSoloLectura ? (
            <div className="py-2 text-slate-200 whitespace-pre-wrap">{formAnalisisFinal || "—"}</div>
          ) : (
            <textarea value={formAnalisisFinal} onChange={(e) => setFormAnalisisFinal(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ej.: Fortalezas, oportunidades, debilidades, amenazas (FODA)..." />
          )}
        </div>

        {/* Secciones de evaluación */}
        <div className="bg-slate-850 rounded-xl border border-slate-700 p-6 space-y-8">
          {SECCIONES_EVALUACION.map((seccion) => (
            <div key={seccion.id}>
              <h3 className="text-sm font-medium text-primary-400 uppercase tracking-wide mb-4">
                {seccion.titulo}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-2 pr-4 font-medium text-slate-400">Criterio</th>
                      <th className="text-left py-2 pr-4 font-medium text-slate-400 max-w-[200px]">Descripción</th>
                      <th className="text-center py-2 px-1 font-medium text-slate-400 min-w-[5rem]">3</th>
                      <th className="text-center py-2 px-1 font-medium text-slate-400 min-w-[5rem]">2</th>
                      <th className="text-center py-2 px-1 font-medium text-slate-400 min-w-[5rem]">1</th>
                      <th className="text-center py-2 pl-2 font-medium text-slate-400 w-14">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seccion.criterios.map((c) => {
                      const val = getCampo(c.key);
                      return (
                        <tr key={c.key} className="border-b border-slate-700/70">
                          <td className="py-2 pr-4 text-slate-300 align-top">{c.label}</td>
                          <td className="py-2 pr-4 text-slate-400 text-xs align-top">{c.descripcion}</td>
                          {c.opciones.map((o) => (
                            <td key={o.value} className="py-2 px-1 text-center align-top">
                              <label className="flex flex-col items-center gap-0.5 cursor-pointer">
                                <input type="radio" name={c.key} value={o.value} checked={val === o.value} onChange={() => setCampo(c.key, o.value)} className="w-4 h-4 text-primary-500 border-slate-600 bg-slate-800 focus:ring-primary-500 shrink-0" />
                                <span className="text-xs text-slate-400 leading-tight">{o.label}</span>
                              </label>
                            </td>
                          ))}
                          <td className="py-2 pl-2 text-center font-medium text-slate-200 w-14 align-top">{typeof val === "number" ? val : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-600">
                      <td className="py-2 pr-4 font-medium text-slate-300">Total</td>
                      <td />
                      <td colSpan={3} />
                      <td className="py-2 pl-2 text-center font-bold text-slate-200">
                        {seccion.criterios.reduce((s, c) => { const v = formValues[c.key]; return s + (typeof v === "number" ? v : 0); }, 0)} / {seccion.criterios.length * 3}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>

            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={loading || !formCliente || !formVendedor || !formFecha} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50">
            {loading ? "Guardando..." : idAuditoria ? "Actualizar auditoría" : "Finalizar Auditoría"}
          </button>
          <button type="button" onClick={handleCancelarConConfirmar} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium">
            Cancelar
          </button>
        </div>
      </form>

      {promptGenerado != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-1">
              {tipoPromptGenerado === "encuesta" ? "Prompt para FODA (encuesta de satisfacción)" : "Prompt para análisis final (evaluación)"}
            </h2>
            <p className="text-sm text-slate-400 mb-3">
              Copiá el texto de abajo y pegalo en ChatGPT u otra IA. Luego pegá la respuesta en el campo &quot;Análisis FODA (encuesta)&quot; o &quot;Análisis final&quot; según corresponda.
            </p>
            <textarea readOnly value={promptGenerado} rows={14} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 text-sm font-mono resize-none" />
            <div className="flex flex-wrap gap-2 justify-end mt-3">
              <button
                type="button"
                onClick={() => {
                  if (promptGenerado && navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(promptGenerado);
                    setSuccessMessage("Prompt copiado al portapapeles.");
                  }
                }}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium"
              >
                Copiar al portapapeles
              </button>
              <button
                type="button"
                onClick={() => { setPromptGenerado(null); setTipoPromptGenerado(null); }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalGuardarParcial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-2">Faltan datos por completar</h2>
            <p className="text-sm text-slate-400 mb-4">La encuesta de satisfacción y/o la evaluación del cliente tienen ítems sin completar. ¿Qué deseas hacer?</p>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setModalGuardarParcial(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg font-medium"
              >
                Seguir completando
              </button>
              <button
                type="button"
                onClick={() => doSave(true)}
                disabled={loading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar de forma parcial"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalPonderaciones && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-2">Ponderación por sesión</h2>
            <p className="text-sm text-slate-400 mb-4">La suma de los porcentajes debe ser 100%.</p>
            {errorPonderaciones && (
              <div className="mb-3 p-2 rounded bg-red-900/50 text-red-300 text-sm">{errorPonderaciones}</div>
            )}
            <div className="space-y-3 mb-4">
              {SECCIONES_EVALUACION.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <label className="text-slate-300 text-sm w-40 shrink-0 truncate">{s.titulo}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editPonderaciones[i] ?? 0}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      const next = [...editPonderaciones];
                      next[i] = isNaN(v) ? 0 : Math.max(0, Math.min(100, v));
                      setEditPonderaciones(next);
                      setErrorPonderaciones(null);
                    }}
                    className="w-20 px-2 py-1.5 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 text-sm"
                  />
                  <span className="text-slate-500 text-sm">%</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Suma actual: <span className={editPonderaciones.reduce((a, b) => a + b, 0) === 100 ? "text-green-400" : "text-amber-400"}>{editPonderaciones.reduce((a, b) => a + b, 0)}%</span>
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setModalPonderaciones(false);
                  setErrorPonderaciones(null);
                }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const suma = editPonderaciones.reduce((a, b) => a + b, 0);
                  if (suma !== 100) {
                    setErrorPonderaciones(`La suma debe ser 100%. Actual: ${suma}%.`);
                    return;
                  }
                  setFormPonderaciones([...editPonderaciones]);
                  setModalPonderaciones(false);
                  setErrorPonderaciones(null);
                }}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalPonderacionesEncuesta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-slate-850 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-2">Ponderación por sesión (encuesta)</h2>
            <p className="text-sm text-slate-400 mb-4">La suma de los porcentajes debe ser 100%.</p>
            {errorPonderacionesEncuesta && (
              <div className="mb-3 p-2 rounded bg-red-900/50 text-red-300 text-sm">{errorPonderacionesEncuesta}</div>
            )}
            <div className="space-y-3 mb-4">
              {SECCIONES_ENCUESTA.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <label className="text-slate-300 text-sm w-40 shrink-0 truncate">{s.titulo}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editPonderacionesEncuesta[i] ?? 0}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      const next = [...editPonderacionesEncuesta];
                      next[i] = isNaN(v) ? 0 : Math.max(0, Math.min(100, v));
                      setEditPonderacionesEncuesta(next);
                      setErrorPonderacionesEncuesta(null);
                    }}
                    className="w-20 px-2 py-1.5 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 text-sm"
                  />
                  <span className="text-slate-500 text-sm">%</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Suma actual: <span className={editPonderacionesEncuesta.reduce((a, b) => a + b, 0) === 100 ? "text-green-400" : "text-amber-400"}>{editPonderacionesEncuesta.reduce((a, b) => a + b, 0)}%</span>
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setModalPonderacionesEncuesta(false);
                  setErrorPonderacionesEncuesta(null);
                }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const suma = editPonderacionesEncuesta.reduce((a, b) => a + b, 0);
                  if (suma !== 100) {
                    setErrorPonderacionesEncuesta(`La suma debe ser 100%. Actual: ${suma}%.`);
                    return;
                  }
                  setFormPonderacionesEncuesta([...editPonderacionesEncuesta]);
                  setModalPonderacionesEncuesta(false);
                  setErrorPonderacionesEncuesta(null);
                }}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
