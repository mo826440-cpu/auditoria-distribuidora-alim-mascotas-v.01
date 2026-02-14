# Módulo de Referencias — Resumen e implementación

## 1° Resumen de lo entendido

### Estructura general
- **Nuevo módulo "Referencias"** en el menú lateral.
- **Navegación**: Al hacer clic en Referencias se despliega un submenú con:
  - **Zonas**
  - **Transportes**
- Los submenús se muestran al desplegar (no visibles inicialmente).

### Submódulo Zonas

**Formulario crear/editar:**
| Campo          | Tipo         | Obligatorio | Comportamiento                           |
|-------         |------        |-------------|----------------                          |
| Fecha Registro | Timestamp    | Sí (auto)   | Se registra automáticamente, no editable |
| Nombre Zona    | Texto        | Sí          |                                          | 
| Localidades    | Multi-select | Sí (mín. 1) | Lista de localidades de Córdoba. Una lo- |
|                |              |             | calidad no puede estar en más de una zona|
|                |              |             | activa                                   |
| Observaciones  | Texto largo  | No          |                                          |

**Validaciones:**
- Nombre obligatorio
- Al menos una localidad seleccionada
- Ninguna localidad ya asignada a otra zona (salvo zonas eliminadas)

**Tabla:** Fecha | Zona | Acciones (Editar, Eliminar, Ver detalle PDF)

**Acciones:**
- **Editar**: Formulario con datos cargados. Confirmación antes de guardar.
- **Eliminar**: Confirmación antes de eliminar.
- **Ver detalle**: Descarga PDF con: título + fecha, nombre zona, localidades, observaciones, pie con usuario y número de página.

### Submódulo Transportes

**Formulario crear/editar:**
| Campo | Tipo | Obligatorio | Comportamiento |
|-------|------|-------------|----------------|
| Fecha Registro | Timestamp | Sí (auto) | Auto, no editable |
| Tipo | Select | Sí | Camión, Utilitario, Auto, Camioneta, Moto, Acoplado, Otro |
| Marca | Texto corto | Sí | |
| Dominio/Patente | Texto corto | Sí | |
| Observaciones | Texto largo | No | |

**Tabla:** Fecha | Transporte (Marca) | Acciones (Editar, Eliminar, Ver detalle PDF)

**Acciones:** Igual que Zonas, con confirmaciones y PDF de detalle.

### Notas técnicas
- **Multi-tenant**: Ambas tablas tendrán `id_comercio` (como el resto del sistema).
- **Usuario registrador**: Se guardará `id_usuario_registro` para el pie del PDF.
- **Localidades Córdoba**: Lista estática con ~80 localidades principales de la provincia.
- **PDF**: Se usará `jspdf` o similar para generar los PDFs en el cliente.

---

## 2° Scripts de base de datos

**Orden de ejecución en Supabase SQL Editor:**

1. `11.scriptTablaReferenciasZonas.sql`
2. `12.scriptTablaReferenciasTransportes.sql`
3. `13.scriptRLSReferencias.sql`

**Nota:** Las tablas referencian `usuarios(id)` para `id_usuario_registro` (no `auth.users`), para poder hacer join y mostrar el nombre del usuario en el PDF.

---

## 3° Implementación completada

- **Sidebar:** Menú Referencias con submenú desplegable (Zonas, Transportes)
- **Páginas:** `/referencias/zonas` y `/referencias/transportes`
- **API:** CRUD para zonas y transportes
- **Zonas:** Formulario con nombre, multi-select de localidades Córdoba, observaciones. Validación de localidades no duplicadas.
- **Transportes:** Formulario con tipo, marca, dominio/patente, observaciones
- **PDF:** Botón "Ver detalle" abre ventana de impresión → "Guardar como PDF"
- **Confirmaciones:** Antes de guardar y eliminar

---

### Tablas a crear

**zonas**
- id, id_comercio, nombre, localidades (TEXT[] o JSONB), observaciones, id_usuario_registro, created_at, updated_at

**transportes** (referencias, no confundir con transportistas)
- id, id_comercio, tipo, marca, dominio_patente, observaciones, id_usuario_registro, created_at, updated_at

### Restricción de localidades
- Una localidad solo puede estar en una zona activa por comercio.
- Se validará en la API al crear/editar.
