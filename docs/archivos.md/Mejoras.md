Vamos de a una:

Módulo de Referencias:

- Este es un nuevo módulo que quiero implementar.
- Este módulo quiero qué, de forma oculta y que se vean al desplazar, contenga un sub módulo llamado Zonas y otro llamado 
  Transportes.
- Submódulo Zonas: 

      * Formulario para cargar nuevas zonas debe mostrar los siguientes campos:
         1. Fecha Registro: Debe registrar automaticamente la fecha en que se cargo la nueva zona, sin posibilidad de cambiarla manualmente.
         2. Nombre Zona: Campo obligatorio.
         3. Listado de Localidades y ciudades: Me debe mostrar todas las ciudades, localidades y pueblos que contemplen a toda la provincia de Córdoba Argentina. Con la posibilidad de elegir muchas opciones. Este campo obligatoriamente debe contener al menos una opción marcada. No se debe poder marcar una opción que ya se encuentre marcada en otra zona registrada anteriormente (a no ser que la anterior zona haya sido eliminada).
         4. Observciones: Campo de texto largo. Campo opcional.
         5. Botón de cancelar: Debe cancelar el registro limpiando los campos cargados y cerrando el formulario.
         6. Botón de Registrar: Debe mostrar un mensaje de aceptar registro de datos y al dar Aceptar, se deben registrar todos los datos cargados.

         NOTA: Implementar mensajes/notificaciones de error y/o advertencias en caso de datos incorrectos o incumplimientos de funciones.

      * Tabla para mostrar registros cargados:
         1° Columna = Fecha: Debe mostrar la fecha y hora que se registró o editó cada registro.
         2° Columna = Zona: Debe mostrar el registro cargado desde el campo Nombre Zona.
         3° Columna = Acciones: Debe mostrar los siguientes íconos con sus funciones:

                      # Ícono Editar: Debe mostrar el fórmulario para editar los datos registrados de cada zona.
                      # Ícono Eliminar: Para eliminar completamente una zona cargada.
                      # Ícono Ver Detalle: Me debe mostrar la opción de descargar un pdf mostrandome los detalles de la siguiente forma:

                      Fila 1: Título del detalle, ejemplo: Detalle de Zona Registrada + (Fecha y hora de registro).
                      Fila 2: Nombre de la zona.
                      Fila 3: Listado de localidades marcadas para esa zona.
                      Fila 4: Observaciones.
                      Pie de página: usuario que registró esta zona y número de página. 
                      # Antes de aplicar la edición o eliminación de registros, quiero que me muestre un mensaje de aceptación.

- Submódulo Transportes: 

      * Formulario para cargar nuevos trnsportes debe mostrar los siguientes campos:
         1. Fecha Registro: Debe registrar automaticamente la fecha en que se cargo la nueva zona, sin posibilidad de cambiarla manualmente.
         2. Tipo: Lista desplegable con las siguientes opciones: Camión, Utilitario, Auto, Camioneta, Moto, Acoplado, Otro. Campo obligatorio.
         3. Marca: Campo obligatorio de texto corto.
         4. Dimonio/Patente: Campo obligatorio de texto corto.
         5. Observciones: Campo de texto largo. Campo opcional.
         6. Botón de cancelar: Debe cancelar el registro limpiando los campos cargados y cerrando el formulario.
         7. Botón de Registrar: Debe mostrar un mensaje de aceptar registro de datos y al dar Aceptar, se deben registrar todos los datos cargados.

         NOTA: Implementar mensajes/notificaciones de error y/o advertencias en caso de datos incorrectos o incumplimientos de funciones.

      * Tabla para mostrar registros cargados:
         1° Columna = Fecha: Debe mostrar la fecha y hora que se registró o editó cada registro.
         2° Columna = Transporte: Debe mostrar el registro cargado desde el campo Marca.
         3° Columna = Acciones: Debe mostrar los siguientes íconos con sus funciones:

                      # Ícono Editar: Debe mostrar el fórmulario para editar los datos registrados de cada Transporte.
                      # Ícono Eliminar: Para eliminar completamente un transporte cargado.
                      # Ícono Ver Detalle: Me debe mostrar la opción de descargar un pdf mostrandome los detalles de la siguiente forma:

                      Fila 1: Título del detalle, ejemplo: Detalle de Transporte Registrado + (Fecha y hora de registro).
                      Fila 2: Tipo de transporte.
                      Fila 3: Marca del transporte.
                      Fila 4: Dominio/Patente.
                      Fila 5: Observaciones.
                      Pie de página: usuario que registró este transporte y número de página. 
                      # Antes de aplicar la edición o eliminación de registros, quiero que me muestre un mensaje de aceptación.

