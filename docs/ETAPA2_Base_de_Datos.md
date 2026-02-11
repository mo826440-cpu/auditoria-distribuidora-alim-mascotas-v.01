# 🟢 ETAPA 2 — Base de Datos (Supabase)

**Fecha:** 11 de febrero de 2026  
**Estado:** ✅ Completada

---

## 1. Modelo de datos

### Diagrama de relaciones

```
comercios (1) ──┬── (*) usuarios
                ├── (*) clientes
                ├── (*) vendedores
                ├── (*) transportistas
                ├── (*) programacion_visitas ──┬── clientes
                │                               ├── vendedores
                │                               └── (1) registro_auditoria
                └── (*) registro_auditoria ────┬── clientes
                                               ├── vendedores
                                               ├── usuarios (auditor)
                                               ├── programacion_visitas (opcional)
                                               └── transportistas (opcional)
```

### Tablas creadas

| Script | Tabla | Descripción |
|--------|-------|-------------|
| 00 | comercios | Multi-tenant base |
| 01 | usuarios | Perfiles + roles (vinculado a auth.users) |
| 02 | clientes | Puntos de venta |
| 03 | vendedores | Fuerza de ventas |
| 04 | transportistas | Repartidores |
| 05 | programacion_visitas | Calendario de visitas |
| 06 | registro_auditoria | Checklist completo |
| 07 | — | RLS (Row Level Security) |
| 08 | — | Trigger: nuevo usuario → crear perfil |
| 09 | — | Datos iniciales (Comercio de Prueba 01) |

---

## 2. Orden de ejecución en Supabase

Ejecutar en el **SQL Editor** de Supabase en este orden:

1. `00.scriptTablaComercios.sql`
2. `01.scriptTablaUsuarios.sql`
3. `02.scriptTablaClientes.sql`
4. `03.scriptTablaVendedores.sql`
5. `04.scriptTablaTransportistas.sql`
6. `05.scriptTablaProgramacionVisitas.sql`
7. `06.scriptTablaRegistroAuditoria.sql`
8. `07.scriptRLS.sql`
9. `08.scriptAuthTrigger.sql`
10. `09.scriptDatosIniciales.sql`

---

## 3. Pasos para crear el proyecto en Supabase

### 3.1 Crear cuenta y proyecto

1. Entrá a [supabase.com](https://supabase.com) e iniciá sesión.
2. **New Project** → elegí nombre (ej: `app-auditorias`), contraseña de DB y región.
3. Esperá a que termine el aprovisionamiento.

### 3.2 Ejecutar scripts

1. En el panel izquierdo: **SQL Editor**.
2. Copiá el contenido de cada script (00 a 09).
3. Pegá en el editor y ejecutá (Run).
4. Repetí para cada archivo en orden.

### 3.3 Configurar Auth (opcional)

1. **Authentication** → **Providers** → Email habilitado por defecto.
2. **URL Configuration**: agregá la URL de tu app (localhost para desarrollo).
3. **Settings** → **API**: copiá `Project URL` y `anon public` key para `.env.local`.

### 3.4 Variables de entorno

Crear `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

---

## 4. Estructura del checklist (registro_auditoria)

### Campos principales

| Sección | Campos | Tipo |
|---------|--------|------|
| **1. Datos generales** | fecha, id_auditor, id_vendedor | Fecha, FKs |
| **2. Cliente** | local_limpio, productos_exhibidos, stock_suficiente, etc. | Boolean, 1-5, enums |
| **2. Subsecciones** | condiciones_generales, exhibicion_productos, stock_rotacion, precios, relacion | JSONB |
| **3. Vendedor** | gestion_comercial, conocimiento_producto, relacion_cliente, cumplimiento, logistica | JSONB |
| **4. Evaluación** | puntuacion_cliente, vendedor, repartidor (1-10), clasificacion | Int, enum |
| **Cierre** | firma_auditor, firma_responsable | TEXT (base64) |

### Ejemplo JSONB (condiciones_generales)

**No requiere script.** La columna `condiciones_generales` ya existe en `registro_auditoria`. La app insertará estos datos cuando el usuario complete el formulario de auditoría. Este es el formato que debe enviar el frontend:

```json
{
  "local_limpio_ordenado": 4,
  "buena_iluminacion": 5,
  "productos_exhibidos": 3,
  "sector_mascotas_identificado": 4,
  "cumple_normas_higiene": 5,
  "observaciones": "Local en buen estado..."
}
```

### Métodos de pago (multi-select)

Array de strings: `['efectivo', 'transferencia', 'debito']`

Valores posibles: `efectivo`, `transferencia`, `debito`, `credito`, `cheque_10`, `cheque_30`, `cheque_90`, `cheque_120`, `cheque_mas_120`, `otro`

---

## 5. RLS y roles

| Rol | clientes | vendedores | transportistas | visitas | auditorias | usuarios |
|-----|----------|------------|----------------|---------|------------|----------|
| **administrador** | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| **auditor** | CRUD | CRUD | CRUD | CRUD | CRUD | — |
| **visitante** | R | R | R | R | R | R |

---

## 6. Checklist ETAPA 2

| Paso | Estado |
|------|--------|
| Modelo propuesto | ✅ |
| Scripts SQL creados | ✅ |
| RLS configurado | ✅ |
| Trigger auth | ✅ |
| Datos iniciales | ✅ |
| Documentación | ✅ |

---

## 7. Próximo paso: ETAPA 3

**Landing Page + Vercel**: diseño, implementación y deploy.
