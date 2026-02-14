-- ============================================================
-- 11. TABLA REFERENCIAS_ZONAS
-- Zonas con localidades de Córdoba. Módulo Referencias.
-- ============================================================

CREATE TABLE referencias_zonas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_comercio UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    localidades TEXT[] NOT NULL,
    observaciones TEXT,
    id_usuario_registro UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_referencias_zonas_id_comercio ON referencias_zonas(id_comercio);
CREATE INDEX idx_referencias_zonas_nombre ON referencias_zonas(nombre);
CREATE INDEX idx_referencias_zonas_localidades ON referencias_zonas USING GIN(localidades);

COMMENT ON TABLE referencias_zonas IS 'Zonas con localidades de Córdoba. Módulo Referencias.';
COMMENT ON COLUMN referencias_zonas.localidades IS 'Array de nombres de localidades/ciudades de Córdoba';
