-- ============================================================
-- 16. ALTER TABLA VENDEDORES
-- Nuevos campos según Mejoras.md - Módulo Vendedores.
-- Ejecutar después de 11 (referencias_zonas).
-- ============================================================

-- Nuevas columnas
ALTER TABLE vendedores ADD COLUMN IF NOT EXISTS contacto VARCHAR(20);
ALTER TABLE vendedores ADD COLUMN IF NOT EXISTS codigo_interno VARCHAR(50);
ALTER TABLE vendedores ADD COLUMN IF NOT EXISTS dni VARCHAR(12);
ALTER TABLE vendedores ADD COLUMN IF NOT EXISTS id_zonas UUID[];
ALTER TABLE vendedores ADD COLUMN IF NOT EXISTS residencia VARCHAR(100);
ALTER TABLE vendedores ADD COLUMN IF NOT EXISTS observaciones TEXT;
ALTER TABLE vendedores ADD COLUMN IF NOT EXISTS id_usuario_registro UUID REFERENCES usuarios(id) ON DELETE RESTRICT;

-- Migrar datos existentes
UPDATE vendedores SET
  contacto = COALESCE(contacto, telefono, ''),
  codigo_interno = COALESCE(codigo_interno, 'VEN-' || UPPER(SUBSTRING(id::text, 1, 8))),
  residencia = COALESCE(residencia, '')
WHERE contacto IS NULL OR codigo_interno IS NULL;

-- Asignar DNI único a filas sin DNI
WITH numerados AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM vendedores WHERE dni IS NULL OR dni = ''
)
UPDATE vendedores v SET dni = '99.000.' || LPAD(n.rn::text, 3, '0')
FROM numerados n WHERE v.id = n.id;

-- Corregir DNIs duplicados existentes (formato XX.XXX.XXX)
WITH duplicados AS (
  SELECT id, dni,
    ROW_NUMBER() OVER (PARTITION BY id_comercio, dni ORDER BY created_at, id) AS rn
  FROM vendedores WHERE dni IS NOT NULL AND dni != ''
),
a_corregir AS (
  SELECT id, '99.' || LPAD((ROW_NUMBER() OVER (ORDER BY id))::text, 3, '0') || '.' || LPAD((ROW_NUMBER() OVER (ORDER BY id))::text, 3, '0') AS nuevo_dni
  FROM duplicados WHERE rn > 1
)
UPDATE vendedores v SET dni = ac.nuevo_dni
FROM a_corregir ac WHERE v.id = ac.id;

-- Índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendedores_codigo_interno ON vendedores(id_comercio, codigo_interno)
  WHERE codigo_interno IS NOT NULL AND codigo_interno != '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_vendedores_dni ON vendedores(id_comercio, dni)
  WHERE dni IS NOT NULL AND dni != '';

CREATE INDEX IF NOT EXISTS idx_vendedores_id_zonas ON vendedores USING GIN(id_zonas);

COMMENT ON COLUMN vendedores.contacto IS 'Teléfono en formato E.164';
COMMENT ON COLUMN vendedores.codigo_interno IS 'Código único por comercio (solo números y guiones)';
COMMENT ON COLUMN vendedores.dni IS 'DNI 8 dígitos formato XX.XXX.XXX';
COMMENT ON COLUMN vendedores.id_zonas IS 'Array de IDs de zonas (referencias_zonas)';
COMMENT ON COLUMN vendedores.residencia IS 'Dirección de residencia';
