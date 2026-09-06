// api/courses/index.js
import { supabaseAdmin } from "../_shared/supabaseClient.js";
import { verifyAuth, verifyRole } from "../_shared/authMiddleware.js";
import { groq, DEFAULT_CHAT_MODEL } from "../_shared/groqClient.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      // Public Read
      const { data: courses, error } = await supabaseAdmin
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.status(200).json(courses);
    }

    if (req.method === "POST") {
      const user = await verifyAuth(req);
      const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
      const action = searchParams.get("action");

      // Handle AI Summarize Action
      if (action === "summarize") {
        const { courseId } = req.body;
        if (!courseId) {
          return res.status(400).json({ error: "Le paramètre courseId est requis" });
        }

        const { data: course, error: fetchErr } = await supabaseAdmin
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (fetchErr || !course) {
          return res.status(404).json({ error: "Cours non trouvé" });
        }

        // Generate Summary using Groq
        const prompt = `Génère un résumé structuré et clair en français pour le cours suivant :
Titre : ${course.title}
Catégorie : ${course.category}
Niveau : ${course.niveau}
Description : ${course.description || "Aucune description fournie."}

Le résumé doit inclure :
1. Une introduction au sujet.
2. Les 3 points clés essentiels à retenir.
3. Des conseils de révision pour un étudiant en ${course.niveau}.`;

        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: DEFAULT_CHAT_MODEL,
        });

        const summary = completion.choices[0]?.message?.content || "Impossible de générer le résumé.";
        return res.status(200).json({ summary });
      }

      // Handle Course Insertion (Moderator/Admin only)
      const hasPermission = await verifyRole(user, ["admin", "moderator"]);
      if (!hasPermission) {
        return res.status(403).json({ error: "Accès refusé. Rôle insuffisant." });
      }

      const { title, niveau, pdf_url, category, description } = req.body;
      if (!title || !niveau || !category) {
        return res.status(400).json({ error: "Champs requis : title, niveau, category" });
      }

      const { data: newCourse, error: insertErr } = await supabaseAdmin
        .from("courses")
        .insert([{ title, niveau, pdf_url, category, description }])
        .select()
        .single();

      if (insertErr) throw insertErr;
      return res.status(201).json(newCourse);
    }

    return res.status(455).json({ error: "Méthode non supportée" });
  } catch (error) {
    console.error("Courses API error:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}
