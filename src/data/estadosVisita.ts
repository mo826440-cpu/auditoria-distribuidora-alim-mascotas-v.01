/**
 * Estados de visitas y colores para la leyenda.
 */
export const ESTADOS_VISITA = [
  { value: "pendiente", label: "Pendiente" },
  { value: "realizada", label: "Realizada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "reprogramada", label: "Reprogramada" },
];

export const ESTADO_LEGEND_BG_VISITA: Record<string, string> = {
  pendiente: "bg-yellow-400",
  realizada: "bg-green-500",
  cancelada: "bg-red-400",
  reprogramada: "bg-orange-500",
};
