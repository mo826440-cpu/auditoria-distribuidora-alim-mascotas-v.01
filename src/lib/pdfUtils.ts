/**
 * Utilidad para generar PDF usando la ventana de impresión del navegador.
 * El usuario puede elegir "Guardar como PDF" en el diálogo de impresión.
 */
export function imprimirComoPdf(
  titulo: string,
  contenido: string,
  piePagina: string
) {
  const ventana = window.open("", "_blank");
  if (!ventana) {
    alert("Permití ventanas emergentes para descargar el PDF.");
    return;
  }
  const escapedTitulo = titulo.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapedPie = piePagina.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  ventana.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapedTitulo}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
        h1 { font-size: 18px; margin-bottom: 24px; }
        .fila { margin-bottom: 16px; }
        .etiqueta { font-weight: bold; color: #374151; margin-bottom: 4px; }
        .valor { white-space: pre-wrap; }
        .pie { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      ${contenido}
      <div class="pie">${escapedPie}</div>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() { window.close(); };
        };
      </script>
    </body>
    </html>
  `);
  ventana.document.close();
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function contenidoPdfZona(
  fechaHora: string,
  nombre: string,
  localidades: string[],
  observaciones: string
) {
  return `
    <h1>Detalle de Zona Registrada (${esc(fechaHora)})</h1>
    <div class="fila"><div class="etiqueta">Nombre de la zona</div><div class="valor">${esc(nombre)}</div></div>
    <div class="fila"><div class="etiqueta">Localidades</div><div class="valor">${esc(localidades.join(", "))}</div></div>
    <div class="fila"><div class="etiqueta">Observaciones</div><div class="valor">${esc(observaciones || "—")}</div></div>
  `;
}

export function contenidoPdfCliente(
  fechaHora: string,
  nombreRepresentante: string,
  contacto: string,
  email: string,
  codigoInterno: string,
  nombreComercio: string,
  cuit: string,
  zona: string,
  localidad: string,
  provincia: string,
  calle: string,
  numero: number,
  observaciones: string,
  estado: string
) {
  return `
    <h1>Detalle de Cliente Registrado (${esc(fechaHora)})</h1>
    <div class="fila"><div class="etiqueta">Nombre Representante</div><div class="valor">${esc(nombreRepresentante)}</div></div>
    <div class="fila"><div class="etiqueta">Contacto</div><div class="valor">${esc(contacto)}</div></div>
    <div class="fila"><div class="etiqueta">Email</div><div class="valor">${esc(email || "—")}</div></div>
    <div class="fila"><div class="etiqueta">Código Interno</div><div class="valor">${esc(codigoInterno)}</div></div>
    <div class="fila"><div class="etiqueta">Nombre Comercio</div><div class="valor">${esc(nombreComercio)}</div></div>
    <div class="fila"><div class="etiqueta">CUIT</div><div class="valor">${esc(cuit)}</div></div>
    <div class="fila"><div class="etiqueta">Zona</div><div class="valor">${esc(zona || "—")}</div></div>
    <div class="fila"><div class="etiqueta">Localidad/Ciudad</div><div class="valor">${esc(localidad || "—")}</div></div>
    <div class="fila"><div class="etiqueta">Provincia</div><div class="valor">${esc(provincia || "—")}</div></div>
    <div class="fila"><div class="etiqueta">Calle</div><div class="valor">${esc(calle)}</div></div>
    <div class="fila"><div class="etiqueta">Número</div><div class="valor">${esc(String(numero))}</div></div>
    <div class="fila"><div class="etiqueta">Observaciones</div><div class="valor">${esc(observaciones || "—")}</div></div>
    <div class="fila"><div class="etiqueta">Estado</div><div class="valor">${esc(estado)}</div></div>
  `;
}

export function contenidoPdfVendedor(
  fechaHora: string,
  nombre: string,
  contacto: string,
  email: string,
  codigoInterno: string,
  dni: string,
  zonas: string,
  residencia: string,
  observaciones: string,
  estado: string
) {
  return `
    <h1>Detalle de Vendedor Registrado (${esc(fechaHora)})</h1>
    <div class="fila"><div class="etiqueta">Nombre</div><div class="valor">${esc(nombre)}</div></div>
    <div class="fila"><div class="etiqueta">Contacto</div><div class="valor">${esc(contacto)}</div></div>
    <div class="fila"><div class="etiqueta">Email</div><div class="valor">${esc(email || "—")}</div></div>
    <div class="fila"><div class="etiqueta">Código Interno</div><div class="valor">${esc(codigoInterno)}</div></div>
    <div class="fila"><div class="etiqueta">DNI</div><div class="valor">${esc(dni)}</div></div>
    <div class="fila"><div class="etiqueta">Zona</div><div class="valor">${esc(zonas || "—")}</div></div>
    <div class="fila"><div class="etiqueta">Residencia</div><div class="valor">${esc(residencia || "—")}</div></div>
    <div class="fila"><div class="etiqueta">Observaciones</div><div class="valor">${esc(observaciones || "—")}</div></div>
    <div class="fila"><div class="etiqueta">Estado</div><div class="valor">${esc(estado)}</div></div>
  `;
}

export function contenidoPdfTransporte(
  fechaHora: string,
  tipo: string,
  marca: string,
  dominioPatente: string,
  observaciones: string
) {
  const tipoLabel: Record<string, string> = {
    camion: "Camión",
    utilitario: "Utilitario",
    auto: "Auto",
    camioneta: "Camioneta",
    moto: "Moto",
    acoplado: "Acoplado",
    otro: "Otro",
  };
  return `
    <h1>Detalle de Transporte Registrado (${esc(fechaHora)})</h1>
    <div class="fila"><div class="etiqueta">Tipo</div><div class="valor">${esc(tipoLabel[tipo] || tipo)}</div></div>
    <div class="fila"><div class="etiqueta">Marca</div><div class="valor">${esc(marca)}</div></div>
    <div class="fila"><div class="etiqueta">Dominio/Patente</div><div class="valor">${esc(dominioPatente)}</div></div>
    <div class="fila"><div class="etiqueta">Observaciones</div><div class="valor">${esc(observaciones || "—")}</div></div>
  `;
}
