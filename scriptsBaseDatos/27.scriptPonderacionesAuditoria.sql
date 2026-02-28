-- ============================================================
-- 27. PONDERACIONES POR SESIÓN EN REGISTRO AUDITORÍA
-- Porcentajes por sección (orden: RELACIÓN COMERCIAL, VENTAS, LOGÍSTICA,
-- LOCAL, COMPETENCIA, POTENCIAL). La suma debe ser 100.
-- Por defecto: 20, 20, 20, 20, 10, 10. NULL = usar defaults en la app.
-- ============================================================

ALTER TABLE registro_auditoria ADD COLUMN IF NOT EXISTS ponderaciones JSONB;

COMMENT ON COLUMN registro_auditoria.ponderaciones IS 'Array de 6 números [%] por sección: Relación comercial, Ventas, Logística, Local, Competencia, Potencial. Suma 100. Ej: [20,20,20,20,10,10].';
