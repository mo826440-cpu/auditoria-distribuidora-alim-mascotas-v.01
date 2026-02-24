-- ============================================================
-- 23. DATOS DE PRUEBA - Visitas pendientes, realizadas y auditorías
-- Genera 5 visitas PENDIENTES y 10 REALIZADAS con su registro de auditoría.
-- Usa los clientes, vendedores, transportistas y usuarios existentes.
--
-- DATOS DE REFERENCIA (según tu sistema):
--   Usuarios:      Martin Ortiz (Administrador), Gabriel Ortiz (Auditor)
--   Vendedores:    Jordan Belfort (1-000), Chris Gardner (1-001)
--   Transportistas: Franco Colapinto (1-000), Max Verstappen (1-001)
--   Clientes:      Comercio 01 (Pet shop), Comercio 02 (Supermerkado), Comercio 03 (Veterinaria)
--
-- El script asigna auditorías al primer usuario con rol Auditor (Gabriel Ortiz).
-- Reparte visitas entre clientes y vendedores por orden de nombre.
-- Transportista: se usa el transportista frecuente de cada cliente.
--
-- Ejecutar en Supabase SQL Editor. Requiere: comercio, usuarios, clientes, vendedores.
-- ============================================================

-- ---------- 1. VISITAS PENDIENTES (5) ----------
-- Próximos 5 días. Rotación Comercio 01 → 02 → 03 y Jordan Belfort → Chris Gardner.
INSERT INTO programacion_visitas (
  id_comercio,
  id_cliente,
  id_vendedor,
  fecha_visita,
  hora_inicio,
  hora_fin,
  observaciones,
  estado
)
SELECT
  (SELECT id_comercio FROM clientes WHERE activo = true LIMIT 1),
  (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY nombre) AS rn FROM clientes WHERE activo = true) c WHERE rn = 1 + ((s.n - 1) % GREATEST(1, (SELECT COUNT(*)::int FROM clientes WHERE activo = true))) LIMIT 1),
  (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY nombre) AS rn FROM vendedores) v WHERE rn = 1 + ((s.n - 1) % GREATEST(1, (SELECT COUNT(*)::int FROM vendedores))) LIMIT 1),
  (CURRENT_DATE + (s.n || ' days')::interval)::date,
  '09:00'::time,
  '12:00'::time,
  'Visita de prueba pendiente ' || s.n,
  'pendiente'
FROM generate_series(1, 5) AS s(n);

-- ---------- 2. VISITAS REALIZADAS (10) + 10 AUDITORÍAS ----------
-- Puntajes variados (72 a 95) para que el dashboard muestre distintos resultados.
DO $$
DECLARE
  v_comercio UUID;
  v_auditor UUID;
  v_cliente UUID;
  v_vendedor UUID;
  v_transportista UUID;
  v_visita_id UUID;
  v_fecha DATE;
  n_clientes INT;
  n_vendedores INT;
  i INT;
  cliente_idx INT;
  vendedor_idx INT;
  v_puntaje INT;
  v_clasif clasificacion_cliente;
  v_analisis TEXT;
  v_obs TEXT;
