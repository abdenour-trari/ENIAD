// frameLoop.js — Boucle d'envoi des frames webcam via WebSocket
import { video } from "./webcam.js";
import { state } from "./state.js";

export function sendFrame() {
  if (state.isProcessing) return;
  if (!state.ws || state.ws.readyState !== 1) return;
  if (video.videoWidth === 0) return;

  state.isProcessing = true; // ✅ pose le verrou avant l'envoi

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = 160;
  tempCanvas.height = 120;

  tempCtx.drawImage(video, 0, 0, 160, 120);

  const base64 = tempCanvas.toDataURL("image/jpeg", 0.5).split(",")[1];
  state.ws.send(base64);
}

export function loop() {
  sendFrame();
  requestAnimationFrame(loop);
}
