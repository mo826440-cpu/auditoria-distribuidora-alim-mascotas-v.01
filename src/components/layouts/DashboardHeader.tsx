"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function DashboardHeader({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName?: string;
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
