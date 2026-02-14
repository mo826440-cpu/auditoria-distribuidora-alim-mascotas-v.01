-- ============================================================
-- 12. TABLA REFERENCIAS_TRANSPORTES
-- Tipos de transporte (vehículos). Módulo Referencias.
-- ============================================================

CREATE TYPE tipo_transporte AS ENUM (
    'camion', 'utilitario', 'auto', 'camioneta', 'moto', 'acoplado', 'otro'
);

CREATE TABLE referencias_transportes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_comercio UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    tipo tipo_transporte NOT NULL,
    marca VARCHAR(255) NOT NULL,
    dominio_patente VARCHAR(50) NOT NULL,
    observaciones TEXT,
    id_usuario_registro UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_referencias_transportes_id_comercio ON referencias_transportes(id_comercio);
CREATE INDEX idx_referencias_transportes_marca ON referencias_transportes(marca);

COMMENT ON TABLE referencias_transportes IS 'Transportes/vehículos de referencia. Módulo Referencias.';
