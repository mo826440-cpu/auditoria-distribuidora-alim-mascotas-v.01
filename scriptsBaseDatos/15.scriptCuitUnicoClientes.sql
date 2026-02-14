-- ============================================================
-- 15. CUIT ÚNICO POR COMERCIO (clientes)
-- Evita CUIT duplicados entre clientes del mismo comercio.
-- Ejecutar después de 14 (scriptAlterClientes).
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_cuit_unique ON clientes(id_comercio, cuit)
  WHERE cuit IS NOT NULL AND cuit != '';
