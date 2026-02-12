# Módulo Usuarios

**Estado:** ✅ Implementado

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
