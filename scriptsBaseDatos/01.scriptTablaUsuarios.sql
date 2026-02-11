-- ============================================================
-- 01. TABLA USUARIOS (perfiles de app)
-- Vinculada a auth.users de Supabase. Contiene rol y datos del perfil.
-- ============================================================

-- Enum para roles de usuario
CREATE TYPE rol_usuario AS ENUM ('administrador', 'auditor', 'visitante');

-- Tabla usuarios (perfil extendido de auth.users)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    id_comercio UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'visitante',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_usuarios_id_comercio ON usuarios(id_comercio);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Comentarios
COMMENT ON TABLE usuarios IS 'Usuarios de la app con rol y perfil. id = auth.users.id';
COMMENT ON COLUMN usuarios.rol IS 'administrador: todo | auditor: todo menos usuarios | visitante: solo dashboard';
