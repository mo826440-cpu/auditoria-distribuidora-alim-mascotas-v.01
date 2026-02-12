# Fix: Database error saving new user

## Problema
El trigger en `auth.users` causaba error 500 al registrarse. Supabase rechazaba el signup por el trigger.

## Solución
1. **Desactivar el trigger** en Supabase
2. **Crear el perfil desde la app** (API route) después del signup

## Pasos (en orden)

### 1. Ejecutar script en Supabase
En Supabase → **SQL Editor** → ejecutar:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

O copiar el contenido de `scriptsBaseDatos/10.scriptDesactivarTriggerAuth.sql`

### 2. Obtener la service_role key en Supabase
- Supabase → **Settings** → **API**
- En **Project API keys**, copiar la clave **service_role** (secret, no la anon)

### 3. Agregar variable en Vercel
En Vercel → **Settings** → **Environment Variables** → agregar:

- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Pegar la clave service_role copiada
- **Environments:** All

⚠️ **Importante:** Esta clave es secreta. Solo en servidor, nunca en el cliente.

### 4. Agregar en .env.local (para desarrollo local)
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...tu-service-role-key
```

### 5. Redeploy en Vercel
**Deployments** → Redeploy del último deployment.
