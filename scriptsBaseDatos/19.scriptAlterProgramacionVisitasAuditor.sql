-- ============================================================
-- 19. ALTER TABLA PROGRAMACIÓN VISITAS - Auditor Responsable
-- Agrega id_auditor para asignar el auditor responsable de cada visita.
-- Ejecutar después de 05 (programacion_visitas) y 01 (usuarios).
-- ============================================================

-- Auditor responsable: usuario que realizará o supervisa la visita
ALTER TABLE programacion_visitas ADD COLUMN IF NOT EXISTS id_auditor UUID REFERENCES usuarios(id) ON DELETE SET NULL;

-- Índice para consultas por auditor
CREATE INDEX IF NOT EXISTS idx_programacion_visitas_id_auditor ON programacion_visitas(id_auditor);

COMMENT ON COLUMN programacion_visitas.id_auditor IS 'Auditor responsable de la visita';
