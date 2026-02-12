"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/usuarios", label: "Usuarios" },
  { href: "/clientes", label: "Clientes" },
  { href: "/vendedores", label: "Vendedores" },
  { href: "/transportistas", label: "Transportistas" },
  { href: "/visitas", label: "Visitas" },
  { href: "/auditorias", label: "Auditorías" },
];

export function DashboardSidebar({
  rol,
  isOpen,
  onToggle,
}: {
  rol: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  const filteredItems =
    rol === "administrador"
      ? items
      : items.filter((i) => i.href !== "/usuarios");

  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white border border-slate-200 shadow-sm"
        aria-label="Menú"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-20 w-56 bg-white border-r border-slate-200 transform transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 pt-16 lg:pt-4 space-y-1">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-10 bg-black/20"
          onClick={onToggle}
        />
      )}
    </>
  );
}
