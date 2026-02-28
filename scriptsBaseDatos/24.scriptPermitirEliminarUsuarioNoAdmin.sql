-- ============================================================
-- 24. PERMITIR ELIMINAR USUARIOS NO ADMINISTRADORES
-- registro_auditoria.id_auditor referencia usuarios(id). Por defecto ON DELETE RESTRICT
-- impide borrar un usuario que tenga auditorías. Este script cambia a ON DELETE SET NULL
-- y permite id_auditor NULL, para que al eliminar un usuario las auditorías queden
-- con auditor "sin asignar" (id_auditor NULL).
-- Ejecutar en Supabase SQL Editor. Luego podés eliminar usuarios no administrador
-- desde la app o desde Supabase (Auth o tabla usuarios).
-- ============================================================

-- Hacer id_auditor nullable
ALTER TABLE registro_auditoria
  ALTER COLUMN id_auditor DROP NOT NULL;

-- Reemplazar la FK para que al borrar un usuario se ponga id_auditor en NULL
ALTER TABLE registro_auditoria
  DROP CONSTRAINT IF EXISTS registro_auditoria_id_auditor_fkey;

ALTER TABLE registro_auditoria
  ADD CONSTRAINT registro_auditoria_id_auditor_fkey
  FOREIGN KEY (id_auditor) REFERENCES usuarios(id) ON DELETE SET NULL;

COMMENT ON COLUMN registro_auditoria.id_auditor IS 'Usuario que realizó la auditoría. NULL si el usuario fue eliminado.';
