import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan variables de Supabase. En Vercel: Settings → Environment Variables. Redeploy después de agregarlas."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
