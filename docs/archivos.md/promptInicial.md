📋 PROMPT PARA CURSOR — App de Auditorías Comerciales (Offline / Online)

Copiá todo esto y pegalo tal cual en Cursor 👇

🎯 CONTEXTO GENERAL

Quiero que actúes como desarrollador senior full-stack y arquitecto de software, con experiencia en:

Apps offline-first

Supabase (auth + database)

Deploy con Vercel

Apps multiplataforma (PC + móvil)

UX moderno, simple y profesional

Proyectos guiados para personas no expertas en programación

Tu tarea es guiarme paso a paso para construir una aplicación desde cero, explicando decisiones técnicas, pidiendo confirmaciones antes de avanzar y validando cada etapa.

🧠 OBJETIVO DE LA APP

Desarrollar una App de Auditorías Comerciales para una empresa distribuidora de alimentos para mascotas ubicada en Villa María, Córdoba (Argentina).

La app debe permitir:

Gestionar clientes

Gestionar usuarios, vendedores y transportistas

Programar visitas comerciales

Registrar auditorías completas en campo

Funcionar online y offline

Usarse tanto en PC como en celular

Tener roles de usuario

Analizar datos mediante dashboard

🧩 REQUISITOS GENERALES

App simple de usar, estética moderna.

Base de datos principal en Supabase.

Soporte offline con base de datos local y sincronización.

Deploy automático en Vercel desde GitHub.

Debés guiarme en:

Git

Supabase

Vercel

Estructura del proyecto

Toda la app debe manejar horario de Argentina.

El sistema debe ser multi-comercio, aislando los datos por id_comercio.

🧭 FLUJO GENERAL DE LA APP

Landing Page

Registro de usuario administrador

Inicio de sesión

Dentro de la app:
4. Dashboard
5. Registro de usuarios
6. Registro de clientes
7. Registro de vendedores
8. Registro de transportistas
9. Programación de visitas + calendario
10. Registro de auditorías (checklist editable)

🧱 ESTRUCTURA VISUAL COMÚN

Header superior:

Usuario logueado

Fecha y hora actual (Argentina)

Botón cerrar sesión

Menú lateral izquierdo:

Vertical

Oculto con botón hamburguesa

👤 ROLES Y PERMISOS

Administrador → acceso total

Auditor → todo menos gestión de usuarios

Visitante → solo dashboard

🗂️ BASE DE DATOS (SUPABASE)

Deberás:

Proponer diseño de base de datos

Crear scripts SQL numerados y ordenados

Guardarlos en carpeta scriptsBaseDatos

Nombrarlos así:

01.scriptTablaUsuarios.sql

02.scriptTablaClientes.sql

03.scriptTablaVendedores.sql

04.scriptTablaTransportistas.sql

05.scriptTablaProgramacionVisitas.sql

06.scriptTablaRegistroAuditoria.sql

Cada tabla debe incluir:

id

created_at

id_comercio

claves foráneas necesarias

🧪 FUNCIONALIDADES CLAVE

Formularios con validaciones

Mensajes de confirmación antes de crear/editar/eliminar

Tablas con acciones por íconos

Calendario tipo Google Calendar

Checklist de auditoría editable múltiples veces

Soporte para iniciar auditoría en oficina y continuar en campo

Datos precargados automáticos según relaciones

🧠 CHECKLIST DE AUDITORÍA

(Usar exactamente el checklist detallado que te paso a continuación, respetando secciones, puntuaciones, selects y observaciones, con campos adecuados a cada tipo de dato)
🔹 Sección 1 - Datos Generales de la Auditoría

          - Fecha: - se debe cargar automáticamente.
          - Auditor/a: - se debe cargar automaticamente según el usuario logueado.
          - Vendedor asignado: - me debe mostrar una lista desplegable de los vendedores cargados en Registros de 
            vendedores.

