import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { readFileSync } from "fs";
import path from "path";

export default async function DescripcionEvaluacionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let content = "";
  try {
    const filePath = path.join(process.cwd(), "docs", "archivos.md", "Descripcion_Evaluacion.md");
    content = readFileSync(filePath, "utf-8");
  } catch {
    content = "No se pudo cargar el archivo de descripción. Consulte docs/archivos.md/Descripcion_Evaluacion.md en el proyecto.";
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Descripción de la evaluación</h1>
      <p className="text-slate-400 text-sm mb-6">Guía para aplicar cada criterio de la auditoría (escala 1 a 5).</p>
      <div className="bg-slate-850 rounded-xl border border-slate-700 p-6 text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
        {content}
      </div>
    </div>
  );
}
