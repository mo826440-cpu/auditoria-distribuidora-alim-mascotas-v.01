-- ============================================================
-- 29. ENCUESTA DE SATISFACCIÓN DEL CLIENTE + PREGUNTAS CLAVE
-- Para el formulario de auditoría según diseño:
-- 1) Encuesta de satisfacción: 5 bloques con escala 3-2-1.
-- 2) Preguntas clave: 4 preguntas abiertas.
-- 3) Puntaje de satisfacción (0-72) para "Clasificación satisfacción" en tabla.
-- Compatible con registros existentes. No borra datos.
-- ============================================================

-- ---------------------------------------------------------------------------
-- ENCUESTA DE SATISFACCIÓN (escala 1, 2, 3 por criterio)
-- ---------------------------------------------------------------------------

-- ATENCIÓN COMERCIAL (6 criterios, total 18)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_atencion_trato_amabilidad SMALLINT CHECK (encuesta_atencion_trato_amabilidad IS NULL OR encuesta_atencion_trato_amabilidad BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_atencion_tiempos_respuesta SMALLINT CHECK (encuesta_atencion_tiempos_respuesta IS NULL OR encuesta_atencion_tiempos_respuesta BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_atencion_claridad_info SMALLINT CHECK (encuesta_atencion_claridad_info IS NULL OR encuesta_atencion_claridad_info BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_atencion_resolucion_problemas SMALLINT CHECK (encuesta_atencion_resolucion_problemas IS NULL OR encuesta_atencion_resolucion_problemas BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_atencion_frecuencia_contacto SMALLINT CHECK (encuesta_atencion_frecuencia_contacto IS NULL OR encuesta_atencion_frecuencia_contacto BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_atencion_percepcion_general SMALLINT CHECK (encuesta_atencion_percepcion_general IS NULL OR encuesta_atencion_percepcion_general BETWEEN 1 AND 3);

-- ENTREGAS (5 criterios, total 15)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_entregas_tiempos SMALLINT CHECK (encuesta_entregas_tiempos IS NULL OR encuesta_entregas_tiempos BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_entregas_pedido_completo SMALLINT CHECK (encuesta_entregas_pedido_completo IS NULL OR encuesta_entregas_pedido_completo BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_entregas_estado_pedido SMALLINT CHECK (encuesta_entregas_estado_pedido IS NULL OR encuesta_entregas_estado_pedido BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_entregas_facilidad_descarga SMALLINT CHECK (encuesta_entregas_facilidad_descarga IS NULL OR encuesta_entregas_facilidad_descarga BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_entregas_trato_transportista SMALLINT CHECK (encuesta_entregas_trato_transportista IS NULL OR encuesta_entregas_trato_transportista BETWEEN 1 AND 3);

-- PRODUCTOS (4 criterios, total 12)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_productos_calidad SMALLINT CHECK (encuesta_productos_calidad IS NULL OR encuesta_productos_calidad BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_productos_variedad SMALLINT CHECK (encuesta_productos_variedad IS NULL OR encuesta_productos_variedad BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_productos_disponibilidad_stock SMALLINT CHECK (encuesta_productos_disponibilidad_stock IS NULL OR encuesta_productos_disponibilidad_stock BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_productos_rotacion SMALLINT CHECK (encuesta_productos_rotacion IS NULL OR encuesta_productos_rotacion BETWEEN 1 AND 3);

-- PRECIOS Y PAGOS (4 criterios, total 12)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_precios_competitividad SMALLINT CHECK (encuesta_precios_competitividad IS NULL OR encuesta_precios_competitividad BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_precios_promociones SMALLINT CHECK (encuesta_precios_promociones IS NULL OR encuesta_precios_promociones BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_precios_condiciones_pago SMALLINT CHECK (encuesta_precios_condiciones_pago IS NULL OR encuesta_precios_condiciones_pago BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_precios_relacion_calidad SMALLINT CHECK (encuesta_precios_relacion_calidad IS NULL OR encuesta_precios_relacion_calidad BETWEEN 1 AND 3);

-- RELACIÓN COMERCIAL - encuesta (5 criterios, total 15)
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_relacion_facilidad_pedidos SMALLINT CHECK (encuesta_relacion_facilidad_pedidos IS NULL OR encuesta_relacion_facilidad_pedidos BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_relacion_comunicacion SMALLINT CHECK (encuesta_relacion_comunicacion IS NULL OR encuesta_relacion_comunicacion BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_relacion_resolucion_reclamos SMALLINT CHECK (encuesta_relacion_resolucion_reclamos IS NULL OR encuesta_relacion_resolucion_reclamos BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_relacion_satisfaccion_general SMALLINT CHECK (encuesta_relacion_satisfaccion_general IS NULL OR encuesta_relacion_satisfaccion_general BETWEEN 1 AND 3);
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS encuesta_relacion_recomendacion SMALLINT CHECK (encuesta_relacion_recomendacion IS NULL OR encuesta_relacion_recomendacion BETWEEN 1 AND 3);

-- Puntaje total encuesta satisfacción (máx 72). Se puede calcular en app o guardar al guardar.
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS puntaje_satisfaccion INTEGER CHECK (puntaje_satisfaccion IS NULL OR (puntaje_satisfaccion >= 0 AND puntaje_satisfaccion <= 72));

-- ---------------------------------------------------------------------------
-- PREGUNTAS CLAVE (texto libre)
-- ---------------------------------------------------------------------------
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS pregunta_clave_mejorar TEXT;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS pregunta_clave_productos_agregar TEXT;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS pregunta_clave_problema_reciente TEXT;
ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS pregunta_clave_otra_distribuidora TEXT;

-- ---------------------------------------------------------------------------
-- COMENTARIOS
-- ---------------------------------------------------------------------------
COMMENT ON COLUMN registro_auditoria.puntaje_satisfaccion IS 'Suma de la encuesta de satisfacción (24 criterios x 3 puntos máx = 72). Para columna Clasificación satisfacción en tabla de auditorías.';
COMMENT ON COLUMN registro_auditoria.pregunta_clave_mejorar IS 'Pregunta clave: ¿Qué deberíamos mejorar?';
COMMENT ON COLUMN registro_auditoria.pregunta_clave_productos_agregar IS 'Pregunta clave: ¿Qué productos te gustaría que agreguemos?';
COMMENT ON COLUMN registro_auditoria.pregunta_clave_problema_reciente IS 'Pregunta clave: ¿Tuviste algún problema reciente?';
COMMENT ON COLUMN registro_auditoria.pregunta_clave_otra_distribuidora IS 'Pregunta clave: ¿Qué otra distribuidora estás trabajando?';
