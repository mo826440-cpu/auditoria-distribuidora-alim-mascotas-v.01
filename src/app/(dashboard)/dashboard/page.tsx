import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EnsureProfile } from "@/components/features/EnsureProfile";
import { DashboardClient } from "@/components/features/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-7xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
      <p className="mt-2 text-slate-300">Bienvenido, {user.email}</p>
      <div className="mt-6">
        <DashboardClient />
      </div>
    </div>
  );
}
