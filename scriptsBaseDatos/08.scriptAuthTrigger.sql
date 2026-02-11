-- ============================================================
-- 08. TRIGGER - Crear usuario en tabla usuarios al registrarse
-- Cuando un usuario se registra en auth.users, se crea su perfil en usuarios.
-- metadata en signUp: { nombre, id_comercio?, rol? }
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    comercio_id UUID;
BEGIN
    -- Si viene id_comercio en metadata, usarlo. Si no, usar el primer comercio (ej. Comercio de Prueba 01)
    comercio_id := (NEW.raw_user_meta_data->>'id_comercio')::UUID;
    
    IF comercio_id IS NULL THEN
        SELECT id INTO comercio_id FROM comercios ORDER BY created_at LIMIT 1;
    END IF;
    
    -- Si no hay comercio, crear "Comercio de Prueba 01"
    IF comercio_id IS NULL THEN
        INSERT INTO comercios (nombre) VALUES ('Comercio de Prueba 01') RETURNING id INTO comercio_id;
    END IF;
    
    INSERT INTO public.usuarios (id, id_comercio, email, nombre, rol)
    VALUES (
        NEW.id,
        comercio_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'rol')::rol_usuario, 'administrador')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger en auth.users (ejecutar en Supabase SQL Editor)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
