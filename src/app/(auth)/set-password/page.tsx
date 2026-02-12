"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listo, setListo] = useState(false);
  const [esperandoHash, setEsperandoHash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const hasHash = typeof window !== "undefined" && window.location.hash?.includes("access_token");

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setListo(true);
        setEsperandoHash(false);
        return;
      }
      if (!hasHash) {
        setEsperandoHash(false);
        return;
      }
      setEsperandoHash(false);
    };

    const subscription = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setListo(true);
    }).data.subscription;

    if (hasHash) {
      const retries = [0, 500, 1000, 1500];
      retries.forEach((delay) => {
        setTimeout(async () => {
          if (listo) return;
          const { data: { session } } = await supabase.auth.getSession();
          if (session) setListo(true);
        }, delay);
      });
      setTimeout(() => setEsperandoHash(false), 2000);
    } else {
      checkSession();
    }

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Error al guardar la contraseña");
    } finally {
      setLoading(false);
    }
  }

  if (esperandoHash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!listo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-900">Link inválido o expirado</h1>
          <p className="mt-2 text-slate-600">
            El link de invitación no es válido o ya expiró. Pedile al administrador que te envíe una nueva invitación.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-primary-500 hover:text-primary-600 font-medium"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Crear contraseña</h1>
          <p className="mt-2 text-slate-600">
            Completá tu registro configurando una contraseña para tu cuenta
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 space-y-5"
        >
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
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
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetí la contraseña"
              required
              minLength={6}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            {loading ? "Guardando..." : "Crear contraseña"}
          </button>
        </form>
        <Link
          href="/login"
          className="block text-center text-slate-500 hover:text-slate-700 text-sm"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
