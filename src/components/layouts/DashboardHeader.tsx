"use client";

import { useEffect, useState } from "react";

export function DashboardHeader({
  userEmail,
  userName,
  sidebarOpen,
  onToggleSidebar,
}: {
  userEmail: string;
  userName?: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}) {
  const [hora, setHora] = useState("");

  useEffect(() => {
    const updateHora = () => {
      const now = new Date();
      setHora(
        now.toLocaleTimeString("es-AR", {
          timeZone: "America/Argentina/Buenos_Aires",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateHora();
    const interval = setInterval(updateHora, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-14 bg-slate-850 border-b border-slate-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            aria-label={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
            title={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
          >
            {sidebarOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        )}
        <span className="text-sm font-medium text-slate-200">
          {userName || userEmail}
        </span>
        <span className="text-xs text-slate-400">
          {new Date().toLocaleDateString("es-AR", {
            timeZone: "America/Argentina/Buenos_Aires",
          })}{" "}
          {hora}
        </span>
      </div>
      <form action="/api/auth/signout" method="post">
        <button
          type="submit"
          className="text-sm text-slate-300 hover:text-white font-medium"
        >
          Cerrar sesión
        </button>
      </form>
    </header>
  );
}
