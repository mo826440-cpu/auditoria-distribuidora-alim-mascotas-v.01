-- ============================================================
-- 10. DESACTIVAR TRIGGER DE AUTH (solución al error 500)
-- El trigger causaba "Database error saving new user".
-- Ahora el perfil se crea desde la app (API /api/auth/complete-registration).
-- Ejecutar en Supabase SQL Editor.
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Opcional: mantener la función por si se necesita en el futuro
-- DROP FUNCTION IF EXISTS public.handle_new_user();
