import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auditorías Comerciales | Distribuidora Alimentos Mascotas",
  description: "Sistema de auditorías comerciales para distribuidoras de alimentos para mascotas. Villa María, Córdoba.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
