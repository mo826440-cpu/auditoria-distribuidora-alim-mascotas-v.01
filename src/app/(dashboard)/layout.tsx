import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EnsureProfile } from "@/components/features/EnsureProfile";
import { DashboardLayoutClient } from "@/components/layouts/DashboardLayoutClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("nombre, rol")
    .eq("id", user.id)
    .single();

  return (
    <DashboardLayoutClient
      userEmail={user.email!}
      userName={usuario?.nombre}
      rol={usuario?.rol ?? "visitante"}
    >
      <EnsureProfile />
      {children}
    </DashboardLayoutClient>
  );
}
