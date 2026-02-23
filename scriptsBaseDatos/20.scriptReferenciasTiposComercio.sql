-- ============================================================
-- 20. REFERENCIAS TIPOS DE COMERCIO
-- Tipos de comercio para clasificar clientes (ej: Minorista, Mayorista).
-- Ejecutar después de 14 (scriptAlterClientes).
-- ============================================================

CREATE TABLE IF NOT EXISTS referencias_tipos_comercio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_comercio UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    orden SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referencias_tipos_comercio_id_comercio ON referencias_tipos_comercio(id_comercio);
CREATE INDEX IF NOT EXISTS idx_referencias_tipos_comercio_nombre ON referencias_tipos_comercio(nombre);

COMMENT ON TABLE referencias_tipos_comercio IS 'Tipos de comercio para clasificar clientes (Minorista, Mayorista, etc.)';

-- Agregar columna a clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS id_tipo_comercio UUID REFERENCES referencias_tipos_comercio(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_clientes_id_tipo_comercio ON clientes(id_tipo_comercio);
COMMENT ON COLUMN clientes.id_tipo_comercio IS 'Tipo de comercio del cliente';

-- RLS
ALTER TABLE referencias_tipos_comercio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referencias_tipos_comercio_select" ON referencias_tipos_comercio;
CREATE POLICY "referencias_tipos_comercio_select" ON referencias_tipos_comercio
    FOR SELECT USING (id_comercio = get_user_comercio());

DROP POLICY IF EXISTS "referencias_tipos_comercio_insert" ON referencias_tipos_comercio;
CREATE POLICY "referencias_tipos_comercio_insert" ON referencias_tipos_comercio
    FOR INSERT WITH CHECK (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );

DROP POLICY IF EXISTS "referencias_tipos_comercio_update" ON referencias_tipos_comercio;
CREATE POLICY "referencias_tipos_comercio_update" ON referencias_tipos_comercio
    FOR UPDATE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );

DROP POLICY IF EXISTS "referencias_tipos_comercio_delete" ON referencias_tipos_comercio;
CREATE POLICY "referencias_tipos_comercio_delete" ON referencias_tipos_comercio
    FOR DELETE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );

-- Datos iniciales por defecto (solo si el comercio no tiene tipos cargados)
INSERT INTO referencias_tipos_comercio (id_comercio, nombre, orden)
SELECT c.id, v.nombre, v.orden
FROM comercios c
CROSS JOIN (VALUES 
  ('Pet shop', 1::smallint),
  ('Supermercado', 2::smallint),
  ('Minimercado', 3::smallint),
  ('Almacen', 4::smallint),
  ('Kiosco', 5::smallint),
  ('Veterinaria', 6::smallint)
) AS v(nombre, orden)
WHERE NOT EXISTS (SELECT 1 FROM referencias_tipos_comercio rt WHERE rt.id_comercio = c.id);
