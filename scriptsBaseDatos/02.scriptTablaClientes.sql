-- ============================================================
-- 02. TABLA CLIENTES
-- Clientes/puntos de venta de la distribuidora.
-- ============================================================

CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_comercio UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(50),
    email VARCHAR(255),
    localidad VARCHAR(255),
    provincia VARCHAR(255) DEFAULT 'Córdoba',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_clientes_id_comercio ON clientes(id_comercio);
CREATE INDEX idx_clientes_nombre ON clientes(nombre);
CREATE INDEX idx_clientes_activo ON clientes(activo);

COMMENT ON TABLE clientes IS 'Clientes o puntos de venta de la distribuidora';
