/**
 * Criterios de evaluación según Descripcion_Evaluacion.md.
 * Cada sección tiene criterios con escala 1-5 (opciones de 5 a 1).
 */
export type CriterioEvaluacion = {
  key: string;
  label: string;
  opciones: { value: number; label: string }[];
};

export type SeccionEvaluacion = {
  id: string;
  titulo: string;
  criterios: CriterioEvaluacion[];
};

const ESCALA_5 = (labels: [string, string, string, string, string]) => [
  { value: 5, label: labels[0] },
  { value: 4, label: labels[1] },
  { value: 3, label: labels[2] },
  { value: 2, label: labels[3] },
  { value: 1, label: labels[4] },
];

export const SECCIONES_EVALUACION: SeccionEvaluacion[] = [
  {
    id: "relacion_comercial",
    titulo: "RELACIÓN COMERCIAL",
    criterios: [
      { key: "eval_relacion_cumplimiento_pagos", label: "Cumplimiento de pagos", opciones: ESCALA_5(["Siempre en fecha", "Casi siempre en fecha", "A veces se atrasa", "Se atrasa seguido", "Muy incumplidor"]) },
      { key: "eval_relacion_formas_pago", label: "Formas de pago habituales", opciones: ESCALA_5(["Contado", "Transferencia corta", "Cuenta corriente normal", "Plazos largos", "Pago complicado"]) },
      { key: "eval_relacion_frecuencia_compra", label: "Frecuencia de compra", opciones: ESCALA_5(["Semanal", "Quincenal / mensual", "Cada 1–2 meses", "Cada varios meses", "Esporádico"]) },
      { key: "eval_relacion_comunicacion_ventas", label: "Comunicación con ventas", opciones: ESCALA_5(["Muy fluida", "Fluida", "Normal", "Difícil", "Muy difícil"]) },
      { key: "eval_relacion_trato_general", label: "Trato general", opciones: ESCALA_5(["Excelente trato", "Buen trato", "Trato normal", "Trato difícil", "Mal trato"]) },
    ],
  },
  {
    id: "ventas",
    titulo: "VENTAS",
    criterios: [
      { key: "eval_ventas_volumen", label: "Volumen de compra", opciones: ESCALA_5(["Muy alto", "Alto", "Medio", "Bajo", "Muy bajo"]) },
      { key: "eval_ventas_rotacion", label: "Rotación de productos", opciones: ESCALA_5(["Muy rápida", "Rápida", "Normal", "Lenta", "Muy lenta"]) },
      { key: "eval_ventas_interes_nuevos", label: "Interés en nuevos productos", opciones: ESCALA_5(["Muy interesado", "Interesado", "Normal", "Poco interesado", "No interesado"]) },
    ],
  },
  {
    id: "logistica",
    titulo: "LOGÍSTICA",
    criterios: [
      { key: "eval_logistica_facilidad_entrega", label: "Facilidad de entrega", opciones: ESCALA_5(["Muy fácil", "Fácil", "Normal", "Difícil", "Muy difícil"]) },
      { key: "eval_logistica_horarios_recepcion", label: "Horarios de recepción", opciones: ESCALA_5(["Muy amplios", "Amplios", "Normales", "Limitados", "Muy limitados"]) },
      { key: "eval_logistica_espacio_descarga", label: "Espacio para descarga", opciones: ESCALA_5(["Mucho espacio", "Buen espacio", "Normal", "Poco espacio", "Sin espacio"]) },
      { key: "eval_logistica_organizacion_recibir", label: "Organización al recibir", opciones: ESCALA_5(["Muy organizado", "Organizado", "Normal", "Desorganizado", "Muy desorganizado"]) },
    ],
  },
  {
    id: "local",
    titulo: "LOCAL",
    criterios: [
      { key: "eval_local_exhibicion", label: "Exhibición de productos", opciones: ESCALA_5(["Muy visible", "Visible", "Normal", "Poco visible", "No visible"]) },
      { key: "eval_local_orden_limpieza", label: "Orden y limpieza", opciones: ESCALA_5(["Muy ordenado y limpio", "Ordenado", "Normal", "Desordenado", "Muy desordenado"]) },
      { key: "eval_local_iluminacion", label: "Iluminación", opciones: ESCALA_5(["Muy buena", "Buena", "Normal", "Mala", "Muy mala"]) },
      { key: "eval_local_espacio_disponible", label: "Espacio disponible", opciones: ESCALA_5(["Mucho espacio", "Buen espacio", "Normal", "Poco espacio", "Sin espacio"]) },
      { key: "eval_local_ubicacion", label: "Ubicación", opciones: ESCALA_5(["Muy buena ubicación", "Buena ubicación", "Normal", "Mala ubicación", "Muy mala ubicación"]) },
    ],
  },
  {
    id: "competencia",
    titulo: "COMPETENCIA",
    criterios: [
      { key: "eval_competencia_presencia", label: "Presencia de competencia", opciones: ESCALA_5(["Sin competencia", "Poca competencia", "Competencia normal", "Mucha competencia", "Dominado por competencia"]) },
      { key: "eval_competencia_participacion", label: "Participación de nuestros productos", opciones: ESCALA_5(["Muy alta", "Alta", "Media", "Baja", "Muy baja"]) },
    ],
  },
  {
    id: "potencial",
    titulo: "POTENCIAL",
    criterios: [
      { key: "eval_potencial_crecimiento", label: "Posibilidad de crecimiento", opciones: ESCALA_5(["Mucho potencial", "Buen potencial", "Potencial normal", "Poco potencial", "Sin potencial"]) },
      { key: "eval_potencial_cantidad_clientes", label: "Cantidad de clientes", opciones: ESCALA_5(["Muchísimos", "Muchos", "Normal", "Pocos", "Muy pocos"]) },
      { key: "eval_potencial_tamano_local", label: "Tamaño del local", opciones: ESCALA_5(["Muy grande", "Grande", "Mediano", "Chico", "Muy chico"]) },
    ],
  },
];

export const TODAS_LAS_CLAVES_EVALUACION = SECCIONES_EVALUACION.flatMap((s) =>
  s.criterios.map((c) => c.key)
);

export function puntajeMaximo(): number {
  return SECCIONES_EVALUACION.reduce((acc, s) => acc + s.criterios.length * 5, 0);
}

export function estrellasDesdePuntaje(puntaje: number): number {
  const max = puntajeMaximo();
  if (max === 0) return 0;
  const ratio = puntaje / max;
  if (ratio >= 0.9) return 5;
  if (ratio >= 0.7) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.3) return 2;
  return 1;
}
