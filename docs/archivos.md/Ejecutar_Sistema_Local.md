# Cómo ejecutar el sistema de forma local

Guía paso a paso para abrir y ejecutar la aplicación **Auditorías Comerciales** en tu computadora.

---

## Requisitos previos

Antes de comenzar, asegurate de tener instalado:

| Herramienta | Versión recomendada | Verificación |
|-------------|---------------------|--------------|
| **Node.js** | 18.x o superior | `node -v` |
| **npm** | 9.x o superior | `npm -v` |

Si no tenés Node.js, descargalo desde [nodejs.org](https://nodejs.org/).

---

## Paso 1: Obtener el código del proyecto

Si ya tenés el proyecto en tu computadora, abrí la carpeta en tu editor (por ejemplo, Cursor o VS Code).

Si necesitás clonarlo desde un repositorio:

```bash
git clone <url-del-repositorio> appAuditorias
cd appAuditorias
```

---

## Paso 2: Instalar dependencias

Abrí una terminal en la carpeta del proyecto y ejecutá:

```bash
npm install
```

Esto instalará todas las dependencias necesarias (Next.js, Supabase, React, etc.).

---

## Paso 3: Configurar Supabase

La aplicación usa **Supabase** como base de datos y autenticación. Necesitás:

### 3.1 Crear un proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) e iniciá sesión.
2. Creá un nuevo proyecto (o usá uno existente).
3. Esperá a que el proyecto termine de crearse.

### 3.2 Obtener las credenciales

1. En el panel de Supabase, andá a **Settings** → **API**.
2. Copiá estos valores:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public** (clave pública)
   - **service_role** (clave de servicio, en la misma sección)

### 3.3 Ejecutar los scripts de base de datos

1. En Supabase, andá a **SQL Editor**.
2. Ejecutá los scripts de la carpeta `scriptsBaseDatos/` **en orden numérico** (00, 01, 02, 03, etc.).
3. Los scripts crean las tablas, políticas RLS y datos iniciales necesarios.

---

## Paso 4: Crear el archivo de variables de entorno

1. En la **raíz del proyecto** (donde está `package.json`), creá un archivo llamado `.env.local`.

2. Agregá el siguiente contenido (reemplazando con tus valores reales):

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

3. **Importante:** No subas este archivo a Git. El archivo `.env.local` ya debería estar en `.gitignore`.

---

## Paso 5: Iniciar el servidor de desarrollo

En la terminal, ejecutá:

```bash
npm run dev
```

Verás un mensaje similar a:

```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
```

---

## Paso 6: Abrir la aplicación en el navegador

1. Abrí tu navegador (Chrome, Edge, Firefox, etc.).
2. Ingresá a: **http://localhost:3000**

3. Deberías ver la página de inicio. Si la base de datos está configurada:
   - Podés **Registrarte** para crear una cuenta.
   - O **Iniciar sesión** si ya tenés un usuario.

---

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo (con recarga automática) |
| `npm run build` | Genera la versión de producción |
| `npm run start` | Ejecuta la versión de producción (después de `build`) |
| `npm run lint` | Verifica el código con el linter |

---

## Solución de problemas

### El servidor no inicia
- Verificá que Node.js esté instalado: `node -v`
- Revisá que no haya otro proceso usando el puerto 3000.

### Error de conexión a Supabase
- Verificá que las variables en `.env.local` sean correctas.
- Asegurate de que el proyecto de Supabase esté activo.

### Error al iniciar sesión o registrar
- Verificá que hayas ejecutado todos los scripts de base de datos.
- Revisá que el trigger de registro (script 08) esté creado para crear usuarios al registrarse.

### La página queda en blanco
- Abrí la consola del navegador (F12) para ver errores.
- Verificá que las variables `NEXT_PUBLIC_*` estén bien configuradas (se usan en el cliente).

---

## Resumen rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env.local con las credenciales de Supabase

# 3. Ejecutar scripts SQL en Supabase (en orden)

# 4. Iniciar el servidor
npm run dev

# 5. Abrir http://localhost:3000
```
