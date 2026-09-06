// webcam.js — Initialisation de la caméra
const video = document.getElementById("video");

export { video };

export function initWebcam() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => (video.srcObject = stream));
}
