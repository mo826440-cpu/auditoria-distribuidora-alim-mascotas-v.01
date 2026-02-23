-- ============================================================
-- 21. ALTER REGISTRO AUDITORÍA - Modelo 360°
-- Agrega columnas para evaluación 360° (1-4: Malo, Regular, Bueno, Muy Bueno)
-- Compatible con registros existentes. No borra datos.
-- ============================================================

-- SECCIÓN 2 - Cliente evalúa Vendedor
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_vendedor_pasa_regularmente INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_vendedor_responde INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_vendedor_cumple INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_vendedor_promos INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_vendedor_entendimiento INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_vendedor_actitud INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_vendedor_facilidad INTEGER;

-- SECCIÓN 3 - Cliente evalúa Transporte
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_transporte_horario INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_transporte_avisa INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_transporte_trato INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_transporte_completo INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_transporte_estado INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_transporte_descarga INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS cliente_eval_transporte_actitud INTEGER;

-- SECCIÓN 4 - Vendedor evalúa Cliente
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS vendedor_eval_cliente_atencion INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS vendedor_eval_cliente_predisposicion INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS vendedor_eval_cliente_pedidos INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS vendedor_eval_cliente_condiciones INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS vendedor_eval_cliente_sugerencias INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS vendedor_eval_cliente_exhibicion INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS vendedor_eval_cliente_orden INTEGER;

-- SECCIÓN 5 - Transporte evalúa Cliente
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS transporte_eval_cliente_atencion INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS transporte_eval_cliente_descarga INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS transporte_eval_cliente_firma INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS transporte_eval_cliente_horarios INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS transporte_eval_cliente_espacio INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS transporte_eval_cliente_demoras INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS transporte_eval_cliente_predisposicion INTEGER;

-- SECCIÓN 6 - Vendedor evalúa Transporte
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS vendedor_eval_transporte_comunicacion INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS vendedor_eval_transporte_cumplimiento INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS vendedor_eval_transporte_avisos INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS vendedor_eval_transporte_coordinacion INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS vendedor_eval_transporte_errores INTEGER;

-- SECCIÓN 7 - Transporte evalúa Vendedor
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS transporte_eval_vendedor_claridad INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS transporte_eval_vendedor_correctos INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS transporte_eval_vendedor_cambios INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS transporte_eval_vendedor_coordinacion INTEGER;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS transporte_eval_vendedor_confusion INTEGER;

-- Observaciones generales (Datos de la Auditoría)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS observaciones_generales TEXT;

-- Resultado 360° (Excelente, Bueno, Regular, Malo)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS resultado_360 TEXT;

-- Puntajes 360° calculados (decimales 1.0-4.0)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS puntuacion_cliente_360 NUMERIC(3,1);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS puntuacion_vendedor_360 NUMERIC(3,1);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS puntuacion_repartidor_360 NUMERIC(3,1);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS puntuacion_general_360 NUMERIC(3,1);
