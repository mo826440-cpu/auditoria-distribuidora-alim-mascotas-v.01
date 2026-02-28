-- ============================================================
-- 30. EVALUACIÓN DEL CLIENTE EN ESCALA 3-2-1 (según diseño captura)
-- 5 secciones: RELACIÓN COMERCIAL (5 crit), VENTAS (4), LOGÍSTICA (4),
-- LOCAL (4), POTENCIAL (5). Total 22 criterios, máx 66 puntos.
-- Se agregan columnas eval3_* para no romper datos existentes (eval_* 1-5).
-- ============================================================

-- RELACIÓN COMERCIAL (5 criterios, 15 pts máx)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_relacion_trato_vendedor SMALLINT CHECK (eval3_relacion_trato_vendedor IS NULL OR eval3_relacion_trato_vendedor BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_relacion_trato_empresa SMALLINT CHECK (eval3_relacion_trato_empresa IS NULL OR eval3_relacion_trato_empresa BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_relacion_comunicacion SMALLINT CHECK (eval3_relacion_comunicacion IS NULL OR eval3_relacion_comunicacion BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_relacion_resolucion_problemas SMALLINT CHECK (eval3_relacion_resolucion_problemas IS NULL OR eval3_relacion_resolucion_problemas BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_relacion_cumplimiento_pagos SMALLINT CHECK (eval3_relacion_cumplimiento_pagos IS NULL OR eval3_relacion_cumplimiento_pagos BETWEEN 1 AND 3);

-- VENTAS (4 criterios, 12 pts máx)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_ventas_frecuencia_compra SMALLINT CHECK (eval3_ventas_frecuencia_compra IS NULL OR eval3_ventas_frecuencia_compra BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_ventas_volumen SMALLINT CHECK (eval3_ventas_volumen IS NULL OR eval3_ventas_volumen BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_ventas_rotacion SMALLINT CHECK (eval3_ventas_rotacion IS NULL OR eval3_ventas_rotacion BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_ventas_participacion_productos SMALLINT CHECK (eval3_ventas_participacion_productos IS NULL OR eval3_ventas_participacion_productos BETWEEN 1 AND 3);

-- LOGÍSTICA (4 criterios, 12 pts máx)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_logistica_recepcion_pedidos SMALLINT CHECK (eval3_logistica_recepcion_pedidos IS NULL OR eval3_logistica_recepcion_pedidos BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_logistica_trato_transportista SMALLINT CHECK (eval3_logistica_trato_transportista IS NULL OR eval3_logistica_trato_transportista BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_logistica_espacio_descarga SMALLINT CHECK (eval3_logistica_espacio_descarga IS NULL OR eval3_logistica_espacio_descarga BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_logistica_organizacion_recibir SMALLINT CHECK (eval3_logistica_organizacion_recibir IS NULL OR eval3_logistica_organizacion_recibir BETWEEN 1 AND 3);

-- LOCAL (4 criterios, 12 pts máx)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_local_estado SMALLINT CHECK (eval3_local_estado IS NULL OR eval3_local_estado BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_local_exhibicion SMALLINT CHECK (eval3_local_exhibicion IS NULL OR eval3_local_exhibicion BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_local_espacio SMALLINT CHECK (eval3_local_espacio IS NULL OR eval3_local_espacio BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_local_iluminacion SMALLINT CHECK (eval3_local_iluminacion IS NULL OR eval3_local_iluminacion BETWEEN 1 AND 3);

-- POTENCIAL (5 criterios, 15 pts máx)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_potencial_ubicacion SMALLINT CHECK (eval3_potencial_ubicacion IS NULL OR eval3_potencial_ubicacion BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_potencial_cantidad_clientes SMALLINT CHECK (eval3_potencial_cantidad_clientes IS NULL OR eval3_potencial_cantidad_clientes BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_potencial_crecimiento SMALLINT CHECK (eval3_potencial_crecimiento IS NULL OR eval3_potencial_crecimiento BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_potencial_tamano_local SMALLINT CHECK (eval3_potencial_tamano_local IS NULL OR eval3_potencial_tamano_local BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS eval3_potencial_presencia_competencia SMALLINT CHECK (eval3_potencial_presencia_competencia IS NULL OR eval3_potencial_presencia_competencia BETWEEN 1 AND 3);

COMMENT ON COLUMN registro_auditoria.eval3_relacion_trato_vendedor IS 'Evaluación 3-2-1: Trato con el vendedor. Máx 66 pts total evaluación.';