BEGIN
  SELECT id_comercio INTO v_comercio FROM clientes WHERE activo = true LIMIT 1;
  IF v_comercio IS NULL THEN
    RAISE EXCEPTION 'No hay clientes activos.';
  END IF;

  -- Preferir usuario con rol Auditor (ej. Gabriel Ortiz) para las auditorías
  SELECT id INTO v_auditor FROM usuarios
  WHERE rol IN ('administrador', 'auditor')
  ORDER BY CASE WHEN rol = 'auditor' THEN 0 ELSE 1 END, nombre
  LIMIT 1;
  IF v_auditor IS NULL THEN
    RAISE EXCEPTION 'No hay usuarios con rol administrador o auditor.';
  END IF;

  SELECT COUNT(*)::int INTO n_clientes FROM clientes WHERE activo = true;
  SELECT COUNT(*)::int INTO n_vendedores FROM vendedores;
  IF n_clientes = 0 OR n_vendedores = 0 THEN
    RAISE EXCEPTION 'Se necesitan al menos 1 cliente activo y 1 vendedor.';
  END IF;

  FOR i IN 1..10
  LOOP
    cliente_idx := 1 + ((i - 1) % n_clientes);
    vendedor_idx := 1 + ((i - 1) % n_vendedores);

    SELECT id INTO v_cliente FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY nombre) AS rn FROM clientes WHERE activo = true) c WHERE rn = cliente_idx LIMIT 1;
    SELECT id INTO v_vendedor FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY nombre) AS rn FROM vendedores) v WHERE rn = vendedor_idx LIMIT 1;
    SELECT id_transportista_frecuente INTO v_transportista FROM clientes WHERE id = v_cliente LIMIT 1;

    v_fecha := (CURRENT_DATE - ((i * 4) || ' days')::interval)::date;

    -- Puntajes variados: 72, 75, 78, 82, 85, 88, 88, 90, 92, 95 (dashboard con variedad)
    v_puntaje := (ARRAY[72,75,78,82,85,88,88,90,92,95])[i];
    IF v_puntaje >= 90 THEN v_clasif := 'estrategico'::clasificacion_cliente;
    ELSIF v_puntaje >= 70 THEN v_clasif := 'potencial'::clasificacion_cliente;
    ELSIF v_puntaje >= 50 THEN v_clasif := 'regular'::clasificacion_cliente;
    ELSE v_clasif := 'critico'::clasificacion_cliente;
    END IF;

    v_analisis := 'Fortalezas: Buen nivel en relación comercial y logística. Oportunidades: Mejorar exhibición. Amenazas: Competencia en zona. Puntaje ' || v_puntaje || '.';
    v_obs := 'Auditoría de prueba #' || i || ' – visita realizada.';

    INSERT INTO programacion_visitas (
      id_comercio, id_cliente, id_vendedor, fecha_visita, hora_inicio, hora_fin, observaciones, estado
    ) VALUES (
      v_comercio, v_cliente, v_vendedor, v_fecha, '09:00'::time, '12:00'::time,
      'Visita de prueba realizada ' || i, 'realizada'
    )
    RETURNING id INTO v_visita_id;

    -- 22 criterios en 4 (suma 88). puntaje_final variado para gráficos del dashboard.
    INSERT INTO registro_auditoria (
      id_comercio, id_cliente, id_vendedor, id_auditor, id_visita, id_transportista,
      fecha, hora_inicio, hora_fin, observaciones_generales, analisis_final, puntaje_final, clasificacion_cliente,
      eval_relacion_cumplimiento_pagos, eval_relacion_formas_pago, eval_relacion_frecuencia_compra,
      eval_relacion_comunicacion_ventas, eval_relacion_trato_general,
      eval_ventas_volumen, eval_ventas_rotacion, eval_ventas_interes_nuevos,
      eval_logistica_facilidad_entrega, eval_logistica_horarios_recepcion, eval_logistica_espacio_descarga, eval_logistica_organizacion_recibir,
      eval_local_exhibicion, eval_local_orden_limpieza, eval_local_iluminacion, eval_local_espacio_disponible, eval_local_ubicacion,
      eval_competencia_presencia, eval_competencia_participacion,
      eval_potencial_crecimiento, eval_potencial_cantidad_clientes, eval_potencial_tamano_local
    ) VALUES (
      v_comercio, v_cliente, v_vendedor, v_auditor, v_visita_id, v_transportista,
      v_fecha, '09:00'::time, '12:00'::time,
      v_obs, v_analisis, v_puntaje, v_clasif,
      4, 4, 4, 4, 4,
      4, 4, 4,
      4, 4, 4, 4,
      4, 4, 4, 4, 4,
      4, 4,
      4, 4, 4
    );
  END LOOP;
END $$;
