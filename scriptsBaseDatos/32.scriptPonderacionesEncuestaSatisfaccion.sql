-- ============================================================
-- 32. PONDERACIONES ENCUESTA DE SATISFACCIÓN
-- Porcentajes por sección de la encuesta (5 secciones).
-- La suma debe ser 100. Por defecto en app: 20, 20, 20, 20, 20.
-- ============================================================

ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS ponderaciones_encuesta JSONB;

COMMENT ON COLUMN registro_auditoria.ponderaciones_encuesta IS 'Array de 5 números [%] por sección encuesta: Atención comercial, Entregas, Productos, Precios y pagos, Relación comercial. Suma 100. Ej: [20,20,20,20,20].';
