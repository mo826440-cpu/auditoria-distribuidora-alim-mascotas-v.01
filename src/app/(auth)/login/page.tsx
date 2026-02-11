import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
          <p className="mt-2 text-slate-600">
            Accedé a tu cuenta de auditorías
          </p>
        </div>
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm text-center">
            Formulario de login en desarrollo (ETAPA 4)
          </p>
          <Link
            href="/"
            className="mt-6 block text-center text-primary-500 hover:text-primary-600 font-medium"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
