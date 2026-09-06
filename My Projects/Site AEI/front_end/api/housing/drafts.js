// api/housing/drafts.js
import { supabaseAdmin, getSupabaseUserClient } from "../_shared/supabaseClient.js";
import { verifyAuth } from "../_shared/authMiddleware.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const dbClient = await getSupabaseUserClient(req);

    if (req.method === "GET") {
      // Fetch user's housing draft
      const { data: draft, error } = await dbClient
        .from("housing_drafts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return res.status(200).json(draft);
    }

    if (req.method === "POST") {
      // Upsert housing draft
      const { current_step, draft_data } = req.body;

      if (current_step === undefined || !draft_data) {
        return res.status(400).json({ error: "Champs requis : current_step, draft_data" });
      }

      const { data: upserted, error: upsertErr } = await dbClient
        .from("housing_drafts")
        .upsert({
          user_id: user.id,
          current_step,
          draft_data,
          updated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // expires in 7 days
        }, { onConflict: "user_id" })
        .select()
        .single();

      if (upsertErr) throw upsertErr;
      return res.status(200).json(upserted);
    }

    if (req.method === "DELETE") {
      // Delete user's draft (e.g. after successful post publication)
      const { error: deleteErr } = await dbClient
        .from("housing_drafts")
        .delete()
        .eq("user_id", user.id);

      if (deleteErr) throw deleteErr;
      return res.status(200).json({ success: true, message: "Brouillon supprimé" });
    }

    return res.status(405).json({ error: "Méthode non supportée" });
  } catch (error) {
    console.error("Housing drafts API error:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}
