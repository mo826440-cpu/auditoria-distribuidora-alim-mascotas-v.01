📋 Descripción del sistema — App de auditorias comerciales.

Necesito que me ayudes a crear un prompt para pedirle a Cursor (desarrollador de programación con IA) que me cree una aplicación que se pueda usar tanto en el celular como en pc y tanto online como offline. El objetivo de esta app es gestionar visitas/auditorías comerciales a clientes de una empresa distribuidora de alimentos para mascotas ubicada en villa maría, córdoba. Esta empresa distribuye al por mayor en petshopps, veterinarias, almacenes, supermercados, etc. La idea de esta app es que un representante de la empresa visite a los clientes completando toda la información posible del cliente en si y del trato que tienen con los vendedores y repartidores de la distribuidora.

Te paso una idea de lo que tengo pensado de como quiero que sea la app:

1º Quiero que sea una app simple de entender pero de un estilo moderno.

2º La base de datos la quiero crear en supabase, pero me imagino que para el manejo offline también debe tener una base local.

3º La conección online quiero realizarla a traves de vercel. La idea sería ir haciendo commit y push en hithub y que vercel los vaya detectando automaticamente. (con todo esto cursor me debe ir guiando para implementarlo porque no se bien cómo hacerlo)

4º Te resumo el flujo de cómo me gustaria que sea la app:

      1. LandingPage con botón para descargar la app en pc o celular (android, mac, windows o apple)
      2. Ventana de Registrarse.
      3. Ventana de Inicio de sesión
       . Dentro de la app (una vez ingresado):
                    4. Ventana de dashboard
                    5. Ventana de Registro de usuarios
                    6. Ventana de Registro de clientes
                    7. Ventana de Registro de vendedores
                    8. Ventana de Registro de Transportistas
                    9. Ventana de Programación de visitas (tipo un calendario de visitas, por zonas)
                  
                    - Todas las ventanas en su parte superior deben contener Botón de cerrar sesión, fecha y 
                       hora actual, según horario de argentina y detalle del usuario logueado.
                    - El navegador de las ventanas debe estar en la parte izquierda de la pantalla de forma 
                       vertical, pero oculto en un botón tipo hamburguesa.

