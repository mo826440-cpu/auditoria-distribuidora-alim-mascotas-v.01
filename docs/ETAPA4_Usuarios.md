# Módulo Usuarios

**Estado:** ✅ Implementado

---

## Página de creación de contraseña

Cuando un usuario invita a alguien, el invitado recibe un correo. Al hacer clic en el link:

1. Es redirigido a `/set-password`
2. Ve un formulario para crear su contraseña
3. Tras guardar, accede al dashboard

**Importante:** Agregar en Supabase → Authentication → URL Configuration → Redirect URLs:
- `https://tu-dominio.vercel.app/set-password`
- `http://localhost:3000/set-password` (para desarrollo)

---

## Funcionalidades

- **Listado** de usuarios del comercio
- **Invitar usuario**: envía email con link para configurar contraseña
- **Editar**: nombre y rol
- **Eliminar**: con confirmación (no podés eliminarte a vos mismo)
- **Solo administrador** puede acceder y gestionar

---

## Layout del dashboard

- **Header:** usuario logueado, fecha/hora Argentina, cerrar sesión
- **Sidebar:** menú lateral (hamburguesa en móvil)
- **Menú:** Dashboard, Usuarios, Clientes, Vendedores, Transportistas, Visitas, Auditorías
- Usuarios solo visible para rol administrador

---

## Supabase: Email para invitaciones

Para que las invitaciones funcionen, en Supabase:

- **Authentication** → **Providers** → **Email** → debe estar habilitado
- **Authentication** → **Email Templates** → podés personalizar el correo de invitación

Si usás el proveedor por defecto de Supabase, hay un límite de emails por día en el plan gratuito.
