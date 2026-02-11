-- ============================================================
-- 04. TABLA TRANSPORTISTAS
-- Repartidores/delivery de la distribuidora.
-- ============================================================

CREATE TABLE transportistas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_comercio UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    vehiculo VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_transportistas_id_comercio ON transportistas(id_comercio);
CREATE INDEX idx_transportistas_nombre ON transportistas(nombre);
CREATE INDEX idx_transportistas_activo ON transportistas(activo);

COMMENT ON TABLE transportistas IS 'Transportistas/repartidores de la distribuidora';
