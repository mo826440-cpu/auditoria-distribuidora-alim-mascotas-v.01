"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Error al iniciar sesión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Iniciar sesión</h1>
          <p className="mt-2 text-slate-300">
            Accedé a tu cuenta de auditorías
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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                className="w-full px-4 py-2 pr-11 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 rounded"
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.02 10.02 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.066 5.69L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
        <p className="text-center text-slate-300 text-sm">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="text-primary-400 hover:text-primary-300 font-medium">
            Crear cuenta
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <p className="text-slate-400">Cargando...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
