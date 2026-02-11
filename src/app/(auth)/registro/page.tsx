import Link from "next/link";

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="mt-2 text-slate-600">
            Registrate como administrador de tu comercio
          </p>
        </div>
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm text-center">
            Formulario de registro en desarrollo (ETAPA 4)
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
