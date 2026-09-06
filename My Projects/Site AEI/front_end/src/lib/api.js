// src/lib/api.js
import { supabase } from "./supabaseClient";

/**
 * Fetch wrapper that automatically appends the current user's Supabase access token in the Authorization header.
 * @param {string} endpoint The relative or absolute URL endpoint
 * @param {RequestInit} options Standard fetch options
 * @returns {Promise<any>}
 */
export async function apiFetch(endpoint, options = {}) {
  let token = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  } catch (err) {
    console.warn("Could not retrieve session token:", err);
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur serveur (${response.status})`);
  }

  return response.json();
}
