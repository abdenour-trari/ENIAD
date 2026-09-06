import { supabase } from "../lib/supabaseClient";

const LOCAL_KEY = "aei_project_draft";

/**
 * Saves draft data to LocalStorage
 */
export function saveLocalDraft(data) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save local draft:", err);
  }
}

/**
 * Retrieves draft data from LocalStorage
 */
export function getLocalDraft() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Failed to read local draft:", err);
    return null;
  }
}

/**
 * Clears draft data from LocalStorage
 */
export function clearLocalDraft() {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch (err) {
    console.error("Failed to clear local draft:", err);
  }
}

/**
 * Saves draft state to Supabase table project_drafts
 */
export async function saveRemoteDraft(userId, step, formData) {
  if (!userId) return;
  const { error } = await supabase
    .from("project_drafts")
    .upsert({
      user_id: userId,
      current_step: step,
      form_data: formData,
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }, { onConflict: "user_id" });

  if (error) {
    throw error;
  }
}

/**
 * Retrieves draft state from Supabase
 */
export async function getRemoteDraft(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("project_drafts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
}

/**
 * Clears remote draft state on successful publication
 */
export async function clearRemoteDraft(userId) {
  if (!userId) return;
  const { error } = await supabase
    .from("project_drafts")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to delete remote draft:", error);
  }
}

const HOUSING_LOCAL_KEY = "aei_housing_draft";

export function saveLocalHousingDraft(data) {
  try {
    localStorage.setItem(HOUSING_LOCAL_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save local housing draft:", err);
  }
}

export function getLocalHousingDraft() {
  try {
    const raw = localStorage.getItem(HOUSING_LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Failed to read local housing draft:", err);
    return null;
  }
}

export function clearLocalHousingDraft() {
  try {
    localStorage.removeItem(HOUSING_LOCAL_KEY);
  } catch (err) {
    console.error("Failed to clear local housing draft:", err);
  }
}

export async function saveRemoteHousingDraft(userId, step, draftData) {
  if (!userId) return;
  const { error } = await supabase
    .from("housing_drafts")
    .upsert({
      user_id: userId,
      current_step: step,
      draft_data: draftData,
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }, { onConflict: "user_id" });

  if (error) {
    throw error;
  }
}

export async function getRemoteHousingDraft(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("housing_drafts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
}

export async function clearRemoteHousingDraft(userId) {
  if (!userId) return;
  const { error } = await supabase
    .from("housing_drafts")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to delete remote housing draft:", error);
  }
}
