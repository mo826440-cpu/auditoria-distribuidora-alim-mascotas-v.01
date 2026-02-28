/**
 * Criterios de EVALUACIÓN DEL CLIENTE según diseño (escala 3-2-1).
 * 5 secciones: RELACIÓN COMERCIAL, VENTAS, LOGÍSTICA, LOCAL, POTENCIAL.
 * Total 22 criterios, máx 66 puntos. Ponderación 20% por sesión.
 */
export type CriterioEvaluacion = {
  key: string;
  label: string;
  descripcion: string;
  opciones: { value: number; label: string }[];
};

export type SeccionEvaluacion = {
  id: string;
  titulo: string;
  criterios: CriterioEvaluacion[];
};

const ESCALA_3 = (labels: [string, string, string]) => [
  { value: 3, label: labels[0] },
  { value: 2, label: labels[1] },
  { value: 1, label: labels[2] },
];

export const SECCIONES_EVALUACION: SeccionEvaluacion[] = [
  {
    id: "relacion_comercial",
    titulo: "RELACIÓN COMERCIAL",
    criterios: [
      { key: "eval3_relacion_trato_vendedor", label: "Trato con el vendedor", descripcion: "¿Cómo es el comportamiento del cliente con el vendedor?", opciones: ESCALA_3(["Muy respetuoso", "Normal", "Conflictivo"]) },
      { key: "eval3_relacion_trato_empresa", label: "Trato con la empresa", descripcion: "¿Cómo es la relación general con la empresa?", opciones: ESCALA_3(["Muy buena", "Normal", "Difícil"]) },
      { key: "eval3_relacion_comunicacion", label: "Comunicación", descripcion: "¿Qué tan fácil es comunicarse con el cliente?", opciones: ESCALA_3(["Muy buena", "Normal", "Complicada"]) },
      { key: "eval3_relacion_resolucion_problemas", label: "Resolución de problemas", descripcion: "¿Cómo responde cuando hay inconvenientes?", opciones: ESCALA_3(["Colabora", "Normal", "Complica"]) },
      { key: "eval3_relacion_cumplimiento_pagos", label: "Cumplimiento de pagos", descripcion: "¿Qué tan bien cumple con los pagos?", opciones: ESCALA_3(["Al día", "Poca demora", "Muy atrasado"]) },
    ],
  },
  {
    id: "ventas",
    titulo: "VENTAS",
    criterios: [
      { key: "eval3_ventas_frecuencia_compra", label: "Frecuencia de compra", descripcion: "¿Cada cuánto realiza pedidos?", opciones: ESCALA_3(["Frecuente", "Ocasional", "Poco frecuente"]) },
      { key: "eval3_ventas_volumen", label: "Volumen de productos", descripcion: "¿Cantidad de productos que compra?", opciones: ESCALA_3(["Alto", "Medio", "Bajo"]) },
      { key: "eval3_ventas_rotacion", label: "Rotación de productos", descripcion: "¿Qué tan rápido vende los productos?", opciones: ESCALA_3(["Alta", "Normal", "Baja"]) },
      { key: "eval3_ventas_participacion_productos", label: "Participación de nuestros productos", descripcion: "¿Presencia de nuestros productos en el local?", opciones: ESCALA_3(["Alta", "Normal", "Baja"]) },
    ],
  },
  {
    id: "logistica",
    titulo: "LOGÍSTICA",
    criterios: [
      { key: "eval3_logistica_recepcion_pedidos", label: "Recepción de pedidos", descripcion: "¿Qué tan fácil es entregar mercadería?", opciones: ESCALA_3(["Muy fácil", "Normal", "Difícil"]) },
      { key: "eval3_logistica_trato_transportista", label: "Trato con el transportista", descripcion: "¿Cómo trata al repartidor?", opciones: ESCALA_3(["Respetuoso", "Normal", "Problemático"]) },
      { key: "eval3_logistica_espacio_descarga", label: "Espacio para descargar", descripcion: "¿Lugar disponible para descargar?", opciones: ESCALA_3(["Amplio", "Normal", "Limitado"]) },
      { key: "eval3_logistica_organizacion_recibir", label: "Organización al recibir", descripcion: "¿Preparación para recibir pedidos?", opciones: ESCALA_3(["Organizado", "Normal", "Desorganizado"]) },
    ],
  },
  {
    id: "local",
    titulo: "LOCAL",
    criterios: [
      { key: "eval3_local_estado", label: "Estado del local", descripcion: "¿Qué tan ordenado y limpio está?", opciones: ESCALA_3(["Muy bueno", "Normal", "Malo"]) },
      { key: "eval3_local_exhibicion", label: "Exhibición de productos", descripcion: "¿Cómo muestra los productos?", opciones: ESCALA_3(["Muy bueno", "Normal", "Malo"]) },
      { key: "eval3_local_espacio", label: "Espacio disponible", descripcion: "¿Lugar para almacenar productos?", opciones: ESCALA_3(["Amplio", "Suficiente", "Reducido"]) },
      { key: "eval3_local_iluminacion", label: "Iluminación", descripcion: "¿Qué tan bien iluminado está el local?", opciones: ESCALA_3(["Buena", "Normal", "Mala"]) },
    ],
  },
  {
    id: "potencial",
    titulo: "POTENCIAL",
    criterios: [
      { key: "eval3_potencial_ubicacion", label: "Ubicación", descripcion: "¿Qué tan favorable es la ubicación del negocio?", opciones: ESCALA_3(["Muy buena", "Normal", "Mala"]) },
      { key: "eval3_potencial_cantidad_clientes", label: "Cantidad de clientes", descripcion: "¿Movimiento de clientes?", opciones: ESCALA_3(["Alta", "Media", "Baja"]) },
      { key: "eval3_potencial_crecimiento", label: "Posibilidad de crecimiento", descripcion: "¿Potencial de aumentar ventas?", opciones: ESCALA_3(["Alta", "Media", "Baja"]) },
      { key: "eval3_potencial_tamano_local", label: "Tamaño del local", descripcion: "¿Dimensión del negocio?", opciones: ESCALA_3(["Grande", "Mediano", "Chico"]) },
      { key: "eval3_potencial_presencia_competencia", label: "Presencia de competencia", descripcion: "¿Cantidad de competidores cerca?", opciones: ESCALA_3(["Baja", "Normal", "Alta"]) },
    ],
  },
];

export const TODAS_LAS_CLAVES_EVALUACION = SECCIONES_EVALUACION.flatMap((s) =>
  s.criterios.map((c) => c.key)
);

export const PUNTAJE_MAXIMO_EVALUACION = 66; // 22 criterios × 3

export function puntajeMaximo(): number {
  return PUNTAJE_MAXIMO_EVALUACION;
}

export function estrellasDesdePuntaje(puntaje: number): number {
  const max = PUNTAJE_MAXIMO_EVALUACION;
  if (max === 0) return 0;
  const ratio = puntaje / max;
  if (ratio >= 0.9) return 5;
  if (ratio >= 0.7) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.3) return 2;
  return 1;
}
