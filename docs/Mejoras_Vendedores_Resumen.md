# Resumen: Módulo de Vendedores — Mejoras

## 1° Resumen de lo entendido y plan de implementación

### Formulario de carga/edición

| # | Campo | Tipo | Validación |
|---|-------|------|------------|
| 1 | Fecha de registro | Solo lectura | Fecha actual, no editable |
| 2 | Nombre Vendedor | Texto corto (max 100) | Obligatorio |
| 3 | Contacto | E.164 | Obligatorio (+5493511234567), default +54 |
| 4 | Email | Email | Opcional |
| 5 | Código Interno | Texto | Obligatorio. Solo números y guiones. Único por comercio |
| 6 | DNI | 8 dígitos | Obligatorio. Formato XX.XXX.XXX. Único por comercio |
| 7 | Zona | Multi-select | Lista desde referencias_zonas. Permite varias zonas |
| 9 | Residencia | Texto corto (max 100) | Opcional. Letras, números, espacios, acentos, puntos, comas |
| 10 | Observaciones | Texto largo | Opcional |
| 11 | Estado | Activo/Inactivo | Por defecto Activo |
| 12 | Botón Cancelar | — | Limpia y cierra |
| 13 | Botón Registrar | — | Confirmación antes de guardar |

### Tabla de registros

| Columna | Contenido |
|---------|-----------|
| Código | Código Interno |
| Vendedor | Nombre Vendedor |
| Contacto | Contacto (E.164) |
| Residencia | Ícono → Google Maps con dirección del campo Residencia |
| Estado | Activo/Inactivo |
| Acciones | Ver detalle (PDF), Editar, Eliminar |

### PDF de detalle

- Título: Detalle de Vendedor Registrado + (Fecha y hora)
- Filas: Nombre, Contacto, Email, Código Interno, DNI, Zona, Residencia, Observaciones, Estado
- Pie: usuario que registró + número de página

### Implementación técnica

1. **Base de datos:** Script ALTER TABLE para agregar: contacto, codigo_interno, dni, id_zonas (UUID[]), residencia, observaciones, id_usuario_registro. Índices únicos para codigo_interno y dni.
2. **API:** POST/PATCH con validaciones (E.164, DNI 8 dígitos, unicidad codigo/dni).
3. **VendedoresClient:** Formulario completo, multi-select zonas, DNI con formato XX.XXX.XXX, generación PDF.
4. **Página vendedores:** Cargar zonas desde referencias_zonas.
5. **Google Maps:** Enlace con Residencia como query.

---

## 2° Script SQL

**Archivo:** `scriptsBaseDatos/16.scriptAlterVendedores.sql`

**Orden de ejecución:** Después del script 11 (referencias_zonas).

**Qué hace:**
- Agrega columnas: contacto, codigo_interno, dni, id_zonas (UUID[]), residencia, observaciones, id_usuario_registro
- Migra datos existentes (telefono→contacto, etc.)
- Índices únicos para codigo_interno y dni por comercio