- Quiero que realices la implementación de estos nuevos módulos de la siguiente forma:

    1° - Pasame un resumen de lo que entendiste y de cómo lo vas a implementar.
    2° - Verifica la estructura necesaria a implementar en la base de datos y pasame los scripts para ejecutarlas.
    3° - Realizar la implementación de los nuevos módulos.
    4° - Verificar funcionamiento y diseños correctos de lo implementado.
    5° - Aplicar correcciones (en caso de ser necesario).
    6° - Una vez declarado el correcto funcionamiento pasaríamos a implementar modificaciones en otros módulos.


Módulo de Clientes:

- El formulario para Cargar clientes quiero que se implemente de la siguiente forma:

            1° Campo Fecha de registro: Siempre debe mostrar la fecha actual, sin posibilidad de modificar.
            2° Campo Nombre Representante: Campo obligatorio de texto corto (Ej, Hasta 100 posiciones).
            3° Campo Contacto: Campo obligatorio de formató E.164 para contacto de celular (Ej: + [código país] [código área] [número], +5493511234567)
            4° Campo email: Campo opcional con formato tipo email. 
            5° Campo Código Interno: Campo obligatorio de texto corto que solo permita números y guiones (-). que no permita espacios ni símbolos o caracteres raros.
            6° Campo Nombre Comercio: Campo obligatorio de texto corto, permitir letras, espacios, puntos, guiones, números y acentos.  (Ej, Hasta 100 posiciones). 
            7° Campo Cuit: Campo obligatorio con el formato [2 dígitos] - [8 dígitos] - [1 dígito verificador], ejemplo: 20-12345678-3.
            8° Campo Zona: Me debe mostrar una lista desplegable con opciones relacionadas con los registros que aparecen en la columna 2 (Zona) de la tabla de Registros de zonas ubicada en el submódulo Zonas.
            9° Campo Localidad/Ciudad: Me debe mostrar una lista desplegable relacionando las localidades marcadas en cada zona, en el registro de Zonas en el submódulo Zonas. Ejemplo, en Zona A marque Villa María y Villa Nueva. Si en el campo 8° Zona (de este formulario) marque Zona A, el campo 9° Localidad/Ciudad (de este formulario), me debe mostrar una lista desplegable con esas dos localidades (Villa María y Villa Nueva).
            10° Campo Provincia: Por defecto me debe cargar automaticamente la provincia de Córdoba, pero con opción desplegable de colocar cualquier otra provincia de Argentina.
            11° Calle: Campo obligatorio de texto corto, ej, 100 posiciones.
            12° Número: Campo obligatorio de formato número entero.
            13° Campo Observaciones: Campo opcional de texto largo.
            14° Campo Estado: (Activo/Inactivo), Por defecto este campo debe cargarse como estado Activo.
            15° Botón de cancelar: Debe cancelar el registro limpiando los campos cargados y cerrando el formulario.
            16° Botón de Registrar: Debe mostrar un mensaje de aceptar registro de datos y al dar Aceptar, se deben registrar todos los datos cargados.

            NOTA: Implementar mensajes/notificaciones de error y/o advertencias en caso de datos incorrectos o incumplimientos de funciones.

- Tabla para mostrar registros cargados:
         1° Columna = Código: Debe mostrar el dato registrado en el campo Código Interno.
         2° Columna = Cliente: Debe mostrar el dato registrado en el campo Nombre Comercio.
         3° Columna = Contacto: Debe mostrar el registro cargado desde el campo Contacto.
         4° Columna = Ubicación: Debe mostrar un ícono que me redirija a la ubicación del comercio en google maps, contemplando los datos cargados en los campos Localidad/Ciudad, Provincia, Calle y Número.
         5° Columna = Estado: Debe mostrar el dato cargado en el campo Estado.
         6° Columna = Acciones: Debe mostrar los siguientes íconos con sus funciones:

                      # Ícono Editar: Debe mostrar el fórmulario para editar los datos registrados de cada Cliente.
                      # Ícono Eliminar: Para eliminar completamente un cliente cargado.
                      # Ícono Ver Detalle: Me debe mostrar la opción de descargar un pdf mostrandome los detalles de la siguiente forma:

                     Fila 1: Título del detalle, ejemplo: Detalle de Cliente Registrado + (Fecha y hora de registro).
                     Fila 2: Nombre Representante.
                     Fila 3: Contacto.
                     Fila 4: email.
                     Fila 5: Código Interno.
                     Fila 6: Nombre Comercio.
                     Fila 7: Cuit.
                     Fila 8: Zona.
                     Fila 9: Localidad/Ciudad.
                     Fila 10: Provincia.
                     Fila 11: Calle.
                     Fila 12: Número.
                     Fila 13: Observaciones.
                     Fila 14: Estado.
                     Pie de página: usuario que registró este transporte y número de página. 
                      # Antes de aplicar la edición o eliminación de registros, quiero que me muestre un mensaje de aceptación.
            
