"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DashboardAuditoriaItem } from "@/app/api/dashboard/auditorias/types";

const COLORES = [
  "#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#ec4899", "#14b8a6", "#6366f1",
];
const GRIS = "#64748b";

function useAuditorias() {
  const [data, setData] = useState<DashboardAuditoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/auditorias")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json.data ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

type Filtros = {
  fechaDesde: string;
  fechaHasta: string;
  sector: string;
  responsable: string;
  estado: string;
  tipo: string;
};

const FILTRO_TODOS = "";

export function DashboardClient() {
  const { data: rawData, loading, error } = useAuditorias();
  const [filtros, setFiltros] = useState<Filtros>({
    fechaDesde: "",
    fechaHasta: "",
    sector: FILTRO_TODOS,
    responsable: FILTRO_TODOS,
    estado: FILTRO_TODOS,
    tipo: FILTRO_TODOS,
  });

  const datos = useMemo(() => {
    let list = rawData;
    if (filtros.fechaDesde) list = list.filter((a) => a.fecha >= filtros.fechaDesde);
    if (filtros.fechaHasta) list = list.filter((a) => a.fecha <= filtros.fechaHasta);
    if (filtros.sector) list = list.filter((a) => a.sector === filtros.sector);
    if (filtros.responsable) list = list.filter((a) => a.responsable === filtros.responsable);
    if (filtros.estado) list = list.filter((a) => a.estado === filtros.estado);
    if (filtros.tipo) list = list.filter((a) => a.tipo === filtros.tipo);
    return list;
  }, [rawData, filtros]);

  const opcionesSector = useMemo(() => [...new Set(rawData.map((a) => a.sector))].sort(), [rawData]);
  const opcionesResponsable = useMemo(() => [...new Set(rawData.map((a) => a.responsable))].sort(), [rawData]);
  const opcionesEstado = useMemo(() => [...new Set(rawData.map((a) => a.estado))].sort(), [rawData]);
  const opcionesTipo = useMemo(() => [...new Set(rawData.map((a) => a.tipo))].sort(), [rawData]);

  const porMes = useMemo(() => {
    const map = new Map<string, number>();
    datos.forEach((a) => {
      const mes = a.fecha.slice(0, 7);
      map.set(mes, (map.get(mes) ?? 0) + 1);
    });
    return [...map.entries()]
      .map(([mes, cantidad]) => ({ mes: mes.replace("-", "/"), cantidad }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [datos]);

  const porSector = useMemo(() => {
    const map = new Map<string, number>();
    datos.forEach((a) => map.set(a.sector, (map.get(a.sector) ?? 0) + 1));
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [datos]);

  const porEstado = useMemo(() => {
    const map = new Map<string, number>();
    datos.forEach((a) => map.set(a.estado, (map.get(a.estado) ?? 0) + 1));
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [datos]);

  const evolucionTiempo = useMemo(() => {
    const map = new Map<string, number>();
    datos.forEach((a) => {
      const mes = a.fecha.slice(0, 7);
      map.set(mes, (map.get(mes) ?? 0) + 1);
    });
    return [...map.entries()]
      .map(([mes, total]) => ({ mes: mes.replace("-", "/"), total }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [datos]);

  const positivosVsNegativos = useMemo(() => {
    const map = new Map<string, { positivos: number; negativos: number }>();
    datos.forEach((a) => {
      const mes = a.fecha.slice(0, 7);
      const prev = map.get(mes) ?? { positivos: 0, negativos: 0 };
      if (a.resultado === "Positivo") prev.positivos += 1;
      else if (a.resultado === "Negativo") prev.negativos += 1;
      map.set(mes, prev);
    });
    return [...map.entries()]
      .map(([mes, v]) => ({ mes: mes.replace("-", "/"), ...v }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [datos]);

  const porcentajeAprobadas = useMemo(() => {
    const total = datos.length;
    const aprobadas = datos.filter((a) => a.estado === "Aprobado").length;
    return [
      { name: "Aprobadas", value: aprobadas, color: COLORES[1] },
      { name: "Otras", value: total - aprobadas, color: GRIS },
    ].filter((d) => d.value > 0);
  }, [datos]);

  const porcentajePorSector = useMemo(() => {
    const total = datos.length;
    if (total === 0) return [];
    const map = new Map<string, number>();
    datos.forEach((a) => map.set(a.sector, (map.get(a.sector) ?? 0) + 1));
    return [...map.entries()].map(([name], i) => ({
      name,
      value: Math.round(((map.get(name) ?? 0) / total) * 100),
      color: COLORES[i % COLORES.length],
    }));
  }, [datos]);

  const porcentajePorTipo = useMemo(() => {
    const total = datos.length;
    if (total === 0) return [];
    const map = new Map<string, number>();
    datos.forEach((a) => map.set(a.tipo, (map.get(a.tipo) ?? 0) + 1));
    return [...map.entries()].map(([name], i) => ({
      name,
      value: Math.round(((map.get(name) ?? 0) / total) * 100),
      color: COLORES[i % COLORES.length],
    }));
  }, [datos]);

  const porResponsable = useMemo(() => {
    const map = new Map<string, number>();
    datos.forEach((a) => map.set(a.responsable, (map.get(a.responsable) ?? 0) + 1));
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [datos]);

  const setFiltro = (key: keyof Filtros, value: string) =>
    setFiltros((prev) => ({ ...prev, [key]: value }));

  const tooltipStyle = {
    contentStyle: { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" },
    labelStyle: { color: "#f1f5f9" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-slate-400">Cargando datos del dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-900/20 p-4 text-red-300">
        Error al cargar: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Filtros
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Desde</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltro("fechaDesde", e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Hasta</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltro("fechaHasta", e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Sector</label>
            <select
              value={filtros.sector}
              onChange={(e) => setFiltro("sector", e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-primary-500"
            >
              <option value={FILTRO_TODOS}>Todos</option>
              {opcionesSector.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Responsable</label>
            <select
              value={filtros.responsable}
              onChange={(e) => setFiltro("responsable", e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-primary-500"
            >
              <option value={FILTRO_TODOS}>Todos</option>
              {opcionesResponsable.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltro("estado", e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-primary-500"
            >
              <option value={FILTRO_TODOS}>Todos</option>
              {opcionesEstado.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Tipo</label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltro("tipo", e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-primary-500"
            >
              <option value={FILTRO_TODOS}>Todos</option>
              {opcionesTipo.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {datos.length} auditoría(s) con los filtros aplicados
        </p>
      </div>

      {/* Gráficos en tarjetas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Barras: auditorías por mes */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Auditorías por mes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porMes} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="mes" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="cantidad" name="Cantidad" fill={COLORES[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barras: auditorías por sector */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Auditorías por sector</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porSector} layout="vertical" margin={{ top: 8, right: 8, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} width={80} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Cantidad" fill={COLORES[1]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barras: auditorías por estado */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Auditorías por estado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porEstado} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Cantidad" radius={[4, 4, 0, 0]}>
                  {porEstado.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Líneas: evolución en el tiempo */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Evolución de auditorías en el tiempo</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucionTiempo} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="mes" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ color: "#94a3b8" }} />
                <Line type="monotone" dataKey="total" name="Total" stroke={COLORES[0]} strokeWidth={2} dot={{ fill: COLORES[0] }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Líneas: positivos vs negativos */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Resultados positivos vs negativos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={positivosVsNegativos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="mes" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ color: "#94a3b8" }} />
                <Line type="monotone" dataKey="positivos" name="Positivos" stroke={COLORES[1]} strokeWidth={2} dot={{ fill: COLORES[1] }} />
                <Line type="monotone" dataKey="negativos" name="Negativos" stroke={COLORES[3]} strokeWidth={2} dot={{ fill: COLORES[3] }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Torta: % aprobadas */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Porcentaje de auditorías aprobadas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={porcentajeAprobadas}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: "#94a3b8" }}
                >
                  {porcentajeAprobadas.map((_, i) => (
                    <Cell key={i} fill={porcentajeAprobadas[i].color} stroke="#1e293b" />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value}`, "Cantidad"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Torta: % por sector */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Porcentaje por sector</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={porcentajePorSector}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={{ stroke: "#94a3b8" }}
                >
                  {porcentajePorSector.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="#1e293b" />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value}%`, "Porcentaje"]} />
                <Legend wrapperStyle={{ color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Torta: % por tipo */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Porcentaje por tipo de auditoría</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={porcentajePorTipo}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={{ stroke: "#94a3b8" }}
                >
                  {porcentajePorTipo.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="#1e293b" />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value}%`, "Porcentaje"]} />
                <Legend wrapperStyle={{ color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Columnas: comparación sectores */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Comparación entre sectores</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porSector} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Cantidad" radius={[4, 4, 0, 0]}>
                  {porSector.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Columnas: comparación responsables */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Comparación por responsables</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porResponsable} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Cantidad" radius={[4, 4, 0, 0]}>
                  {porResponsable.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
