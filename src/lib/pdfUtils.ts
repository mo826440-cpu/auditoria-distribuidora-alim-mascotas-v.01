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
  tipoComercio: string,
  cuit: string,
  zona: string,
  localidad: string,
  provincia: string,
  calle: string,
  numero: number,
  vendedorFrecuente: string,
  transportistaFrecuente: string,
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
    <div class="fila"><div class="etiqueta">Tipo de comercio</div><div class="valor">${esc(tipoComercio || "—")}</div></div>
    <div class="fila"><div class="etiqueta">CUIT</div><div class="valor">${esc(cuit)}</div></div>
    <div class="fila"><div class="etiqueta">Zona</div><div class="valor">${esc(zona || "—")}</div></div>
    <div class="fila"><div class="etiqueta">Localidad/Ciudad</div><div class="valor">${esc(localidad || "—")}</div></div>
    <div class="fila"><div class="etiqueta">Provincia</div><div class="valor">${esc(provincia || "—")}</div></div>
    <div class="fila"><div class="etiqueta">Calle</div><div class="valor">${esc(calle)}</div></div>
    <div class="fila"><div class="etiqueta">Número</div><div class="valor">${esc(String(numero))}</div></div>
    <div class="fila"><div class="etiqueta">Vendedor frecuente</div><div class="valor">${esc(vendedorFrecuente || "—")}</div></div>
    <div class="fila"><div class="etiqueta">Transportista frecuente</div><div class="valor">${esc(transportistaFrecuente || "—")}</div></div>
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

export function contenidoPdfTransportista(
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
    <h1>Detalle del Transportista Registrado (${esc(fechaHora)})</h1>
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

export function contenidoPdfVisita(
  fechaVisita: string,
  cliente: string,
  vendedor: string,
  horaInicio: string,
  horaFin: string,
  observaciones: string,
  estado: string
) {
  const fechaStr = new Date(fechaVisita + "T12:00:00").toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `
    <h1>Detalle de Visita Programada (${esc(fechaStr)})</h1>
    <div class="fila"><div class="etiqueta">Cliente</div><div class="valor">${esc(cliente)}</div></div>
    <div class="fila"><div class="etiqueta">Vendedor</div><div class="valor">${esc(vendedor)}</div></div>
    <div class="fila"><div class="etiqueta">Horario</div><div class="valor">${esc(horaInicio)} – ${esc(horaFin)}</div></div>
    <div class="fila"><div class="etiqueta">Estado</div><div class="valor">${esc(estado)}</div></div>
    <div class="fila"><div class="etiqueta">Observaciones</div><div class="valor">${esc(observaciones || "—")}</div></div>
  `;
}

export function contenidoPdfVisitaCompleto(
  cliente: {
    nombre: string;
    nombre_representante?: string | null;
    contacto?: string | null;
    email?: string | null;
    codigo_interno?: string | null;
    cuit?: string | null;
    zona_nombre?: string | null;
    localidad?: string | null;
    provincia?: string | null;
    calle?: string | null;
    numero?: number | null;
    vendedor_nombre?: string | null;
    transportista_nombre?: string | null;
    observaciones?: string | null;
  },
  visita: {
    fecha_visita: string;
    hora_inicio: string | null;
    hora_fin: string | null;
    estado: string;
    observaciones: string | null;
    auditor_nombre?: string | null;
  }
) {
  const fechaStr = new Date(visita.fecha_visita + "T12:00:00").toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const horaInicio = visita.hora_inicio ? visita.hora_inicio.replace(/^(\d+):(\d+).*/, "$1:$2") : "—";
  const horaFin = visita.hora_fin ? visita.hora_fin.replace(/^(\d+):(\d+).*/, "$1:$2") : "—";
  const estadoLabel = visita.estado.charAt(0).toUpperCase() + visita.estado.slice(1);

  const fila = (label: string, val: string) =>
    `<div style="margin-bottom:5px;font-size:12px;"><span style="font-weight:bold;color:#374151;">${esc(label)}:</span> ${esc(val)}</div>`;

  return `
    <h1 style="font-size:16px;margin-bottom:12px;">Detalle de Visita y Cliente</h1>
    <h2 style="font-size:12px;margin:10px 0 6px;color:#6b7280;">Datos del cliente</h2>
    ${fila("Nombre comercio", cliente.nombre || "—")}
    ${fila("Nombre representante", cliente.nombre_representante || "—")}
    ${fila("Contacto", cliente.contacto || "—")}
    ${fila("Email", cliente.email || "—")}
    ${fila("Código interno", cliente.codigo_interno || "—")}
    ${fila("CUIT", cliente.cuit || "—")}
    ${fila("Zona", cliente.zona_nombre || "—")}
    ${fila("Localidad/Ciudad", cliente.localidad || "—")}
    ${fila("Provincia", cliente.provincia || "—")}
    ${fila("Calle", cliente.calle || "—")}
    ${fila("Número", String(cliente.numero ?? "—"))}
    ${fila("Vendedor frecuente", cliente.vendedor_nombre || "—")}
    ${fila("Transportista frecuente", cliente.transportista_nombre || "—")}
    ${fila("Observaciones cliente", cliente.observaciones || "—")}
    <h2 style="font-size:12px;margin:10px 0 6px;color:#6b7280;">Datos de la visita</h2>
    ${fila("Auditor responsable", visita.auditor_nombre || "—")}
    ${fila("Fecha estimada", fechaStr)}
    ${fila("Hora inicio estimada", horaInicio)}
    ${fila("Hora fin estimada", horaFin)}
    ${fila("Estado", estadoLabel)}
    ${fila("Observaciones visita", visita.observaciones || "—")}
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
