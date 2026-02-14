-- ============================================================
-- 15. CUIT ÚNICO POR COMERCIO (clientes)
-- Evita CUIT duplicados entre clientes del mismo comercio.
-- Ejecutar después de 14 (scriptAlterClientes).
-- ============================================================

-- Paso 1: Corregir CUITs duplicados existentes (asigna placeholders únicos)
-- Mantiene el primer registro de cada grupo y actualiza los duplicados
WITH duplicados AS (
  SELECT id, cuit, id_comercio,
    ROW_NUMBER() OVER (PARTITION BY id_comercio, cuit ORDER BY created_at, id) AS rn
  FROM clientes
  WHERE cuit IS NOT NULL AND cuit != ''
),
a_corregir AS (
  SELECT id, '99-' || LPAD((ROW_NUMBER() OVER (ORDER BY id))::text, 8, '0') || '-9' AS nuevo_cuit
  FROM duplicados
  WHERE rn > 1
)
UPDATE clientes c
SET cuit = ac.nuevo_cuit
FROM a_corregir ac
WHERE c.id = ac.id;

-- Paso 2: Crear índice único
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_cuit_unique ON clientes(id_comercio, cuit)
  WHERE cuit IS NOT NULL AND cuit != '';

-- NOTA: Los clientes con CUIT 99-XXXXXXXX-9 son placeholders por duplicados.
-- Editarlos en la app para asignar el CUIT correcto.