5º Detalle de cada ventana:

     1. LandingPage:
             - Debe contener información onda marketinera sobre la app.
             - Debe contener un botón para descargar la app en pc o celular (android, mac, windows o 
               apple).

      2. Ventana de Registrarse:
           - Debe contener un formulario de registro con los siguientes campos: Nombre Usuario, Mail y 
              Contraseña (con ícono para mostrar contraseña).
           - Debe contener botones de Cancelar (que redirija a la landingpage) y de Finalizar registro.
           - Al registrarse, como requisito principal, se debe crear el usuario normalmente en autenticación de supabase, 
             pero también, en la tabla usuarios (tabla creada en supabase que más adelante la voy a detallar) se debe crear ese mismo usuario con rol de administrador y una id UNICA de comercio que le dará acceso a la app completamente en estado inicial para que comience a usarla desde cero. Por cada usuario que se registre desde esta ventana, se le dará acceso a la app totalmente vacía para que pueda usar desde cero en su comercio. Luego, cada usuario con rol administrador podrá gestionar dentro de la app (desde la ventana de Registro de usuarios) el acceso a nuevos usuarios con sus roles correspondientes.

      3. Ventana de Inicio de sesión:
             - Debe contener un formulario con campos necesarios para cargar mail y contraseña.
             - Debe contener botón de cancelar (que redirija a la landingpge).
             - Debe cotener botón de ingresar, que si los datos son correctos, que ingrese a la app según 
               usuario logueado, pero si los datos no son correctos que muestre un mensaje de error.

      4. Ventana de dashboard:
             - Debe contener Indicadores y Graficos con el objetivo de analizar todos los datos cargados y 
                tomar las mejores desiciones posibles.

      5. Ventana de Registro de usuarios:
             - Debe contener Un botón para registrar nuevos usuarios. Estos usuarios como requisitos 
                importantes debe contener la misma id de comercio que el usuario administrador logueado 
                en el momento que los crea, con el objetivo de que solo puedan ingresar e interactuar en la 
                cuenta del usuario/comercio logueado.
              - Formulario para cargar usuarios, debe contener campos para cargar: 
                    * Nombre de usuario - Campo obligatorio.
                    * Rol  - Campo obligatorio (Este campo debe cargarse con lista desplegable Visitante - Administrador 
                      - Auditor)
                    * Mail  - Campo obligatorio.
                    * Contraseña.  - Campo obligatorio.
              - Por ahora, la unica normativa que se  aplicara es la siguiente: Rol Visitante solo podrá ver la ventana  
                del dashboard, Rol Administrador tendrá acceso a todas las ventanas y Rol auditor tendrá acceso a todas las ventanas menos a la ventana de Registros de usuarios. Es muy importante que a la ventana de registro de usuarios solamente tenga acceso el usuario con rol de administrador.
             - Debe contener una tabla que me muestre los usuarios registrados con las siguientes 
                columnas: 
                         1. Fecha y hora de registro 
                         2. Nombre Usuario 
                         3. mail 
                         4. Contraseña (oculta) 
                         5. Acciones (con botones de ver contraseña, editar usuario y eliminar usuarios, estas acciones   
                            quiero que esten representadas con íconos).
             - Cada vez que se cree, edite o elimine un usuario, antes de completar la acción, el sistema me debe arrojar un mensaje de aceptación.
             - Teniendo en cuenta los detalles a registrar en esta página, voy a necesitar que Cursor me genere un script 
               ideal llamado "01.scriptTablaUsuarios" para ejecutar en supabase y me cree la tabla recomendada.

      6. Ventana de Registro de clientes:

            - Debe contener Un botón para registrar nuevos clientes.
            - Formulario para cargar clientes, debe contener campos para cargar:
                 * Nombre del comercio - Campo obligatorio.
                 * Nombre del contacto/dueño  - Campo obligatorio.
                 * Código interno  - Campo obligatorio.
                 * Fecha de inicio como cliente - Campo obligatorio.
                 * Zona  - Campo obligatorio. (este campo debe cargarse con lista desplegable y a su derecha debe 
                   contener un ícono tipo botón que me permita cargar, eliminar o editar las zonas que apareceran en la lista desplegable).
                 * Ubicación - Campo obligatorio.
                 * Tipo de cliente: ☐ Petshop ☐ Almacén ☐ Supermercado ☐ Otro
                 * Observaciones  - Campo opcional.
                 * Botón de cancelar (que cierre el formulario).
                 * Botón de cargar (que registre los datos cargados y cierre el formulario. Pero antes me debe mostrar un 
                   mensaje de aceptación o de error si falta algún dato importante).
            - Debe contener una tabla que me muestre los clientes registrados con las siguientes columnas: 
                         1. Fecha y hora de registro 
                         2. Nombre Comercio 
                         3. Nombre Contacto/dueño 
                         4. Código interno
                         5. Zona 
                         6. Acciones (con botones de editar cliente, eliminar cliente y ver más detalles como observaciones, ubicación y antiguedad como cliente. Estas acciones quiero que esten representadas con íconos). 
            - Cada vez que se cree, edite o elimine un cliente, antes de completar la acción, el sistema me debe arrojar 
              un mensaje de aceptación.
             - Teniendo en cuenta los detalles a registrar en esta página, voy a necesitar que Cursor me genere un script 
               ideal llamado "02.scriptTablaClientes" para ejecutar en supabase y me cree la tabla recomendada.

      7. Ventana de Registro de Vendedores:

            - Debe contener Un botón para registrar Vendedores.
            - Formulario para registrar vendedores, debe contener campos para cargar:
                 * Nombre del vendedor - Campo obligatorio.
                 * Código interno  - Campo obligatorio.
                 * Fecha en que el vendedor comenzó a trabajar en la empresa - CAmpo obligatorio.
                 * Contacto
                 * Observaciones  - Campo opcional.
                 * Botón de cancelar (que cierre el formulario).
                 * Botón de cargar (que registre los datos cargados y cierre el formulario. Pero antes me debe mostrar un 
                   mensaje de aceptación o de error si falta algún dato importante).
            - Debe contener una tabla que me muestre los vendedores registrados con las siguientes columnas: 
                         1. Fecha y hora de registro 
                         2. Nombre Vendedor 
                         3. Contacto
                         4. Código interno
                         5. Observaciones
                         6. Acciones (con botones de editar vendedor, eliminar vendedor y ver otros detalles como observaciones y antiguedad en la empresa. Estas acciones quiero que esten representadas con íconos). 
            - Cada vez que se cree, edite o elimine un vendedor, antes de completar la acción, el sistema me debe arrojar 
              un mensaje de aceptación.
            - Teniendo en cuenta los detalles a registrar en esta página, voy a necesitar que Cursor me genere un script 
               ideal llamado "03.scriptTablaVendedores" para ejecutar en supabase y me cree la tabla recomendada.

      8. Ventana de Registro de Transportistas:

            - Debe contener Un botón para registrar Transportistas.
            - Formulario para registrar transportistas, debe contener campos para cargar:
                 * Nombre del transportistas - Campo obligatorio.
                 * Código interno  - Campo obligatorio.
                 * Fecha en que el transportista comenzó a trabajar en la empresa - Campo obligatorio.
                 * Fecha en que el transportista se le vence su carnet de conducir.
                 * Contacto
                 * Observaciones  - Campo opcional.
                 * Botón de cancelar (que cierre el formulario).
                 * Botón de cargar (que registre los datos cargados y cierre el formulario. Pero antes me debe mostrar un 
                   mensaje de aceptación o de error si falta algún dato importante).
            - Debe contener una tabla que me muestre los Transportistas registrados con las siguientes columnas: 
                         1. Fecha y hora de registro 
                         2. Nombre Transportistas 
                         3. Contacto
                         4. Código interno
                         5. Observaciones
                         6. Estado del carnet de conducir (Actualizdo (color verde) - A dos meses de vencer (color amarillo) - Vencido (color rojo)).
                         7. Acciones (con botones de editar vendedor, eliminar vendedor y ver otros detalles como observaciones y antiguedad en la empresa. Estas acciones quiero que esten representadas con íconos). 
            - Cada vez que se cree, edite o elimine un vendedor, antes de completar la acción, el sistema me debe arrojar 
              un mensaje de aceptación.
            - Teniendo en cuenta los detalles a registrar en esta página, voy a necesitar que Cursor me genere un script 
               ideal llamado "03.scriptTablaVendedores" para ejecutar en supabase y me cree la tabla recomendada.



      9. Ventana de Programación de visitas:

            - Debe contener Un botón para Programar Visitas.
            - Formulario para Programar visitas, debe contener campos para cargar:
                    * Fecha y Hora de Visita - Campo obligatorio.
                    * Zona - Campo obligatorio. (se debe cargar con lista desplegable, según las zonas cargadas en 
                      registro de clientes).
                    * Comercio - Campo obligatorio. Me debe mostrar una lista desplegable de los comercios cargados en 
                      Registros de clientes, pero, solo los que coincidan con los datos cargados en el campo zona.
                    * Ubicación - se debe cargar automaticamente según lo registrado en campo Ubicación del formulario de 
                      registros de clientes, relacionando el dato cargado en el campo Cliente de este formulario con el dato cargado en el campo Nombre del comercio del formulario de registro de clientes.
                    * Tipo de cliente - se debe cargar automaticamente según lo registrado en campo Tipo de cliente en 
                      formulario de registros de clientes, relacionando el dato cargado en el campo Cliente de este formulario con el dato cargado en el campo Nombre del comercio del formulario de registro de clientes.


                    * Responsable de auditoría - Campo obligatorio. Me debe mostrar una lista desplegable de los usuarios 
                      cargados en Registro de usuarios (todos, sin importar el rol).
                    * Observaciones - Campo opcional.
                    * Botón de cancelar (que cierre el formulario).
                    * Botón de cargar (que registre los datos cargados y cierre el formulario. Pero antes me debe mostrar 
                      un mensaje de aceptación o de error si falta algún dato importante).               
            - Debe contener un calendario tipo Google calendar que me muestre las visitas registradas de los siguientes 7 
              días desde el día actual (con opción de filtrar para atras o para adelante). Lo que debo ver en el calendario es lo siguiente:
                    1. El nombre del cliente a visitar.
                    2. El estado de la visita (pendiente o realizada).
                    3. Una acción para ver detalle de la visita (o sea, los registros cargados al cargar la visita).
                    4. Una acción para editar los dato de la visita.
                    5. Una acción para eliminar la visita.
                    6. Una acción para registrar los datos obtenidos de la visita, que abrirá un formulario tipo 
                       checklist y con diferentes campos para ir registrando todo lo reclutado.
                    - Las acciones quiero que estén representadas con íconos.
            - Cada vez que se cree, edite o elimine un registro, antes de completar la acción, el sistema me debe arrojar 
              un mensaje de aceptación.
            - Formulario para la acción de registrar los datos obtenidos en la visita: (ver en el apartado NOTA 2)
            - Teniendo en cuenta los detalles a registrar en esta página, voy a necesitar que Cursor me genere un script 
               ideal llamado "04.scriptTablaProgramacionVisitas" y otro llamado "05.scriptTablaRegistroAuditoria", para ejecutar en supabase y me cree la tabla recomendada.