- Quiero que realices la implementación de estos cambios de la siguiente forma:

    1° - Pasame un resumen de lo que entendiste y de cómo lo vas a implementar.
    2° - Verifica la estructura necesaria a implementar/actualizar en la base de datos y pasame los scripts para ejecutarlas.
    3° - Realizar la implementación de los nuevos cambios.
    4° - Verificar funcionamiento y diseños correctos de lo implementado.
    5° - Aplicar correcciones (en caso de ser necesario).
    6° - Una vez declarado el correcto funcionamiento pasaríamos a implementar modificaciones en otros módulos.





Módulo de Vendedores:

- El formulario para Cargar nuevos registros quiero que se implemente de la siguiente forma:

            1° Campo Fecha de registro: Siempre debe mostrar la fecha actual, sin posibilidad de modificar.
            2° Campo Nombre Vendedor: Campo obligatorio de texto corto (Ej, Hasta 100 posiciones).
            3° Campo Contacto: Campo obligatorio de formató E.164 para contacto de celular (Ej: + [código país] [código área] [número], +5493511234567)
            4° Campo email: Campo opcional con formato tipo email. 
            5° Campo Código Interno: Campo obligatorio de texto corto que solo permita números y guiones (-). que no permita espacios ni símbolos o caracteres raros. Este campo debe ser único, no se debe repetir en más de un registro.
            6° Campo DNI: Campo obligatorio con el formato número entero que si o si debe contener 8 números, ni más, ni menos. Automaticamente se deben mostrar con siguiente formato: Primeros 2 números + un punto + Siguentes 3 números + un punto + últimos 3 números. Ej, 35.145.907. Este campo debe ser único, no se debe repetir en más de un registro.
            7° Campo Zona: Me debe mostrar una lista desplegable con opciones relacionadas con los registros que aparecen en la columna 2 (Zona) de la tabla de Registros de zonas ubicada en el submódulo Zonas. Me debe permitir cargar más de una zona.
            9° Campo Residencia: Campo opcional de texto Corto (100 posiciones), que permita cargar letras, numeros, espacios, acentos, puntos y comas.
            10° Campo Observaciones: Campo opcional de texto largo.
            11° Campo Estado: (Activo/Inactivo), Por defecto este campo debe cargarse como estado Activo.
            12° Botón de cancelar: Debe cancelar el registro limpiando los campos cargados y cerrando el formulario.
            13° Botón de Registrar: Debe mostrar un mensaje de aceptar registro de datos y al dar Aceptar, se deben registrar todos los datos cargados.

            NOTA: Implementar mensajes/notificaciones de error y/o advertencias en caso de datos incorrectos o incumplimientos de funciones.

- Tabla para mostrar registros cargados:
         1° Columna = Código: Debe mostrar el dato registrado en el campo Código Interno.
         2° Columna = Vendedor: Debe mostrar el dato registrado en el campo Nombre Vendedor.
         3° Columna = Contacto: Debe mostrar el registro cargado desde el campo Contacto.
         4° Columna = Recidencia: Debe mostrar un ícono que me redirija a la ubicación registrada en el campo Residencia.
         5° Columna = Estado: Debe mostrar el dato cargado en el campo Estado.
         6° Columna = Acciones: Debe mostrar los siguientes íconos con sus funciones:

                      # Ícono Editar: Debe mostrar el fórmulario para editar los datos registrados.
                      # Ícono Eliminar: Para eliminar completamente un registro cargado.
                      # Ícono Ver Detalle: Me debe mostrar la opción de descargar un pdf mostrandome los detalles de la siguiente forma:

                     Fila 1: Título del detalle, ejemplo: Detalle de Vendedor Registrado + (Fecha y hora de registro).
                     Fila 2: Nombre.
                     Fila 3: Contacto.
                     Fila 4: email.
                     Fila 5: Código Interno.
                     Fila 6: DNI.
                     Fila 7: Zona.
                     Fila 8: Residencia.
                     Fila 9: Observaciones.                     
                     Fila 10: Estado.
                     Pie de página: usuario que registró este transporte y número de página. 
                      # Antes de aplicar la edición o eliminación de registros, quiero que me muestre un mensaje de aceptación.
            
