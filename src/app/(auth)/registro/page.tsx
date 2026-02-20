"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (registroExitoso) {
      const timer = setTimeout(() => router.push("/login"), 4000);
      return () => clearTimeout(timer);
    }
  }, [registroExitoso, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: nombre.trim() || email.split("@")[0],
            rol: "administrador",
          },
        },
      });

      if (error) {
        const msg =
          error.message === "Invalid API key"
            ? "Clave API inválida. Verificá las variables en Vercel (Settings → Environment Variables), copiá la anon key de Supabase sin espacios, guardá y hacé Redeploy."
            : error.message;
        setError(msg);
        setLoading(false);
        return;
      }

      if (data.user && data.session) {
        const res = await fetch("/api/auth/complete-registration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Error al crear perfil");
          setLoading(false);
          return;
        }
      }

      setRegistroExitoso(true);
    } catch {
      setError("Error al registrar. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (registroExitoso) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-850 rounded-xl p-8 shadow-sm border border-slate-700 text-center space-y-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-900/50 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Cuenta creada</h2>
            <p className="text-slate-600">
              Revisá tu correo para confirmar tu cuenta. Luego podés iniciar sesión.
            </p>
            <p className="text-sm text-slate-500">
              Serás redirigido al login en unos segundos...
            </p>
            <Link
              href="/login"
              className="inline-block w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Crear cuenta</h1>
          <p className="mt-2 text-slate-300">
            Registrate como administrador de tu comercio
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-slate-850 rounded-xl p-8 shadow-sm border border-slate-700 space-y-5"
        >
          {error && (
            <div className="p-3 rounded-lg bg-red-900/50 text-red-300 text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-slate-300 mb-1">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>
        <p className="text-center text-slate-300 text-sm">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Iniciar sesión
          </Link>
        </p>
        <Link
          href="/"
          className="block text-center text-slate-400 hover:text-slate-300 text-sm"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
