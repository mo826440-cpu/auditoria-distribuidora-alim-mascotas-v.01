-- ============================================================
-- 28. ESTADO DE AUDITORÍA (COMPLETA / PARCIAL)
-- Para distinguir auditorías finalizadas de las guardadas como parciales.
-- ============================================================

ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS estado_auditoria VARCHAR(20) DEFAULT 'completa';

COMMENT ON COLUMN registro_auditoria.estado_auditoria IS 'completa = finalizada con todos los criterios; parcial = guardada con al menos un criterio para completar después.';
