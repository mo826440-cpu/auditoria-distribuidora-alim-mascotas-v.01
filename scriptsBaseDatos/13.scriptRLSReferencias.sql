-- ============================================================
-- 13. RLS PARA MÓDULO REFERENCIAS
-- Ejecutar después de 11 y 12.
-- ============================================================

ALTER TABLE referencias_zonas ENABLE ROW LEVEL SECURITY;
ALTER TABLE referencias_transportes ENABLE ROW LEVEL SECURITY;

-- ========== REFERENCIAS_ZONAS ==========
CREATE POLICY "referencias_zonas_select" ON referencias_zonas
    FOR SELECT USING (id_comercio = get_user_comercio());
CREATE POLICY "referencias_zonas_insert" ON referencias_zonas
    FOR INSERT WITH CHECK (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "referencias_zonas_update" ON referencias_zonas
    FOR UPDATE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "referencias_zonas_delete" ON referencias_zonas
    FOR DELETE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );

-- ========== REFERENCIAS_TRANSPORTES ==========
CREATE POLICY "referencias_transportes_select" ON referencias_transportes
    FOR SELECT USING (id_comercio = get_user_comercio());
CREATE POLICY "referencias_transportes_insert" ON referencias_transportes
    FOR INSERT WITH CHECK (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "referencias_transportes_update" ON referencias_transportes
    FOR UPDATE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
CREATE POLICY "referencias_transportes_delete" ON referencias_transportes
    FOR DELETE USING (
        id_comercio = get_user_comercio() AND get_user_rol() IN ('administrador', 'auditor')
    );