- Quiero que realices la implementación de estos cambios de la siguiente forma:

    1° - Pasame un resumen de lo que entendiste y de cómo lo vas a implementar.
    2° - Verifica la estructura necesaria a implementar/actualizar en la base de datos y pasame los scripts para ejecutarlas.
    3° - Realizar la implementación de los nuevos cambios.
    4° - Verificar funcionamiento y diseños correctos de lo implementado.
    5° - Aplicar correcciones (en caso de ser necesario).
    6° - Una vez declarado el correcto funcionamiento pasaríamos a implementar modificaciones en otros módulos.





Módulo de Transportistas:

- El formulario para Cargar nuevos registros quiero que se implemente de la siguiente forma:

            1° Campo Fecha de registro: Siempre debe mostrar la fecha actual, sin posibilidad de modificar.
            2° Campo Nombre Transportista: Campo obligatorio de texto corto (Ej, Hasta 100 posiciones).
            3° Campo Contacto: Campo obligatorio de formató E.164 para contacto de celular (Ej: + [código país] [código área] [número], +5493511234567)
            4° Campo email: Campo opcional con formato tipo email. 
            5° Campo Código Interno: Campo obligatorio de texto corto que solo permita números y guiones (-). que no permita espacios ni símbolos o caracteres raros. Este campo debe ser único, no se debe repetir en más de un registro.
            6° Campo DNI: Campo obligatorio con el formato número entero que si o si debe contener 8 números, ni más, ni menos. Automaticamente se deben mostrar con siguiente formato: Primeros 2 números + un punto + Siguentes 3 números + un punto + últimos 3 números. Ej, 35.145.907. Este campo debe ser único, no se debe repetir en más de un registro.
            7° Campo Zona: Me debe mostrar una lista desplegable con opciones relacionadas con los registros que aparecen en la columna 2 (Zona) de la tabla de Registros de zonas ubicada en el submódulo Zonas. Me debe permitir cargar más de una zona.
            9° Campo Residencia: Campo opcional de texto Corto (100 posiciones), que permita cargar letras, numeros, espacios, acentos, puntos y comas.
            10° Campo Observaciones: Campo opcional de texto largo.
            11° Campo Estado: (Activo/Inactivo), Por defecto este campo debe cargarse como estado Activo.
            12° Botón de cancelar: Debe cancelar el registro limpiando los campos cargados y cerrando el formulario.
            13° Botón de Registrar: Debe mostrar un mensaje de aceptar registro de datos y al dar Aceptar, se deben registrar todos los datos cargados.

            NOTA: Implementar mensajes/notificaciones de error y/o advertencias en caso de datos incorrectos o incumplimientos de funciones.

- Tabla para mostrar registros cargados:
         1° Columna = Código: Debe mostrar el dato registrado en el campo Código Interno.
         2° Columna = Transportista: Debe mostrar el dato registrado en el campo Nombre Transportista.
         3° Columna = Contacto: Debe mostrar el registro cargado desde el campo Contacto.
         4° Columna = Recidencia: Debe mostrar un ícono que me redirija a la ubicación registrada en el campo Residencia.
         5° Columna = Estado: Debe mostrar el dato cargado en el campo Estado.
         6° Columna = Acciones: Debe mostrar los siguientes íconos con sus funciones:

                      # Ícono Editar: Debe mostrar el fórmulario para editar los datos registrados.
                      # Ícono Eliminar: Para eliminar completamente un registro cargado.
                      # Ícono Ver Detalle: Me debe mostrar la opción de descargar un pdf mostrandome los detalles de la siguiente forma:

                     Fila 1: Título del detalle, ejemplo: Detalle del Transportista Registrado + (Fecha y hora de registro).
                     Fila 2: Nombre.
                     Fila 3: Contacto.
                     Fila 4: email.
                     Fila 5: Código Interno.
                     Fila 6: DNI.
                     Fila 7: Zona.
                     Fila 8: Residencia.
                     Fila 9: Observaciones.                     
                     Fila 10: Estado.
                     Pie de página: usuario que registró este transporte y número de página. 
                      # Antes de aplicar la edición o eliminación de registros, quiero que me muestre un mensaje de aceptación.
            
- Quiero que realices la implementación de estos cambios de la siguiente forma:

    1° - Pasame un resumen de lo que entendiste y de cómo lo vas a implementar.
    2° - Verifica la estructura necesaria a implementar/actualizar en la base de datos y pasame los scripts para ejecutarlas.
    3° - Realizar la implementación de los nuevos cambios.
    4° - Verificar funcionamiento y diseños correctos de lo implementado.
    5° - Aplicar correcciones (en caso de ser necesario).
    6° - Una vez declarado el correcto funcionamiento pasaríamos a implementar modificaciones en otros módulos.




       

