// api/_shared/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("Missing SUPABASE_URL in backend environment variables.");
}

// In serverless environments, we prefer using the service role key to perform admin queries when necessary
// otherwise fallback to the anon key
export const supabaseAdmin = createClient(
  supabaseUrl || "",
  supabaseServiceKey || supabaseAnonKey || ""
);

/**
 * Returns a Supabase client bound with the authenticated user's access token.
 * If no token is provided, returns supabaseAdmin.
 */
export async function getSupabaseUserClient(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  console.log("[DEBUG] getSupabaseUserClient - Token present:", !!token);

  if (token && supabaseUrl && supabaseAnonKey) {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    
    await client.auth.setSession({
      access_token: token,
      refresh_token: ""
    });
    
    return client;
  }
  
  console.log("[DEBUG] getSupabaseUserClient - Falling back to supabaseAdmin");
  return supabaseAdmin;
}



