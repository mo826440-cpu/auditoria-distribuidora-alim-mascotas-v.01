import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          // 50: Fondo suave para items activos del menú lateral, hover de íconos (ver/editar), fondo de badges
          50: "#fef7ee",
          // 100: Fondo de badges o estados destacados (ej. Auditorías)
          100: "#fdedd6",
          // 200-400: Tonos intermedios (poco usados, disponibles para gradientes o variantes)
          200: "#f9d6ac",
          300: "#f4b877",
          400: "#ee8f40",
          // 500: Color principal de botones (Crear, Registrar, Guardar), anillo de focus en inputs/selects
          500: "#ea721c",
          // 600: Hover de botones principales, color de enlaces (ubicación, etc.)
          600: "#db5812",
          // 700: Texto de items activos en menú lateral, texto de enlaces
          700: "#b54111",
          // 800-950: Tonos oscuros (disponibles para texto sobre fondos claros o variantes)
          800: "#903516",
          900: "#742e15",
          950: "#3f1409",
        },
        slate: {
          // 850: Fondo oscuro alternativo (extensión de la paleta slate de Tailwind)
          850: "#1a2234",
          // 950: Color de texto principal (--foreground), fondo en modo oscuro (--background)
          950: "#0d1321",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
