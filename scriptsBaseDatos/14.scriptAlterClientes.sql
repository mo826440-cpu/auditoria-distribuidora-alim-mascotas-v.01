-- ============================================================
-- 14. ALTER TABLA CLIENTES
-- Nuevos campos según Mejoras.md - Módulo Clientes.
-- Ejecutar después de 11 (referencias_zonas).
-- ============================================================

-- Nuevas columnas
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS nombre_representante VARCHAR(100);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS contacto VARCHAR(20);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS codigo_interno VARCHAR(50);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cuit VARCHAR(15);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS id_zona UUID REFERENCES referencias_zonas(id) ON DELETE SET NULL;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS calle VARCHAR(100);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS id_usuario_registro UUID REFERENCES usuarios(id) ON DELETE RESTRICT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Migrar datos existentes
UPDATE clientes SET
  nombre_representante = COALESCE(nombre_representante, nombre),
  contacto = COALESCE(contacto, telefono, ''),
  codigo_interno = COALESCE(codigo_interno, 'CLI-' || UPPER(SUBSTRING(id::text, 1, 8))),
  cuit = COALESCE(cuit, '00-00000000-0'),
  calle = COALESCE(calle, direccion, ''),
  numero = COALESCE(numero, 0)
WHERE nombre_representante IS NULL OR codigo_interno IS NULL OR calle IS NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_id_zona ON clientes(id_zona);

-- Código interno único por comercio
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_codigo_interno ON clientes(id_comercio, codigo_interno)
  WHERE codigo_interno IS NOT NULL AND codigo_interno != '';

COMMENT ON COLUMN clientes.nombre_representante IS 'Nombre del representante del comercio';
COMMENT ON COLUMN clientes.contacto IS 'Teléfono en formato E.164';
COMMENT ON COLUMN clientes.codigo_interno IS 'Código único por comercio (solo números y guiones)';
COMMENT ON COLUMN clientes.cuit IS 'Formato XX-XXXXXXXX-X';
COMMENT ON COLUMN clientes.id_zona IS 'Zona de referencias_zonas';
COMMENT ON COLUMN clientes.calle IS 'Calle de la dirección';
COMMENT ON COLUMN clientes.numero IS 'Número de la dirección';
