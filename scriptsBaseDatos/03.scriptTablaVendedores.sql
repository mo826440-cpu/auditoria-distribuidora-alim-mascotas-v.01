-- ============================================================
-- 03. TABLA VENDEDORES
-- Fuerza de ventas de la distribuidora.
-- ============================================================

CREATE TABLE vendedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_comercio UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_vendedores_id_comercio ON vendedores(id_comercio);
CREATE INDEX idx_vendedores_nombre ON vendedores(nombre);
CREATE INDEX idx_vendedores_activo ON vendedores(activo);

COMMENT ON TABLE vendedores IS 'Vendedores/fuerza de ventas de la distribuidora';
