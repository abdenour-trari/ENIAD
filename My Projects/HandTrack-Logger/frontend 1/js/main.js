import { initWebcam } from "./webcam.js";
import { initWebSocket } from "./websocket.js";
import { updateAnswerDisplay, cancelLetter, resetAnswer } from "./answer.js";
import { loop } from "./frameLoop.js";

// ── Exposition globale pour les onclick HTML ───────────────────────────────
window.cancelLetter = cancelLetter;
window.resetAnswer = resetAnswer;

// ── Init ───────────────────────────────────────────────────────────────────
const video = document.getElementById("video");

video.onloadedmetadata = () => {
  updateAnswerDisplay();
  loop();
};

initWebcam();
initWebSocket();
