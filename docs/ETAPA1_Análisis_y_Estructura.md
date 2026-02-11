# 🟢 ETAPA 1 — Análisis y Estructura Base

**Fecha:** 11 de febrero de 2026  
**Estado:** En revisión

---

## 1. Resumen de lo entendido

### Objetivo
App de Auditorías Comerciales para una distribuidora de alimentos para mascotas (Villa María, Córdoba). Multi-comercio, offline-first, roles de usuario, calendario de visitas y checklist extenso de auditoría.

### Decisiones confirmadas
| Tema | Decisión |
|------|----------|
| Stack técnico | A tu criterio (ver recomendación abajo) |
| Offline | A tu criterio (ver recomendación abajo) |
| Firmas | Digitales (captura en pantalla) |
| Métodos de pago | Multi-select (varios métodos) |
| Comercio inicial | Uno solo: "Comercio de Prueba 01" (arquitectura multi-comercio) |

---

## 2. Sugerencias o mejoras

### 2.1 UX
- **Modo oscuro opcional** para uso en campo (menos brillo en celular).
- **Guardado automático** mientras se completa la auditoría (evitar pérdida de datos).
- **Indicador de conexión** visible (online/offline) en header.
- **Confirmación antes de enviar** auditoría al servidor.

### 2.2 Checklist
- **Progreso visual** por sección (ej: "Sección 2 de 4 completada").
- **Validación por sección** antes de avanzar (opcional).
- **Campos obligatorios** bien marcados.

### 2.3 Seguridad
- **Row Level Security (RLS)** en Supabase por `id_comercio`.
- **Tokens de sesión** con expiración configurada.
- **No guardar datos sensibles** en localStorage sin encriptar.

### 2.4 Performance
- **Lazy loading** de rutas (code splitting).
- **Paginación** en tablas con muchos registros.
- **Imágenes optimizadas** si hay logos o fotos.

---

## 3. Checklist de seguimiento

| # | Etapa | Estado | Notas |
|---|-------|--------|-------|
| 1 | Análisis y Estructura Base | ✅ Completada | |
| 2 | Base de Datos (Supabase) | ✅ Completada | |
| 3 | Landing Page + Vercel | ✅ Completada | |
| 4 | Desarrollo del Sistema | ⏳ Pendiente | |
| 5 | Datos de Prueba | ⏳ Pendiente | |
| 6 | Mejoras y Recomendaciones | ⏳ Pendiente | |

---

## 4. Recomendación de tecnologías

### Stack propuesto

| Capa | Tecnología | Motivo |
|------|------------|--------|
| **Framework** | Next.js 14 (App Router) | Buena integración con Vercel, SSR, API routes, amplio soporte |
| **Lenguaje** | TypeScript | Menos errores, mejor autocompletado, fácil de mantener |
| **UI** | Tailwind CSS + shadcn/ui | Componentes listos, accesibles, personalizables |
| **Backend/DB** | Supabase | Auth, DB, RLS, Realtime, gratuito para empezar |
| **Offline** | Dexie.js (IndexedDB) | Simple, documentado, sync manual cuando vuelve conexión |
| **Estado** | TanStack Query (React Query) | Cache, refetch, manejo de loading/error |
| **Formularios** | React Hook Form + Zod | Validación sólida, buen rendimiento |
| **Firmas digitales** | react-signature-canvas | Liviano, funciona en móvil y PC |
| **Calendario** | FullCalendar o react-big-calendar | Estilo Google Calendar |

### Alternativa offline más avanzada (opcional)
Si más adelante necesitás sync más robusto: **PowerSync** (oferta free tier) se integra con Supabase para offline bidireccional. Por ahora, Dexie + sync manual es suficiente y más simple.

### Requisitos previos
- Node.js 18+
- Cuenta en GitHub
- Cuenta en Supabase
- Cuenta en Vercel

---

## 5. Propuesta de estructura de carpetas

```
appAuditorias/
├── docs/                          # Documentación
│   ├── archivos.md/
│   └── ETAPA1_Análisis_y_Estructura.md
├── scriptsBaseDatos/              # Scripts SQL (Supabase)
│   ├── 01.scriptTablaUsuarios.sql
│   ├── 02.scriptTablaClientes.sql
│   └── ...
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/               # Rutas públicas (login, registro)
│   │   ├── (dashboard)/          # Rutas protegidas
│   │   ├── layout.tsx
│   │   └── page.tsx              # Landing
│   ├── components/
│   │   ├── ui/                   # shadcn/ui
│   │   ├── layouts/              # Header, Sidebar
│   │   └── features/             # Por módulo
│   ├── lib/
│   │   ├── supabase/
│   │   ├── db/                   # Dexie offline
│   │   └── utils/
│   ├── hooks/
│   ├── stores/                   # Estado global si hace falta
│   └── types/
├── public/
├── .env.local                    # Variables de entorno (no subir a Git)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 6. Comando PowerShell para crear estructura

Ejecutá este comando en la raíz del proyecto (`c:\appAuditorias`):

```powershell
# Crear estructura de carpetas
New-Item -ItemType Directory -Force -Path "scriptsBaseDatos", "src\app\(auth)\login", "src\app\(auth)\registro", "src\app\(dashboard)\dashboard", "src\app\(dashboard)\usuarios", "src\app\(dashboard)\clientes", "src\app\(dashboard)\vendedores", "src\app\(dashboard)\transportistas", "src\app\(dashboard)\visitas", "src\app\(dashboard)\auditorias", "src\components\ui", "src\components\layouts", "src\components\features", "src\lib\supabase", "src\lib\db", "src\lib\utils", "src\hooks", "src\stores", "src\types", "public"
```

---

## 7. Próximos pasos

1. **Confirmar** si te sirve este stack y la estructura.
2. Ejecutar el comando PowerShell para crear carpetas.
3. Inicializar proyecto Next.js (`npx create-next-app@latest`).
4. Avanzar a **ETAPA 2** (Base de datos en Supabase).

---

👉 **¿Confirmás el stack y la estructura para seguir con la creación del proyecto?**
