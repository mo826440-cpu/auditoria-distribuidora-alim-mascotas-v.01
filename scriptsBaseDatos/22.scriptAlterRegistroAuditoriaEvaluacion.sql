-- ============================================================
-- 22. ALTER REGISTRO AUDITORÍA - Modelo de evaluación por criterios (1-5)
-- Según Descripcion_Evaluacion.md: 6 secciones, criterios con escala 1 a 5.
-- Compatible con registros existentes. No borra datos.
-- ============================================================

-- Horarios de la auditoría (para Datos de la Auditoría)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS hora_inicio TIME;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS hora_fin TIME;

-- Análisis final (texto libre, ej. FODA)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS analisis_final TEXT;

-- RELACIÓN COMERCIAL (5 criterios, 1-5)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_relacion_cumplimiento_pagos INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_relacion_formas_pago INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_relacion_frecuencia_compra INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_relacion_comunicacion_ventas INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_relacion_trato_general INTEGER;

-- VENTAS (3 criterios, 1-5)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_ventas_volumen INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_ventas_rotacion INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_ventas_interes_nuevos INTEGER;

-- LOGÍSTICA (4 criterios, 1-5)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_logistica_facilidad_entrega INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_logistica_horarios_recepcion INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_logistica_espacio_descarga INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_logistica_organizacion_recibir INTEGER;

-- LOCAL (5 criterios, 1-5)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_local_exhibicion INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_local_orden_limpieza INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_local_iluminacion INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_local_espacio_disponible INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_local_ubicacion INTEGER;

-- COMPETENCIA (2 criterios, 1-5)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_competencia_presencia INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_competencia_participacion INTEGER;

-- POTENCIAL (3 criterios, 1-5)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_potencial_crecimiento INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_potencial_cantidad_clientes INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval_potencial_tamano_local INTEGER;

-- Puntaje final (suma de los 22 criterios, máx 110). Opcional: se puede calcular en app.
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS puntaje_final INTEGER;