🔹 Sección 2 – Cliente

          - Local limpio y ordenado → Sí / No

          - Productos bien exhibidos → 1 (muy mal) a 5 (excelente)

          - Stock suficiente → Sí / No

          - Rotación de productos → 1 a 5

          - Cumple plazos de pago → Sí / No

          - Métodos de pagos más frecuentes: Lista desplegables con:
                                                             - Efectivo
                                                             - Transferencia
                                                             - Débito
                                                             - Crédito
                                                             - Cheque a 10 días
                                                             - cheque a 30 días
                                                             - Cheque a 90 días
                                                             - Cheque a 120 días
                                                             - Cheque a + 120 días
                                                             - Otro método de pago

          - Frecuencia de envíos de pedidos estimados por mes: < 1/ mes
                                                                 1 - 3 /mes
                                                                 3 - 4 / mes
                                                                 4 - 5 /mes
                                                                 > 5 /mes

          - Promedio de Kg enviadas por mes: < 1.000 kg /mes
                                                 1.000 - 2.000 kg /mes
                                                 2.000 - 3.000 kg /mes
                                                 3.000 - 4.000 kg /mes
                                                 4.000 - 5.000 kg /mes
                                                 5.000 - 6.000 kg /mes
                                                 6.000 - 7.000 kg /mes
                                                 7.000 - 8.000 kg /mes
                                                 > 8.000 kg /mes

          - Monto de compra estimado por mes ($): Ej, < $1.000.000,00 /mes.
                                                        $1.000.000,00 - $2.000.000,00 /mes.
                                                        $2.000.000,00 - $3.000.000,00 /mes.
                                                        $3.000.000,00 - $4.000.000,00 /mes. 
                                                        $4.000.000,00 - $5.000.000,00 /mes.
                                                        > $5.000.000,00 

          - Condiciones Generales del Local: (puntuar del 1 al 5 todas las siguientes opciones)

                    * Local limpio y ordenado 

                    *  Buena iluminación

                    * Productos bien exhibidos

                    * Sector mascotas claramente identificado

                    * Cumple normas básicas de higiene

                    * Observaciones:

          - Exhibición de Productos de la Distribuidora (puntuar del 1 al 5 todas las siguientes opciones)

                    * Productos visibles al público

                    * Ubicación estratégica (no escondidos)

                    * Cartelería o material promocional presente

                    * Material promocional en buen estado

                    * Comparación frente a marcas competidoras (mejor / igual / peor)

                    * Observaciones:

          - Stock y Rotación: (puntuar del 1 al 5 todas las siguientes opciones)

                    * Stock suficiente

                    * No hay quiebres frecuentes

                    * Productos con buena rotación

                    * Productos vencidos o próximos a vencer (detallar)

                    * Variedad acorde al tipo de comercio

                    * Observaciones:

          - Precios y Comercialización: (puntuar del 1 al 5 todas las siguientes opciones)

                    * Precios actualizados

                    * Margen razonable para el cliente

                    * Respeta precios sugeridos (si aplica)

                    * Ofrece promociones al consumidor final

                    * Observaciones:

          - Relación con la Distribuidora

                    * Conoce al vendedor asignado

                    * Recibe visitas periódicas

                    * Está conforme con la atención

                    * Reclamos frecuentes (detallar)

                    * Cumple plazos de pago

                    * Observaciones:

🔹 Sección 3 – Auditoría del Vendedor (Fuerza de Ventas)

          - Gestión Comercial:

                    * Visita al cliente según frecuencia establecida

                    * Presenta correctamente los productos

                    * Ofrece nuevos lanzamientos

                    * Sugiere reposición de stock

                    * Propone promociones

                    * Observaciones:

          - Conocimiento del Producto

                    * Conoce características de los productos

                    * Conoce beneficios frente a la competencia

                    * Responde dudas del cliente

                    * Asesora según tipo de comercio

                    * Observaciones:

          - Relación con el Cliente

                    * Trato cordial y profesional

                    * Genera confianza

                    * Detecta necesidades del cliente

                    * Realiza seguimiento post-venta

                    * Observaciones:

          - Cumplimiento Administrativo

                    * Registra pedidos correctamente

                    * Respeta condiciones comerciales

                    * Informa reclamos a la empresa

                    * Cumple objetivos asignados

                    * Observaciones:

          - Logística y Servicio

                    * Entregas en tiempo y forma

                    * Pedidos completos

                    * Buen estado de la mercadería

                    * Coordinación correcta con el cliente

                    * Observaciones:

🔹 Sección 4 – Evaluación General

          - Puntuación (opcional):

                  Cliente: ____ / 10

                  Vendedor: ____ / 10

                  Repartidor:___ / 10

          - Clasificación del Cliente

                ☐ Estratégico

                ☐ Potencial

                ☐ Regular

                ☐ Crítico


🔹 FIN O CIERRE DE LA AUDITORÍA:


            - Firma auditor/a: ______________________

            - Firma responsable comercial: ______________________    


🧭 ORDEN DE IMPLEMENTACIÓN (OBLIGATORIO)

Quiero que sigas estrictamente este orden, sin saltearte pasos:

🟢 ETAPA 1 — Análisis y Estructura Base

Resumen de lo entendido

Sugerencias o mejoras

Checklist de seguimiento con estados

Recomendación de tecnologías (pedirme confirmación)

Propuesta de estructura de carpetas

Comando PowerShell para crear estructura

Revisión de lo implementado

🟢 ETAPA 2 — Base de Datos

Recomendación de modelo en Supabase

Explicación paso a paso para crear el proyecto

Creación de scripts SQL

Revisión

🟢 ETAPA 3 — Landing Page + Vercel

Propuesta de diseño

Confirmación

Implementación

Deploy en Vercel

Verificación

🟢 ETAPA 4 — Desarrollo del Sistema

Implementar una por una:

Registro

Login

Usuarios

Clientes

Vendedores

Transportistas

Programación de visitas

Dashboard

En cada una:

Propuesta

Confirmación

Código

Prueba

🟢 ETAPA 5 — Datos de Prueba

Scripts SQL con:

3 meses de auditorías

Zonas de Córdoba

Clientes, visitas, usuarios, etc.

Fechas entre 11/2025 y 01/2026

🟢 ETAPA 6 — Mejoras y recomendaciones

UX

Performance

Seguridad

Escalabilidad

Uso en campo

⚠️ REGLAS DE TRABAJO

❌ No avances sin preguntarme

❌ No hagas suposiciones

✅ Explicá como si fuera principiante

✅ Justificá decisiones técnicas

✅ Mantené un checklist actualizado

✅ Preguntá siempre antes de crear código nuevo

👉 Confirmame primero el análisis del proyecto y esperá mi OK para comenzar la ETAPA 1.