/**
 * Criterios de la Encuesta de Satisfacción del Cliente.
 * Escala 3-2-1 por criterio (3 = mejor, 1 = peor).
 */
export type CriterioEncuesta = {
  key: string;
  label: string;
  descripcion: string;
  opciones: { value: number; label: string }[];
};

export type SeccionEncuesta = {
  id: string;
  titulo: string;
  criterios: CriterioEncuesta[];
};

const ESCALA_3 = (labels: [string, string, string]) => [
  { value: 3, label: labels[0] },
  { value: 2, label: labels[1] },
  { value: 1, label: labels[2] },
];

export const SECCIONES_ENCUESTA: SeccionEncuesta[] = [
  {
    id: "atencion",
    titulo: "ATENCIÓN COMERCIAL",
    criterios: [
      { key: "encuesta_atencion_trato_amabilidad", label: "Trato y Amabilidad", descripcion: "¿El vendedor es cordial y respetuoso?", opciones: ESCALA_3(["Amable", "Normal", "Mal trato"]) },
      { key: "encuesta_atencion_tiempos_respuesta", label: "Tiempos de respuesta", descripcion: "¿Qué tan rápido responden ante consultas?", opciones: ESCALA_3(["Rápido", "Normal", "Demora"]) },
      { key: "encuesta_atencion_claridad_info", label: "Claridad en la información", descripcion: "¿La información que brindan es clara?", opciones: ESCALA_3(["Muy claro", "Normal", "Muy confuso"]) },
      { key: "encuesta_atencion_resolucion_problemas", label: "Resolución de problemas", descripcion: "¿Cómo resuelven inconvenientes?", opciones: ESCALA_3(["Rápido", "Normal", "No soluciona"]) },
      { key: "encuesta_atencion_frecuencia_contacto", label: "Frecuencia de contacto", descripcion: "¿Con qué frecuencia hay contacto comercial?", opciones: ESCALA_3(["Frecuente", "Normal", "Casi nunca"]) },
      { key: "encuesta_atencion_percepcion_general", label: "Percepción general", descripcion: "¿Cómo calificaría la atención en general?", opciones: ESCALA_3(["Excelente", "Normal", "Mala"]) },
    ],
  },
  {
    id: "entregas",
    titulo: "ENTREGAS",
    criterios: [
      { key: "encuesta_entregas_tiempos", label: "Tiempos de entrega", descripcion: "¿Los pedidos llegan en tiempo acordado?", opciones: ESCALA_3(["Nunca", "A veces", "Siempre"]) },
      { key: "encuesta_entregas_pedido_completo", label: "Pedido completo", descripcion: "¿Los pedidos llegan completos y sin errores?", opciones: ESCALA_3(["Sin errores", "A veces", "Siempre"]) },
      { key: "encuesta_entregas_estado_pedido", label: "Estado general del pedido", descripcion: "¿En qué estado llega la mercadería?", opciones: ESCALA_3(["Bien", "Normal", "Dañado"]) },
      { key: "encuesta_entregas_facilidad_descarga", label: "Facilidad de descarga", descripcion: "¿Qué tan fácil es la descarga?", opciones: ESCALA_3(["Fácil", "Normal", "Complicado"]) },
      { key: "encuesta_entregas_trato_transportista", label: "Trato del transportista", descripcion: "¿Cómo es el trato del repartidor?", opciones: ESCALA_3(["Amable", "Normal", "Descortés"]) },
    ],
  },
  {
    id: "productos",
    titulo: "PRODUCTOS",
    criterios: [
      { key: "encuesta_productos_calidad", label: "Calidad de los alimentos", descripcion: "¿Qué opinión tienen sobre la calidad de nuestros productos?", opciones: ESCALA_3(["Excelente", "Normal", "Mala"]) },
      { key: "encuesta_productos_variedad", label: "Variedad de productos", descripcion: "¿La variedad de productos es adecuada?", opciones: ESCALA_3(["Buena", "Normal", "Baja"]) },
      { key: "encuesta_productos_disponibilidad_stock", label: "Disponibilidad de stock", descripcion: "¿Hay disponibilidad de los productos que necesitan?", opciones: ESCALA_3(["Siempre", "A veces", "Nunca"]) },
      { key: "encuesta_productos_rotacion", label: "Rotación de productos", descripcion: "¿Qué tan rápido rotan los productos?", opciones: ESCALA_3(["Rápido", "Normal", "Lento"]) },
    ],
  },
  {
    id: "precios",
    titulo: "PRECIOS Y PAGOS",
    criterios: [
      { key: "encuesta_precios_competitividad", label: "Competitividad de precios", descripcion: "¿Qué tan buenos son nuestros precios frente a otros proveedores?", opciones: ESCALA_3(["Excelentes", "Aceptables", "Elevados"]) },
      { key: "encuesta_precios_promociones", label: "Promociones", descripcion: "¿Las promociones son útiles?", opciones: ESCALA_3(["Muy útiles", "A veces útiles", "No convenientes"]) },
      { key: "encuesta_precios_condiciones_pago", label: "Condiciones de pago", descripcion: "¿Las condiciones de pago son cómodas?", opciones: ESCALA_3(["Muy cómodas", "Aceptables", "Incómodas"]) },
      { key: "encuesta_precios_relacion_calidad", label: "Relación precio-calidad", descripcion: "¿La relación precio-calidad es adecuada?", opciones: ESCALA_3(["Vale la pena", "Aceptable", "No lo vale"]) },
    ],
  },
  {
    id: "relacion_encuesta",
    titulo: "RELACIÓN COMERCIAL",
    criterios: [
      { key: "encuesta_relacion_facilidad_pedidos", label: "Facilidad para hacer pedidos", descripcion: "¿Qué tan fácil y rápido es realizar un pedido?", opciones: ESCALA_3(["Muy fácil", "Normal", "Difícil"]) },
      { key: "encuesta_relacion_comunicacion", label: "Comunicación con la empresa", descripcion: "¿Cómo es la comunicación con la empresa?", opciones: ESCALA_3(["Muy buena", "Normal", "Mala"]) },
      { key: "encuesta_relacion_resolucion_reclamos", label: "Resolución de reclamos", descripcion: "¿Cómo se resuelven los reclamos?", opciones: ESCALA_3(["Rápida y efectiva", "Aceptable", "Deficiente"]) },
      { key: "encuesta_relacion_satisfaccion_general", label: "Satisfacción general", descripcion: "¿Qué tan conforme está con el servicio?", opciones: ESCALA_3(["Muy conforme", "Conforme", "Disconforme"]) },
      { key: "encuesta_relacion_recomendacion", label: "Recomendación", descripcion: "¿Recomendaría trabajar con nosotros?", opciones: ESCALA_3(["Muy probable", "Probable", "Poco probable"]) },
    ],
  },
];

export const TODAS_LAS_CLAVES_ENCUESTA = SECCIONES_ENCUESTA.flatMap((s) =>
  s.criterios.map((c) => c.key)
);

export const PUNTAJE_MAXIMO_ENCUESTA = 72; // 24 criterios × 3

export function estrellasDesdePuntajeSatisfaccion(puntaje: number): number {
  if (puntaje <= 0) return 0;
  const ratio = puntaje / PUNTAJE_MAXIMO_ENCUESTA;
  if (ratio >= 0.9) return 5;
  if (ratio >= 0.7) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.3) return 2;
  return 1;
}

export const PREGUNTAS_CLAVE = [
  { key: "pregunta_clave_mejorar", label: "¿Qué deberíamos mejorar?" },
  { key: "pregunta_clave_productos_agregar", label: "¿Qué productos te gustaría que agreguemos?" },
  { key: "pregunta_clave_problema_reciente", label: "¿Tuviste algún problema reciente?" },
  { key: "pregunta_clave_otra_distribuidora", label: "¿Qué otra distribuidora estás trabajando?" },
] as const;
