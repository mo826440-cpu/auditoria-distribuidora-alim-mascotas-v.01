# ETAPA 4 — Registro y Login (parcial)

**Estado:** ✅ Registro y Login implementados

---

## Lo implementado

### Registro (`/registro`)
- Formulario: nombre, email, contraseña
- Supabase Auth `signUp` con metadata (nombre, rol administrador)
- Trigger en DB crea perfil en `usuarios` con "Comercio de Prueba 01"
- Redirección a dashboard tras registro exitoso

### Login (`/login`)
- Formulario: email, contraseña
- Supabase Auth `signInWithPassword`
- Redirección a dashboard (o a `redirectTo` si viene de ruta protegida)

### Dashboard (`/dashboard`)
- Página protegida (solo usuarios logueados)
- Botón cerrar sesión

### Protección de rutas (middleware)
- Usuario logueado en `/login` o `/registro` → redirige a `/dashboard`
- Usuario no logueado accediendo a `/dashboard/*` → redirige a `/login`

---

## Cómo probar

1. **Registro:** Ir a `/registro`, completar formulario y crear cuenta.
2. **Login:** Ir a `/login`, ingresar con la cuenta creada.
3. **Dashboard:** Tras login, deberías ver el dashboard.
4. **Cerrar sesión:** Usar el botón en el dashboard.

---

## Supabase: confirmación de email

Si en Supabase está habilitada la **confirmación de email** (Authentication → Providers → Email):

- El usuario debe confirmar el email antes de poder iniciar sesión.
- Para pruebas locales, podés desactivarla en: Supabase → Authentication → Providers → Email → desactivar "Confirm email".

---

## Próximo paso en ETAPA 4

Implementar módulos en orden:
- Usuarios
- Clientes
- Vendedores
- Transportistas
- Programación de visitas
- Dashboard completo
