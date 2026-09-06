// api/_shared/authMiddleware.js
import { supabaseAdmin } from "./supabaseClient.js";

/**
 * Extracts and verifies the Supabase JWT from the request Authorization header.
 * @param {import('node').IncomingMessage} req
 * @returns {Promise<import('@supabase/supabase-js').User>} The authenticated user
 */
export async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new Error(error?.message || "Utilisateur non authentifié");
  }

  return user;
}

/**
 * Checks if the user has an allowed role.
 * @param {import('@supabase/supabase-js').User} user
 * @param {string[]} allowedRoles
 * @returns {Promise<boolean>}
 */
export async function verifyRole(user, allowedRoles = []) {
  if (allowedRoles.length === 0) return true;

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return false;
  }

  return allowedRoles.includes(profile.role);
}
