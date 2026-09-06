// api/chatbot/chat.js
import { groq, DEFAULT_CHAT_MODEL } from "../_shared/groqClient.js";
import { verifyAuth } from "../_shared/authMiddleware.js";

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(455).json({ error: "Method not allowed. Use POST." });
  }

  try {
    // Verify authentication
    const user = await verifyAuth(req);

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Le message est requis" });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Tu es l'assistant intelligent officiel du portail étudiant AEI (Association des Étudiants de l'AEI). Réponds de manière concise, polie et serviable en français.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: DEFAULT_CHAT_MODEL,
    });

    const reply =
      chatCompletion.choices[0]?.message?.content ||
      "Je n'ai pas pu générer de réponse.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({
      error: "Erreur lors de la communication avec l'IA",
      details: error.message,
    });
  }
}
