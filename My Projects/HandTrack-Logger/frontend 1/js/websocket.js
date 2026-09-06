// websocket.js — Connexion WebSocket et réception des messages
import { state } from "./state.js";
import { drawUI } from "./keyboard.js";
import { sendMotorDataToAI } from "./metrics.js";

const feedbackText = document.getElementById("feedbackText");
const encouragementBox = document.getElementById("encouragementBox");

export function initWebSocket() {
  state.ws = new WebSocket("ws://127.0.0.1:8000/ws");

  state.ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "ai_feedback") {
      feedbackText.innerText = data.feedback;
      encouragementBox.innerText = "⭐ " + data.encouragement;
      return;
    }

    drawUI(data);
    state.isProcessing = false; // ✅ libère le verrou après chaque réponse serveur
  };

  setInterval(() => sendMotorDataToAI(state.ws), 5000);
}