NOTA 1: Los campos de los formularios se deben adaptar a los formatos más convenientes, ejemplo, campos de fecha ("dd/mm/yyyy hh:mm) con fecha y hor de argentina. Campos de mail (formato email), campos id (solo números enteros) campos de observaciones (formato de texto largo), campos de Nombres (formato de texto corto), Campos de contraseñas (formato de vista oculta), etc.

NOTA 2: Formulario para la acción de registrar los datos obtenidos en la visita:

       Checklist de Auditoría - Distribuidora de Alimentos para Mascotas – Villa María, Córdoba

       Objetivo: Evaluar de manera ordenada y objetiva:

       La calidad y situación de los clientes (petshops, almacenes y supermercados).

       El desempeño y cumplimiento de los vendedores propios de la distribuidora.

       El desempeño y cumplimiento de los repartidores propios de la distribuidora.

      Este checklist está pensado para auditorías de campo (visitas) y puede adaptarse según el tipo de cliente.


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


 NOTA 3: Para tener en cuenta al momento de hacer un análisis de los registros.
 
          - Acciones a Tomar

                ☐ Capacitación al vendedor

                ☐ Mejora de exhibición

                ☐ Revisión de condiciones comerciales

                ☐ Seguimiento especial

                ☐ Otras acciones

                ☐ Sin acciones necesarias

                Detalle de acciones propuestas:



          - Cómo usar este checklist en la práctica
                   1. No es un examen: es una radiografía

                             La idea no es “buscar errores”, sino detectar:

                                        * clientes mal atendidos

                                        * clientes con potencial desaprovechado

                                        * vendedores que cumplen vs vendedores que solo pasan a saludar

                                        * Si lo usás con esa cabeza, suma un montón.

                    2. No todos los clientes son iguales (y está bien)

                            Cuando audites:

                                        * Petshop → más foco en exhibición, asesoramiento y variedad

                                        * Almacén → rotación, precios y reposición

                                        * Supermercado → logística, quiebres de stock y cumplimiento

                   👉 El checklist es el mismo, pero las observaciones cambian.

          - Lo clave que la empresa seguramente quiere ver

                             Sin decirlo, normalmente buscan responder estas preguntas:

                                        * ¿Los vendedores realmente venden o solo toman pedidos?

                                        * ¿La marca está bien parada en los puntos de venta?

                                        * ¿Hay clientes que podrían comprar más?

                                        * ¿Se están perdiendo ventas por mala exhibición o falta de seguimiento?

                             Este checklist responde todo eso.

          - Tip pro (queda muy bien a nivel gerencial)

                             Después de 10–15 auditorías, podés:

                                        * clasificar clientes (estratégico / potencial / regular / crítico)

                                        * detectar patrones:

                                                  - “en esta zona el vendedor casi no ofrece promos”

                                                  - “en supermercados hay quiebres de stock recurrentes”

                             Eso ya es nivel analista, no solo “llenar planillas”.


NOTA 4: Tener en cuenta que hay partes de la auditoría que se puede empezar desde la sede de la distribuidora y luego seguir en el punto de venta, por lo cual, el formulario de la auditoría debe permitir poder editarse todas las veces que sea necesario. 

NOTA 5: Te voy a poner un orden de cómo quiero que Cursor me vaya implementando todo: (quiero que cursor cree un checklist para dar seguimiento a este orden):

      1º ETAPA INICIAL Y ESTRUCTURA BASE
      
         (a) Análisis y comprención del prompt:
                  - Resumen de lo entendido
                  - Aceptación o sugerencia de mejoras
                  - Recomendaciones sugeridas para el desarrollo
                  - Recomendaciones sugeridas sobre la descripción del sistema

         (b) Creación del checlist de seguimiento:
                  - Quiero que tenga indicadores de seguimiento
                  - Cada vez que se realice un avance quiero que cursor me actualice este checklist

         (c) Lenguajes de programación a utilizar:
                  - Quiero que Cursor me de recomendaciones sobre qué lenguajes de programación utilizar y me pregunte si 
                    estoy deacuerdo

         (d) Creación de estructura base donde se alojara localmente el proyecto:
                  - Quiero que me de un pantallazo de las carpetas y archivos a crear y la ubicación.
                  - Antes de crear todo quiero que me pregunte si estoy de acuerdo o si prefiero un cambio.
                  - Para crear las carpetas donde se alojarán los archivos quiero que me pase un comando ejecutable en 
                    powershell.

         (d) Revisión: quiero que Cursor revise si todo lo implementado se realizo correctamente. 


      2º ETAPA DE DESARROLLO DE BASE DE DATOS
      
         (a) Recomendación:
                  - Quiero que Cursor me presente recomendaciones de cómo puede estar implementada la base de datos en 
                    SUPABASE.
                  - Que me pregunte si estoy de acuerdo.
                  - Que me enseñe a crear la base de datos desde cero.  

         (b) Creación:
                  - Quiero que cursor me cree los scripts para crear la base de datos en supabase.
                  - Los scripts deben quedar guardados en una carpeta llamada scriptsBaseDatos (o similar). 
                  - Quiero que los nombres de los scripts se vayan enumerando de forma ascendente, ej: 01.scriptsTablaComercios.sq, 02.scriptTablaUsuarios.sql, etc.

         (d) Revisión: quiero que Cursor revise si todo lo implementado se realizo correctamente.

      5º ETAPA DE CREACIÓN INICIAL DEL SISTEMA

              (a) LandingPage:

                   - Quiero que cursor me recomiende el diseño, las funciones y la información cargada en la landingpage.
                   - Quiero que me pregunte si estoy de acuerdo con lo propuesto.
                   - Quiero que comience con la creación y que me avise cuando termine.
                   - Quiero que verifiquemos si se creo correctamente.

              (b) Vercel

                   - Quiero que Cursor me yude a cargar el proyecto en Vercel y verificar su correcto funcionamiento.

      6º ETAPA DE CREACIÓN GENERAL DEL SISTEMA
     

              (a) Registrarse:

                   - Quiero que cursor me recomiende el diseño, las funciones y la información cargada en la ventana y 
                     formulario de registro.
                   - Crear los archivos.
                   - Probar lo implementado y verificar si esta correcto.

              (b) Iniciar sesión:

                   - Quiero que cursor me recomiende el diseño, las funciones y la información cargada en la ventana y 
                     formulario de registro.
                   - Crear los archivos.
                   - Probar lo implementado y verificar si esta correcto.

              (c) Ventana de Registro de usuarios:

                   - Quiero que cursor me recomiende el diseño, las funciones y la información cargada en la ventana y 
                     formulario de registro.
                   - Crear los archivos.
                   - Probar lo implementado y verificar si esta correcto.

              (d) Ventana de Registro de clientes:

                   - Quiero que cursor me recomiende el diseño, las funciones y la información cargada en la ventana y 
                     formulario de registro.
                   - Crear los archivos.
                   - Probar lo implementado y verificar si esta correcto.

              (e) Ventana de Registro de vendedores:

                   - Quiero que cursor me recomiende el diseño, las funciones y la información cargada en la ventana y 
                     formulario de registro.
                   - Crear los archivos.
                   - Probar lo implementado y verificar si esta correcto.

              (f) Ventana de Registro de transportistas: (esta ventana no la)

                   - Quiero que cursor me recomiende el diseño, las funciones y la información cargada en la ventana y 
                     formulario de registro.
                   - Crear los archivos.
                   - Probar lo implementado y verificar si esta correcto.

              (g) Ventana de Programación de visitas:

                   - Quiero que cursor me recomiende el diseño, las funciones y la información cargada en la ventana y 
                     formulario de registro.
                   - Crear los archivos.
                   - Probar lo implementado y verificar si esta correcto.

              (h) Ventana de dashboard:

                   - Quiero que cursor me recomiende el diseño, las funciones y la información cargada en la ventana y 
                     formulario de registro.
                   - Crear los archivos.
                   - Probar lo implementado y verificar si esta correcto.

      7º ETAPA DE PRUEBA

              (a) Scripts de pruebas:

                    - Quiero que Cursor me genere scripts para cargar datos de pureba que me representen a 3 meses de 
                      auditoría, en diferentes escenarios y zonas de córdoba.
                    - Los tres meses pueden ser del 11/2025 al 01/2026.
                    - Pueden representar unas 3 auditorías por zona y por mes.
                    - Los scripts deben estar pensados para registrar ejemplos de Un solo usuario, Vendedores (2 o 3), 
                      Transportistas (3 o 4), Clientes (5 por zona), Por zona y por mes unas 3 o 4 visitas ya registrada y una programación de visitas para los próximos 7 días.

      7º ETAPA DE MEJORAS Y RECOMENDACIONES DE USO

                