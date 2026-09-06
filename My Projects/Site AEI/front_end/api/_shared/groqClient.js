// api/_shared/groqClient.js
import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn("GROQ_API_KEY is not defined in the environment variables.");
}

export const groq = new Groq({
  apiKey: apiKey || "placeholder-key",
});

export const DEFAULT_CHAT_MODEL = "llama-3.3-70b-versatile";
