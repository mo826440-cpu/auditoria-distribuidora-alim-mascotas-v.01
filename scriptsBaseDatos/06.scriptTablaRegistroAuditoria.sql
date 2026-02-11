-- ============================================================
-- 06. TABLA REGISTRO DE AUDITORÍA
-- Checklist completo de auditoría comercial.
-- Fechas en zona horaria Argentina.
-- ============================================================

-- Enums para selects
CREATE TYPE clasificacion_cliente AS ENUM ('estrategico', 'potencial', 'regular', 'critico');

CREATE TYPE frecuencia_envios AS ENUM (
    'menos_1_mes', '1_a_3_mes', '3_a_4_mes', '4_a_5_mes', 'mas_5_mes'
);

CREATE TYPE promedio_kg_mes AS ENUM (
    'menos_1000', '1000_2000', '2000_3000', '3000_4000', '4000_5000',
    '5000_6000', '6000_7000', '7000_8000', 'mas_8000'
);

CREATE TYPE monto_compra_mes AS ENUM (
    'menos_1M', '1M_2M', '2M_3M', '3M_4M', '4M_5M', 'mas_5M'
);

-- Tabla principal
CREATE TABLE registro_auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_comercio UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    id_cliente UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    id_vendedor UUID NOT NULL REFERENCES vendedores(id) ON DELETE CASCADE,
    id_auditor UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    id_visita UUID REFERENCES programacion_visitas(id) ON DELETE SET NULL,
    id_transportista UUID REFERENCES transportistas(id) ON DELETE SET NULL,
    
    -- Sección 1 - Datos Generales
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Sección 2 - Cliente (campos simples)
    local_limpio_ordenado BOOLEAN,
    productos_bien_exhibidos SMALLINT CHECK (productos_bien_exhibidos BETWEEN 1 AND 5),
    stock_suficiente BOOLEAN,
    rotacion_productos SMALLINT CHECK (rotacion_productos BETWEEN 1 AND 5),
    cumple_plazos_pago BOOLEAN,
    metodos_pago_frecuentes TEXT[], -- multi-select: efectivo, transferencia, etc.
    frecuencia_envios frecuencia_envios,
    promedio_kg_mes promedio_kg_mes,
    monto_compra_mes monto_compra_mes,
    
    -- Sección 2 - Condiciones Generales del Local (1-5 + observaciones)
    -- JSONB: {local_limpio: 4, buena_iluminacion: 5, productos_exhibidos: 3, sector_mascotas: 4, normas_higiene: 5, observaciones: "..."}
    condiciones_generales JSONB,
    
    -- Sección 2 - Exhibición (1-5 + comparación mejor/igual/peor + observaciones)
    exhibicion_productos JSONB,
    
    -- Sección 2 - Stock y Rotación
    stock_rotacion JSONB,
    
    -- Sección 2 - Precios y Comercialización
    precios_comercializacion JSONB,
    
    -- Sección 2 - Relación con la Distribuidora
    relacion_distribuidora JSONB,
    
    -- Sección 3 - Auditoría del Vendedor (cada uno: 4-5 items 1-5 + observaciones)
    gestion_comercial JSONB,
    conocimiento_producto JSONB,
    relacion_cliente JSONB,
    cumplimiento_administrativo JSONB,
    logistica_servicio JSONB,
    
    -- Sección 4 - Evaluación General
    puntuacion_cliente SMALLINT CHECK (puntuacion_cliente IS NULL OR (puntuacion_cliente BETWEEN 1 AND 10)),
    puntuacion_vendedor SMALLINT CHECK (puntuacion_vendedor IS NULL OR (puntuacion_vendedor BETWEEN 1 AND 10)),
    puntuacion_repartidor SMALLINT CHECK (puntuacion_repartidor IS NULL OR (puntuacion_repartidor BETWEEN 1 AND 10)),
    clasificacion_cliente clasificacion_cliente,
    
    -- Cierre - Firmas digitales (base64 de imagen PNG)
    firma_auditor TEXT,
    firma_responsable TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_registro_auditoria_id_comercio ON registro_auditoria(id_comercio);
CREATE INDEX idx_registro_auditoria_fecha ON registro_auditoria(fecha);
CREATE INDEX idx_registro_auditoria_id_cliente ON registro_auditoria(id_cliente);
CREATE INDEX idx_registro_auditoria_id_vendedor ON registro_auditoria(id_vendedor);
CREATE INDEX idx_registro_auditoria_id_auditor ON registro_auditoria(id_auditor);
CREATE INDEX idx_registro_auditoria_clasificacion ON registro_auditoria(clasificacion_cliente);

-- Comentarios
COMMENT ON TABLE registro_auditoria IS 'Registros completos de auditoría comercial';
COMMENT ON COLUMN registro_auditoria.metodos_pago_frecuentes IS 'Array: efectivo, transferencia, debito, credito, cheque_10, cheque_30, cheque_90, cheque_120, cheque_mas_120, otro';
COMMENT ON COLUMN registro_auditoria.condiciones_generales IS 'JSONB: local_limpio, buena_iluminacion, productos_exhibidos, sector_mascotas, normas_higiene (1-5), observaciones';
COMMENT ON COLUMN registro_auditoria.exhibicion_productos IS 'JSONB: productos_visibles, ubicacion_estrategica, carteleria, material_estado, comparacion_competencia (mejor/igual/peor), observaciones';
COMMENT ON COLUMN registro_auditoria.firma_auditor IS 'Imagen PNG en base64 de la firma digital';
