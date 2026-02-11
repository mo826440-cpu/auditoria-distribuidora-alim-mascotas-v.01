-- ============================================================
-- 00. TABLA COMERCIOS
-- Base para multi-comercio. Todas las tablas referencian id_comercio.
-- ============================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla comercios (tenants / empresas distribuidoras)
CREATE TABLE comercios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas por nombre
CREATE INDEX idx_comercios_nombre ON comercios(nombre);

-- Comentarios
COMMENT ON TABLE comercios IS 'Empresas/comercios que usan el sistema (multi-tenant)';
COMMENT ON COLUMN comercios.nombre IS 'Nombre del comercio o distribuidora';
