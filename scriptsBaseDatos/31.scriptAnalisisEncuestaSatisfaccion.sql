-- ============================================================
-- 31. ANÁLISIS FODA ENCUESTA DE SATISFACCIÓN
-- Campo de texto para guardar el análisis FODA de la encuesta de satisfacción.
-- ============================================================

ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS analisis_encuesta_satisfaccion TEXT;

COMMENT ON COLUMN registro_auditoria.analisis_encuesta_satisfaccion IS 'Análisis FODA (Fortalezas, Oportunidades, Debilidades, Amenazas) derivado de la encuesta de satisfacción del cliente.';
