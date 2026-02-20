"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem =
  | { href: string; label: string }
  | {
      href: string;
      label: string;
      subItems: { href: string; label: string }[];
    };

const items: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/usuarios", label: "Usuarios" },
  { href: "/clientes", label: "Clientes" },
  { href: "/vendedores", label: "Vendedores" },
  { href: "/transportistas", label: "Transportistas" },
  {
    href: "/referencias",
    label: "Referencias",
    subItems: [
      { href: "/referencias/zonas", label: "Zonas" },
      { href: "/referencias/transportes", label: "Transportes" },
    ],
  },
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
  const [referenciasAbierto, setReferenciasAbierto] = useState(
    pathname.startsWith("/referencias")
  );

  const filteredItems: NavItem[] =
    rol === "administrador"
      ? items
      : items.filter((i) => i.href !== "/usuarios");

  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-slate-850 border border-slate-700 shadow-sm text-slate-200"
        aria-label="Menú"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-20 w-56 bg-slate-850 border-r border-slate-700 transform transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 pt-16 lg:pt-4 space-y-1">
          {filteredItems.map((item) => {
            if ("subItems" in item && item.subItems) {
              const isActive = pathname.startsWith(item.href);
              return (
                <div key={item.href}>
                  <button
                    onClick={() => setReferenciasAbierto(!referenciasAbierto)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-900/40 text-primary-300"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <svg
                      className={`w-4 h-4 transition-transform ${referenciasAbierto ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {referenciasAbierto && (
                    <div className="ml-3 mt-1 space-y-1 border-l border-slate-700 pl-2">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`block px-2 py-1.5 rounded text-sm ${
                            pathname === sub.href
                              ? "bg-primary-900/40 text-primary-300 font-medium"
                              : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-primary-900/40 text-primary-300"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-10 bg-black/40"
          onClick={onToggle}
        />
      )}
    </>
  );
}
