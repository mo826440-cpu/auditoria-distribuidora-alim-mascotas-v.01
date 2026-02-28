/**
 * Genera 26.scriptEliminarYCargarClientesSierras.sql desde clientes_Sierras_03.csv
 * Usa valores fijos: id_comercio, id_zona, id_usuario_registro, id_vendedor_frecuente;
 * telefono, email, contacto, observaciones, id_transportista_frecuente = NULL;
 * activo = true; created_at/updated_at = NOW().
 * Ejecutar: node scripts/generarScriptClientesSierras.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const csvPath = join(process.cwd(), "docs", "archivos.csv", "clientes_Sierras_03.csv");
const csv = readFileSync(csvPath, "utf-8");
const lines = csv.split(/\r?\n/).filter(Boolean);
const header = lines[0];
const dataRows = lines.slice(1).filter((l) => l.trim());

// Delimitador en _03: tab + pipe + tab
const sep = /\t\|\t/;
const cols = header.split(sep).map((c) => c.trim());
const idx = (name) => {
  const i = cols.indexOf(name);
  if (i === -1) throw new Error("Columna no encontrada: " + name);
  return i;
};

function esc(s) {
  if (s == null || s === "" || String(s).trim() === "" || String(s).trim() === "-" || String(s).trim() === " - ") return null;
  const t = String(s).trim().replace(/'/g, "''");
  return t || null;
}
function uuidOrNull(s) {
  if (s == null || s === "" || String(s).trim() === "" || String(s).trim() === "-") return null;
  const t = String(s).trim();
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(t)) return t;
  return null;
}
function numOrNull(s) {
  if (s == null || s === "" || String(s).trim() === "" || String(s).trim() === "-") return null;
  const n = parseInt(String(s).trim(), 10);
  return isNaN(n) ? null : n;
}

// Valores fijos según indicación del usuario
const ID_COMERCIO = "e04c2c2e-f082-404c-a97e-9021c01117b8";
const ID_ZONA = "ec71aea3-daa4-4390-bfa3-6e593b7ca943";
const ID_USUARIO_REGISTRO = "032e3ac3-4934-47a5-a6fb-f3a2bee729e7";
const ID_VENDEDOR_FRECUENTE = "67c2c211-f9aa-487a-8d90-f85b0563c944";

const values = dataRows.map((line) => {
  const parts = line.split(sep).map((p) => p.trim());
  const get = (i) => (i < parts.length ? parts[i] : "");

  const nombre = esc(get(idx("nombre"))) || "Sin nombre";
  const direccion = esc(get(idx("direccion")));
  const localidad = esc(get(idx("localidad")));
  const provincia = esc(get(idx("provincia")));
  const nombre_rep = esc(get(idx("nombre_representante")));
  const codigo = esc(get(idx("codigo_interno")));
  const cuit = esc(get(idx("cuit")));
  const calle = esc(get(idx("calle")));
  const numero = numOrNull(get(idx("numero")));
  const id_tipo = uuidOrNull(get(idx("id_tipo_comercio")));

  const fmt = (v) => (v == null ? "NULL" : `'${v}'`);
  return `  ('${ID_COMERCIO}'::uuid, ${fmt(nombre)}, ${fmt(direccion)}, NULL, NULL, ${fmt(localidad)}, ${fmt(provincia)}, true, NOW(), NOW(), ${fmt(nombre_rep)}, NULL, ${fmt(codigo)}, ${fmt(cuit)}, '${ID_ZONA}'::uuid, ${fmt(calle)}, ${numero != null ? numero : "NULL"}, '${ID_USUARIO_REGISTRO}'::uuid, NULL, '${ID_VENDEDOR_FRECUENTE}'::uuid, NULL, ${id_tipo ? `'${id_tipo}'::uuid` : "NULL"})`;
});

const sql = `-- ============================================================
-- 26. ELIMINAR TODOS LOS CLIENTES Y CARGAR REGISTROS SIERRAS
-- Generado desde docs/archivos.csv/clientes_Sierras_03.csv
-- Valores fijos: id_comercio, id_zona, id_usuario_registro, id_vendedor_frecuente;
-- telefono, email, contacto, observaciones, id_transportista_frecuente = NULL;
-- activo = true; created_at/updated_at = NOW().
-- ============================================================

DELETE FROM clientes;

INSERT INTO clientes (
  id_comercio, nombre, direccion, telefono, email, localidad, provincia,
  activo, created_at, updated_at, nombre_representante, contacto, codigo_interno,
  cuit, id_zona, calle, numero, id_usuario_registro, observaciones,
  id_vendedor_frecuente, id_transportista_frecuente, id_tipo_comercio
)
VALUES
${values.join(",\n")};
`;

const outPath = join(process.cwd(), "scriptsBaseDatos", "26.scriptEliminarYCargarClientesSierras.sql");
writeFileSync(outPath, sql, "utf-8");
console.log("Generado:", outPath, "(" + dataRows.length + " filas)");
