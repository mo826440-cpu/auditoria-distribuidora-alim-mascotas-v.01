# Resumen: Módulo de Clientes — Mejoras

## 1° Resumen de lo entendido y plan de implementación

### Formulario de carga/edición

| # | Campo | Tipo | Validación |
|---|-------|------|------------|
| 1 | Fecha de registro | Solo lectura | Fecha actual, no editable |
| 2 | Nombre Representante | Texto corto (max 100) | Obligatorio |
| 3 | Contacto | E.164 | Obligatorio (+5493511234567) |
| 4 | Email | Email | Opcional |
| 5 | Código Interno | Texto | Obligatorio. Solo números y guiones (-). Sin espacios ni símbolos |
| 6 | Nombre Comercio | Texto corto (max 100) | Obligatorio. Letras, espacios, puntos, guiones, números, acentos |
| 7 | CUIT | XX-XXXXXXXX-X | Obligatorio |
| 8 | Zona | Select | Lista desde referencias_zonas (columna Zona) |
| 9 | Localidad/Ciudad | Select | Opciones según zona elegida (localidades de esa zona) |
| 10 | Provincia | Select | Por defecto Córdoba. Lista de provincias de Argentina |
| 11 | Calle | Texto corto (max 100) | Obligatorio |
| 12 | Número | Entero | Obligatorio |
| 13 | Observaciones | Texto largo | Opcional |
| 14 | Estado | Activo/Inactivo | Por defecto Activo |
| 15 | Botón Cancelar | — | Limpia y cierra |
| 16 | Botón Registrar | — | Confirmación antes de guardar |

### Tabla de registros

| Columna | Contenido |
|---------|-----------|
| Código | Código Interno |
| Cliente | Nombre Comercio |
| Contacto | Contacto (E.164) |
| Ubicación | Ícono → Google Maps (Localidad, Provincia, Calle, Número) |
| Estado | Activo/Inactivo |
| Acciones | Editar, Eliminar, Ver detalle (PDF) |

### PDF de detalle

- Título: Detalle de Cliente Registrado + (Fecha y hora)
- Filas: Nombre Representante, Contacto, Email, Código Interno, Nombre Comercio, CUIT, Zona, Localidad, Provincia, Calle, Número, Observaciones, Estado
- Pie: usuario que registró + número de página

### Implementación técnica

1. **Base de datos:** Script de migración `ALTER TABLE` para agregar columnas nuevas y ajustar las existentes.
2. **API:** Actualizar POST/PATCH para validar y guardar los nuevos campos; incluir `id_usuario_registro`.
3. **ClientesClient:** Formulario completo con validaciones, selects dependientes (Zona → Localidad), provincias de Argentina, y generación de PDF.
4. **Página clientes:** Cargar zonas desde `referencias_zonas` para los selects.
5. **Google Maps:** Enlace `https://www.google.com/maps/search/?api=1&query=...` con dirección formateada.

---

## 2° Script SQL

**Archivo:** `scriptsBaseDatos/14.scriptAlterClientes.sql`

**Orden de ejecución:** Después del script 11 (referencias_zonas).

**Qué hace:**
- Agrega columnas: nombre_representante, contacto, codigo_interno, cuit, id_zona, calle, numero, observaciones, id_usuario_registro
- Migra datos existentes (telefono→contacto, direccion→calle, etc.)
- Índices y constraint UNIQUE para codigo_interno por comercio
