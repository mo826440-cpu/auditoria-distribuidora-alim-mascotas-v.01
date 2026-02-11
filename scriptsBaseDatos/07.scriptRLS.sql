-- ============================================================
-- 07. ROW LEVEL SECURITY (RLS)
-- Aislamiento por id_comercio. Políticas por rol.
-- ============================================================

-- Función auxiliar: obtiene id_comercio del usuario logueado
CREATE OR REPLACE FUNCTION get_user_comercio()
RETURNS UUID AS $$
    SELECT id_comercio FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Función auxiliar: obtiene rol del usuario logueado
CREATE OR REPLACE FUNCTION get_user_rol()
RETURNS rol_usuario AS $$
    SELECT rol FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Habilitar RLS en todas las tablas
ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE programacion_visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_auditoria ENABLE ROW LEVEL SECURITY;

-- ========== COMERCIOS ==========
-- Solo usuarios del mismo comercio pueden ver
CREATE POLICY "comercios_select" ON comercios
    FOR SELECT USING (id = get_user_comercio());

-- Solo admin puede insertar comercios (para multi-comercio futuro)
CREATE POLICY "comercios_insert" ON comercios
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ========== USUARIOS ==========
-- Ver usuarios del mismo comercio
CREATE POLICY "usuarios_select" ON usuarios
    FOR SELECT USING (id_comercio = get_user_comercio());

-- Solo administrador puede insertar/actualizar/eliminar usuarios
CREATE POLICY "usuarios_insert" ON usuarios
    FOR INSERT WITH CHECK (
        id_comercio = get_user_comercio() AND get_user_rol() = 'administrador'
    );
CREATE POLICY "usuarios_update" ON usuarios
    FOR UPDATE USING (
        id_comercio = get_user_comercio() AND get_user_rol() = 'administrador'
    );
CREATE POLICY "usuarios_delete" ON usuarios
    FOR DELETE USING (
        id_comercio = get_user_comercio() AND get_user_rol() = 'administrador'
    );

-- Permitir que un usuario actualice su propio perfil (nombre, etc.) - no rol
CREATE POLICY "usuarios_update_self" ON usuarios
    FOR UPDATE USING (id = auth.uid());

-- ========== CLIENTES ==========
CREATE POLICY "clientes_select" ON clientes
    FOR SELECT USING (id_comercio = get_user_comercio());
CREATE POLICY "clientes_insert" ON clientes
    FOR INSERT WITH CHECK (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "clientes_update" ON clientes
    FOR UPDATE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "clientes_delete" ON clientes
    FOR DELETE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );

-- ========== VENDEDORES ==========
CREATE POLICY "vendedores_select" ON vendedores
    FOR SELECT USING (id_comercio = get_user_comercio());
CREATE POLICY "vendedores_insert" ON vendedores
    FOR INSERT WITH CHECK (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "vendedores_update" ON vendedores
    FOR UPDATE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "vendedores_delete" ON vendedores
    FOR DELETE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );

-- ========== TRANSPORTISTAS ==========
CREATE POLICY "transportistas_select" ON transportistas
    FOR SELECT USING (id_comercio = get_user_comercio());
CREATE POLICY "transportistas_insert" ON transportistas
    FOR INSERT WITH CHECK (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "transportistas_update" ON transportistas
    FOR UPDATE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "transportistas_delete" ON transportistas
    FOR DELETE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );

-- ========== PROGRAMACIÓN VISITAS ==========
CREATE POLICY "programacion_visitas_select" ON programacion_visitas
    FOR SELECT USING (id_comercio = get_user_comercio());
CREATE POLICY "programacion_visitas_insert" ON programacion_visitas
    FOR INSERT WITH CHECK (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "programacion_visitas_update" ON programacion_visitas
    FOR UPDATE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "programacion_visitas_delete" ON programacion_visitas
    FOR DELETE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );

-- ========== REGISTRO AUDITORÍA ==========
-- Visitante: solo SELECT (para dashboard)
-- Auditor y Admin: SELECT, INSERT, UPDATE, DELETE
CREATE POLICY "registro_auditoria_select" ON registro_auditoria
    FOR SELECT USING (id_comercio = get_user_comercio());
CREATE POLICY "registro_auditoria_insert" ON registro_auditoria
    FOR INSERT WITH CHECK (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "registro_auditoria_update" ON registro_auditoria
    FOR UPDATE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "registro_auditoria_delete" ON registro_auditoria
    FOR DELETE USING (
        id_comercio = get_user_comercio() AND get_user_rol() = 'administrador'
    );