Módulo de Visitas:

- Quiero que este módulo se muestre como "Programar Visitas".

- El formulario para Programar visitas quiero que se implemente de la siguiente forma:

            1° Campo Auditor: Por defecto debe aparecer el usuario logueado en el momento, pero con opción de cambiar manualmente.
            2° Campo Fecha Programada: Me debe dejar poner fecha y hora manualmente. Nunca me 
                 debe permitir poner una fecha anterior a la actual.
            3° Campo Hora Inicio Estimada: Me debe permitir poner hora en formato hh:mm.
            4° Campo Hora Fin Estimada: Me debe permitir poner hora en formato hh:mm.
            5° Campo Zona: Me debe mostrar una lista desplegable con opciones relacionadas con los registros que aparecen en la columna 2 (Zona) de la tabla de Registros de zonas ubicada en el submódulo Zonas.
            6° Campo Localidad/Ciudad: Me debe mostrar opciones con lista desplegable de las Localidades/Ciudades cargadas según la opción elegida en el campo 5° (Zona).
            7° Campo Cliente: Me debe mostrar una lista desplegable de los clientes cargados, según la opción cargada en el campo 5° (Zona). Teniendo en cuenta que en el módulo Clientes, a cada cliente cargado se le asigna una zona.
            8° Campo Observaciones: Campo opcional de texto largo.
            9° Campo Estado: (Pendiente/Por vencer (Cuando la fecha de vencimiento está dentro de los 2 días antes de la fecha actual)/Vencida (cuando la fecha programada es anterior a la fecha actual)/En Proceso (cuando en el módulo Auditorías le das inicio a la visita pero todavía no esta finalizada)/Finalizada (cuando en el módulo de Auditorías finalizs la visita)), Por defecto este campo debe cargarse como estado Pendiente.
            10° Botón de cancelar: Debe cancelar el registro limpiando los campos cargados y cerrando el formulario.
            11° Botón de Registrar: Debe mostrar un mensaje de aceptar registro de datos y al dar Aceptar, se deben registrar todos los datos cargados.

            NOTA: Implementar mensajes/notificaciones de error y/o advertencias en caso de datos incorrectos o incumplimientos de funciones.

- Quiero implementar unos cambios en la que la tabla de registros de visitas, de modo que quede de la siguiente forma:

1° columna = Fecha Registro: Quiero que me muestre la fecha que se registró la visita, NO la fecha en que está programada realizar la visita.

2° columna = Fecha y Hora de Visita: Quiero que me muestre la fecha y hora en que se programó la visita.

3° columna = Cliente: Quiero que me muestre el nombre del cliente a quien le voy a hacer la auditoría.

4° columna = Auditor: Quiero que me muestre el usuario responsable de la auditoría, o sea, el usuario quien registró la visita.

5° columna = Estado: Quiero que me muestre "Pendiente" desde que se carga la visita hasta que se le da inicio de la misma en el móodulo de Auditorias, una vez que se da inicio quiero que me muestre "En Proceso" hasta que en el módulo de Auditorías se le de finalización, una vez finalizada quiero que me muestre "Finalizada". 

6° columna = Acciones: Quiero que me muestre los siguientes Íconos:
                       - Editar: Solo en caso de que la auditoría NO esté en Estado Finalizada, quiero que éste 
                                     ícono me muestre el formulario  para editar los registros crgados de cada visita 
                                      programada.
                       - Eliminar: Solo si está en estado Pendiente, de lo contrario no me debe permitir eliminar.
                       - Ver detalle: Quiero que me muestre el formulario con todos los datos registrados de la 
                                            auditoría, pero sin ninguna opción de modificarlos ni eliminarlos, que sea 
                                             solo en modo vista. Lo único que quiero agregar en esta parte es qué el 
                                             formulario me muestre un ícono para descargar el detalle en pdf.

- Quiero que realices la implementación de estos nuevos módulos de la siguiente forma:

    1° - Pasame un resumen de lo que entendiste y de cómo lo vas a implementar.
    2° - Verifica la estructura necesaria a implementar en la base de datos y pasame los scripts para ejecutarlas.
    3° - Realizar la implementación de los nuevos módulos.
    4° - Verificar funcionamiento y diseños correctos de lo implementado.
    5° - Aplicar correcciones (en caso de ser necesario).
    6° - Una vez declarado el correcto funcionamiento pasaríamos a implementar modificaciones en otros módulos.
                          