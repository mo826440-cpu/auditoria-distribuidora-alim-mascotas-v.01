-- ============================================================
-- 25. CARGAR CLIENTES DESDE EXPORT (Excel/CSV)
-- Mapeo: nombre_cliente -> nombre, ciudad -> localidad, estado -> provincia.
-- id_comercio: se usa el primer comercio existente. Ajustar si tenés varios.
-- Valores '-' en tel/email/etc. se insertan como NULL.
-- Sí/No -> true/false.
-- ============================================================

-- Opción A: Si tenés un solo comercio, esto toma su ID.
DO $$
DECLARE
  v_comercio_id UUID;
BEGIN
  SELECT id INTO v_comercio_id FROM comercios ORDER BY created_at LIMIT 1;
  IF v_comercio_id IS NULL THEN
    RAISE EXCEPTION 'No hay ningún comercio. Ejecutá antes el script de comercios/datos iniciales.';
  END IF;

  INSERT INTO clientes (id_comercio, nombre, direccion, telefono, email, localidad, provincia, activo, created_at, updated_at)
  VALUES
    (v_comercio_id, 'M.O.A.C.M', '2 SUR 1714', '2222370002', 'info@moacm.com', 'PUEBLA', 'PUEBLA', true, '2023-11-20 23:58:31.967+00'::timestamptz, '2023-11-20 23:58:31.967+00'::timestamptz),
    (v_comercio_id, 'AYALA HERRERA', 'CALLE CERRADA DE LA LOMA NO. 11', '2222204561', 'contacto@ayalaherrera.com.mx', 'PUEBLA', 'PUEBLA', true, '2023-11-20 23:58:31.967+00'::timestamptz, '2023-11-20 23:58:31.967+00'::timestamptz),
    (v_comercio_id, 'AGUILAR CHAVEZ', '2 PONIENTE 3505', '2228889900', NULL, 'PUEBLA PUE', 'PUEBLA', true, '2023-11-20 23:58:31.967+00'::timestamptz, '2023-11-20 23:58:31.967+00'::timestamptz),
    (v_comercio_id, 'HERNANDEZ FLORES', '4 PONIENTE NO.301 INTERIOR 101', '2221234567', NULL, 'PUEBLA', 'PUEBLA', true, '2023-11-20 23:58:31.967+00'::timestamptz, '2023-11-20 23:58:31.967+00'::timestamptz),
    (v_comercio_id, 'MUEBLES EL GOMEZ', 'CALLE 12 PTE NO. 301, COL. CENTRO', NULL, 'ventas@mueblesgomez.com', 'PUEBLA', 'PUEBLA', true, '2023-11-20 23:58:31.967+00'::timestamptz, '2023-11-20 23:58:31.967+00'::timestamptz);
END $$;

-- ============================================================
-- Para cargar TODOS los datos de tu export (100+ filas):
--
-- 1) Exportá la captura/Excel a CSV (columnas: nombre_cliente, direccion, cp, ciudad, estado, telefono, email, activo, fecha_registro).
-- 2) En Supabase: Table Editor -> clientes -> Import data from CSV.
--    O creá una tabla temporal, subí el CSV, y luego:
--
--    INSERT INTO clientes (id_comercio, nombre, direccion, telefono, email, localidad, provincia, activo, created_at, updated_at)
--    SELECT
--      (SELECT id FROM comercios LIMIT 1),
--      NULLIF(TRIM(nombre_cliente), ''),
--      NULLIF(TRIM(direccion), ''),
--      NULLIF(NULLIF(TRIM(telefono), '-'), ''),
--      NULLIF(NULLIF(TRIM(email), '-'), ''),
--      NULLIF(TRIM(ciudad), ''),
--      NULLIF(NULLIF(TRIM(estado), '-'), ''),
--      CASE WHEN LOWER(TRIM(activo)) IN ('sí','si','s','true','1') THEN true ELSE false END,
--      COALESCE(fecha_registro::timestamptz, NOW()),
--      COALESCE(fecha_actualizacion::timestamptz, NOW())
--    FROM temp_clientes_import;
--
-- 3) Si preferís pegar más filas aquí, copiá la línea de VALUES (desde el paréntesis) y reemplazá
--    nombre, direccion, telefono, email, localidad, provincia, activo, created_at, updated_at
--    usando NULL para vacíos y true/false para activo.
-- ============================================================
