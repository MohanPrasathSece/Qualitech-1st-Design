import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Read environment variables with graceful fallback
const supabaseUrl = (import.meta.env["VITE_SUPABASE_URL"] as string) || "";
const supabaseAnonKey = (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string) || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project-id.supabase.co" &&
    supabaseAnonKey !== "your-anon-public-key-here"
);

// Create Supabase client if configured, otherwise create a mock/fallback client
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Helper to check connection health
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  url?: string | undefined;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: "Supabase credentials not configured in .env (Running in Local Mode)",
    };
  }

  try {
    const { error } = await supabase.from("products").select("id").limit(1);
    if (error && error.code !== "PGRST116") {
      return {
        connected: false,
        message: `Supabase Error: ${error.message} (Code: ${error.code})`,
        url: supabaseUrl,
      };
    }
    return {
      connected: true,
      message: "Successfully connected to Supabase Live Backend",
      url: supabaseUrl,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Connection failed: ${err?.message || "Network unreachable"}`,
      url: supabaseUrl,
    };
  }
}
