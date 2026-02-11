-- ============================================================
-- 05. TABLA PROGRAMACIÓN DE VISITAS
-- Visitas comerciales programadas. Relaciona cliente + vendedor + fecha.
-- ============================================================

CREATE TABLE programacion_visitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_comercio UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    id_cliente UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    id_vendedor UUID NOT NULL REFERENCES vendedores(id) ON DELETE CASCADE,
    fecha_visita DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    observaciones TEXT,
    estado VARCHAR(50) DEFAULT 'pendiente',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_programacion_visitas_id_comercio ON programacion_visitas(id_comercio);
CREATE INDEX idx_programacion_visitas_fecha ON programacion_visitas(fecha_visita);
CREATE INDEX idx_programacion_visitas_id_cliente ON programacion_visitas(id_cliente);
CREATE INDEX idx_programacion_visitas_id_vendedor ON programacion_visitas(id_vendedor);

COMMENT ON TABLE programacion_visitas IS 'Visitas comerciales programadas (calendario)';
COMMENT ON COLUMN programacion_visitas.estado IS 'pendiente | realizada | cancelada | reprogramada';
