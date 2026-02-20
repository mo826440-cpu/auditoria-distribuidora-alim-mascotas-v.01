-- ============================================================
-- 18. ALTER TABLA CLIENTES - Vendedor y Transportista Frecuente
-- Agrega id_vendedor_frecuente e id_transportista_frecuente.
-- Ejecutar después de 16 (vendedores) y 17 (transportistas).
-- ============================================================

-- Vendedor frecuente: vendedor que representa la zona del cliente
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS id_vendedor_frecuente UUID REFERENCES vendedores(id) ON DELETE SET NULL;

-- Transportista frecuente
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS id_transportista_frecuente UUID REFERENCES transportistas(id) ON DELETE SET NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_id_vendedor_frecuente ON clientes(id_vendedor_frecuente);
CREATE INDEX IF NOT EXISTS idx_clientes_id_transportista_frecuente ON clientes(id_transportista_frecuente);

COMMENT ON COLUMN clientes.id_vendedor_frecuente IS 'Vendedor que representa la zona del cliente';
COMMENT ON COLUMN clientes.id_transportista_frecuente IS 'Transportista frecuente asignado al cliente';
