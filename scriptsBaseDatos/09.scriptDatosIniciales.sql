-- ============================================================
-- 09. DATOS INICIALES
-- Comercio de Prueba 01 para demos y pruebas.
-- Ejecutar DESPUÉS de 00-07. El trigger (08) crea usuarios al registrarse.
-- ============================================================

-- Insertar Comercio de Prueba 01 (solo si la tabla está vacía)
INSERT INTO comercios (nombre)
SELECT 'Comercio de Prueba 01'
WHERE NOT EXISTS (SELECT 1 FROM comercios LIMIT 1);

-- Nota: Los usuarios se crean automáticamente al registrarse (trigger 08).
-- Los clientes, vendedores, transportistas y datos de prueba se cargan en ETAPA 5.
