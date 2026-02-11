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
          50: "#fef7ee",
          100: "#fdedd6",
          200: "#f9d6ac",
          300: "#f4b877",
          400: "#ee8f40",
          500: "#ea721c",
          600: "#db5812",
          700: "#b54111",
          800: "#903516",
          900: "#742e15",
          950: "#3f1409",
        },
        slate: {
          850: "#1a2234",
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
