Necesito que modifiques el formulario **"Auditoría"** que se muestra desde la págia Visitas para implementar un nuevo modelo de evaluación tipo checklist 360° con puntaje automático.

IMPORTANTE 01: El formulrio "Auditoría" que se muestra en la página Auditorías, queda totalmente excento, en más, quiero que también elimines de esta página el botón Nueva Auditoría.

IMPORTANTE 02:

* Mantener el diseño actual (fondo oscuro y letras claras)
* Mantener el ícono y funcionalidad de **"Ver detalle visita"**
* Mantener SIN CAMBIOS la sección **"Datos de la Auditoría"** porque ya funciona correctamente
* Solo modificar la sección de evaluación
* El formulario debe seguir funcionando con Supabase

---

OBJETIVO

Reemplazar el modelo actual de auditoría por un sistema de evaluación 360° donde:

* Cliente evalúa Vendedor y Transporte
* Vendedor evalúa Cliente y Transporte
* Transporte evalúa Cliente y Vendedor

Cada pregunta debe tener puntaje del 1 al 4:
1 = Malo
2 = Regular
3 = Bueno
4 = Muy Bueno

El sistema debe calcular automáticamente:

* Puntaje Cliente
* Puntaje Vendedor
* Puntaje Transporte
* Puntaje General

---

ESTRUCTURA NUEVA DEL FORMULARIO

(SECCIÓN 1 NO SE MODIFICA)
Datos de la Auditoría

* Cliente
* Vendedor
* Transportista
* Fecha
* Observaciones generales

---

SECCIÓN 2 - Cliente evalúa Vendedor

Campos:
cliente_eval_vendedor_pasa_regularmente
cliente_eval_vendedor_responde
cliente_eval_vendedor_cumple
cliente_eval_vendedor_promos
cliente_eval_vendedor_entendimiento
cliente_eval_vendedor_actitud
cliente_eval_vendedor_facilidad

---

SECCIÓN 3 - Cliente evalúa Transporte

Campos:
cliente_eval_transporte_horario
cliente_eval_transporte_avisa
cliente_eval_transporte_trato
cliente_eval_transporte_completo
cliente_eval_transporte_estado
cliente_eval_transporte_descarga
cliente_eval_transporte_actitud

---

SECCIÓN 4 - Vendedor evalúa Cliente

Campos:
vendedor_eval_cliente_atencion
vendedor_eval_cliente_predisposicion
vendedor_eval_cliente_pedidos
vendedor_eval_cliente_condiciones
vendedor_eval_cliente_sugerencias
vendedor_eval_cliente_exhibicion
vendedor_eval_cliente_orden

---

SECCIÓN 5 - Transporte evalúa Cliente

Campos:
transporte_eval_cliente_atencion
transporte_eval_cliente_descarga
transporte_eval_cliente_firma
transporte_eval_cliente_horarios
transporte_eval_cliente_espacio
transporte_eval_cliente_demoras
transporte_eval_cliente_predisposicion

---

SECCIÓN 6 - Vendedor evalúa Transporte

Campos:
vendedor_eval_transporte_comunicacion
vendedor_eval_transporte_cumplimiento
vendedor_eval_transporte_avisos
vendedor_eval_transporte_coordinacion
vendedor_eval_transporte_errores

---

SECCIÓN 7 - Transporte evalúa Vendedor

Campos:
transporte_eval_vendedor_claridad
transporte_eval_vendedor_correctos
transporte_eval_vendedor_cambios
transporte_eval_vendedor_coordinacion
transporte_eval_vendedor_confusion

---

TIPO DE CAMPOS

Todos los campos deben ser tipo número entero:
Valores permitidos:
1 = Malo
2 = Regular
3 = Bueno
4 = Muy Bueno

Usar selects o radio buttons.

---

CÁLCULOS AUTOMÁTICOS

Agregar cálculo automático en el frontend:

puntaje_cliente =
promedio de:

* vendedor_eval_cliente_*
* transporte_eval_cliente_*

puntaje_vendedor =
promedio de:

* cliente_eval_vendedor_*
* transporte_eval_vendedor_*

puntaje_transporte =
promedio de:

* cliente_eval_transporte_*
* vendedor_eval_transporte_*

puntaje_general =
promedio de:

* puntaje_cliente
* puntaje_vendedor
* puntaje_transporte

Mostrar en pantalla:

Puntaje Cliente: X.X
Puntaje Vendedor: X.X
Puntaje Transporte: X.X
Puntaje General: X.X

---

RESULTADO AUTOMÁTICO

Agregar función:

si puntaje >= 3.5 → Excelente
si puntaje >= 2.5 → Bueno
si puntaje >= 1.5 → Regular
si puntaje < 1.5 → Malo

Mostrar resultado al lado del puntaje.

---

BASE DE DATOS (SUPABASE)

Si hace falta modificar la tabla "auditorias":
Generar script SQL compatible con Supabase para:

* Agregar columnas nuevas
* Tipo INTEGER
* Default NULL
* Sin borrar datos existentes

Ejemplo:

ALTER TABLE auditorias
ADD COLUMN cliente_eval_vendedor_pasa_regularmente INTEGER;

---

IMPORTANTE

NO romper:

* Ver detalle visita
* Guardado
* Edición
* Supabase
* Estilos
* Navegación

---

DISEÑO

Mantener:

* Fondo oscuro
* Texto claro
* Estilo actual
* Tarjetas o secciones
* Iconos actuales

---

ENTREGA ESPERADA

1 - Código actualizado del formulario Auditoría
2 - Funciones de cálculo
3 - Script SQL para Supabase (si hace falta)
4 - Mantener compatibilidad con registros existentes

---

Si algo del modelo actual entra en conflicto, priorizar el nuevo modelo.

