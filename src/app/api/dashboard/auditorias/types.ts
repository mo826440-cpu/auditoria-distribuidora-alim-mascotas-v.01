export type DashboardAuditoriaItem = {
  id: string;
  fecha: string;
  sector: string;
  responsable: string;
  estado: "Aprobado" | "Rechazado" | "Pendiente" | "Regular";
  resultado: "Positivo" | "Negativo" | "Sin resultado";
  tipo: string;
  puntaje_final: number | null;
};
