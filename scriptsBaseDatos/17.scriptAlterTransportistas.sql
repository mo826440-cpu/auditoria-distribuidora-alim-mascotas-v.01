-- ============================================================
-- 17. ALTER TABLA TRANSPORTISTAS
-- Nuevos campos según Mejoras.md - Módulo Transportistas.
-- Ejecutar después de 11 (referencias_zonas).
-- ============================================================

-- Nuevas columnas
ALTER TABLE transportistas ADD COLUMN IF NOT EXISTS contacto VARCHAR(20);
ALTER TABLE transportistas ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE transportistas ADD COLUMN IF NOT EXISTS codigo_interno VARCHAR(50);
ALTER TABLE transportistas ADD COLUMN IF NOT EXISTS dni VARCHAR(12);
ALTER TABLE transportistas ADD COLUMN IF NOT EXISTS id_zonas UUID[];
ALTER TABLE transportistas ADD COLUMN IF NOT EXISTS residencia VARCHAR(100);
ALTER TABLE transportistas ADD COLUMN IF NOT EXISTS observaciones TEXT;
ALTER TABLE transportistas ADD COLUMN IF NOT EXISTS id_usuario_registro UUID REFERENCES usuarios(id) ON DELETE RESTRICT;

-- Migrar datos existentes
UPDATE transportistas SET
  contacto = COALESCE(contacto, telefono, ''),
  codigo_interno = COALESCE(codigo_interno, 'TRA-' || UPPER(SUBSTRING(id::text, 1, 8))),
  residencia = COALESCE(residencia, '')
WHERE contacto IS NULL OR codigo_interno IS NULL;

-- Asignar DNI único a filas sin DNI
WITH numerados AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM transportistas WHERE dni IS NULL OR dni = ''
)
UPDATE transportistas t SET dni = '99.000.' || LPAD(n.rn::text, 3, '0')
FROM numerados n WHERE t.id = n.id;

-- Corregir DNIs duplicados existentes
WITH duplicados AS (
  SELECT id, dni,
    ROW_NUMBER() OVER (PARTITION BY id_comercio, dni ORDER BY created_at, id) AS rn
  FROM transportistas WHERE dni IS NOT NULL AND dni != ''
),
a_corregir AS (
  SELECT id, '99.' || LPAD((ROW_NUMBER() OVER (ORDER BY id))::text, 3, '0') || '.' || LPAD((ROW_NUMBER() OVER (ORDER BY id))::text, 3, '0') AS nuevo_dni
  FROM duplicados WHERE rn > 1
)
UPDATE transportistas t SET dni = ac.nuevo_dni
FROM a_corregir ac WHERE t.id = ac.id;

-- Índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS idx_transportistas_codigo_interno ON transportistas(id_comercio, codigo_interno)
  WHERE codigo_interno IS NOT NULL AND codigo_interno != '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_transportistas_dni ON transportistas(id_comercio, dni)
  WHERE dni IS NOT NULL AND dni != '';

CREATE INDEX IF NOT EXISTS idx_transportistas_id_zonas ON transportistas USING GIN(id_zonas);

COMMENT ON COLUMN transportistas.contacto IS 'Teléfono en formato E.164';
COMMENT ON COLUMN transportistas.codigo_interno IS 'Código único por comercio (solo números y guiones)';
COMMENT ON COLUMN transportistas.dni IS 'DNI 8 dígitos formato XX.XXX.XXX';
COMMENT ON COLUMN transportistas.id_zonas IS 'Array de IDs de zonas (referencias_zonas)';
COMMENT ON COLUMN transportistas.residencia IS 'Dirección de residencia';
