import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-lg font-semibold text-slate-800">
            Auditorías Comerciales
          </span>
          <nav className="flex gap-4">
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Auditorías comerciales para tu distribuidora
          </h1>
          <p className="text-lg text-slate-600">
            Gestioná clientes, visitas y auditorías en campo. Simple, profesional
            y pensado para alimentación de mascotas.
          </p>
          <p className="text-sm text-slate-500">
            Villa María, Córdoba
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link
              href="/registro"
              className="inline-flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md"
            >
              Crear cuenta
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        {/* Features preview */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-2">
              Clientes
            </div>
            <p className="text-slate-600 text-sm">
              Gestioná puntos de venta y programá visitas comerciales.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-2">
              Auditorías
            </div>
            <p className="text-slate-600 text-sm">
              Checklist completo en campo, online u offline.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-2">
              Dashboard
            </div>
            <p className="text-slate-600 text-sm">
              Analizá datos y tomá decisiones con información en tiempo real.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Auditorías Comerciales
      </footer>
    </div>
  );
}
