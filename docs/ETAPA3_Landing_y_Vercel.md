# ETAPA 3 — Landing Page + Vercel

**Estado:** ✅ Implementación lista

---

## Lo implementado

### Landing Page
- **Ruta:** `/` (página principal)
- **Elementos:** Hero, descripción, CTAs (Registrarse / Iniciar sesión), preview de funcionalidades
- **Rutas placeholder:** `/login` y `/registro` (formularios en ETAPA 4)
- **Diseño:** Tailwind, colores ámbar/naranja sobre fondo slate

### Proyecto Next.js
- Next.js 15 + TypeScript + Tailwind
- App Router con `src/`
- Estructura: `(auth)` para login/registro

---

## Pasos para ejecutar en local

1. **Instalar dependencias:**
   ```powershell
   cd c:\appAuditorias
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```powershell
   npm run dev
   ```

3. **Abrir:** http://localhost:3000

---

## Deploy en Vercel

### 1. Subir a GitHub
- Crear repo en GitHub (ej: `app-auditorias`)
- Conectar con GitHub Desktop y hacer push

### 2. Conectar Vercel
1. Entrar a [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Importar el repositorio de GitHub
3. **Framework Preset:** Next.js (detectado automático)
4. **Root Directory:** `./`
5. **Environment Variables:** agregar:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key

### 3. Supabase - Redirect URLs
En Supabase → Authentication → URL Configuration, agregar:
- **Redirect URLs:** `https://tu-proyecto.vercel.app/**`

### 4. Deploy
Hacer clic en **Deploy**. Cada push a `main` desplegará automáticamente.

---

## Próximo paso: ETAPA 4

Implementar **Registro** y **Login** con Supabase Auth.
