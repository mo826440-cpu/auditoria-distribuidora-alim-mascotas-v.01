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

       

Módulo de Visitas: 

- El formulario para Programar visitas quiero que se implemente de la siguiente forma:

            1° Campo Fecha de registro: Siempre debe mostrar la fecha actual, sin posibilidad de modificar.
            2° Campo Fecha y hora de visita: Me debe dejar poner fecha y hora manualmente. Nunca me 
                 debe permitir poner una fecha anterior a la actual. 
            3° Campo Zona: Me debe mostrar una lista desplegable según las Zonas cargadas en Módulo de 
                 referencias.

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
                          