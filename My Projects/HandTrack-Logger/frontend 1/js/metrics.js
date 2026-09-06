// metrics.js — Calcul et affichage des métriques (stabilité, précision, sélection)
const responseTimeEl = document.getElementById("responseTime");
const accuracyEl = document.getElementById("accuracy");
const pointScore = document.getElementById("pointScore");
const selectScore = document.getElementById("selectScore");
const precisionScore = document.getElementById("precisionScore");

let startTime = Date.now();
export let totalClicks = 0;
export let correctClicks = 0;

let pointerHistory = [];
export let precisionValues = [];

export function updateMetrics() {
  const time = (Date.now() - startTime) / 1000;
  responseTimeEl.innerText = time.toFixed(1) + "s";

  if (totalClicks > 0) {
    const accuracy = (correctClicks / totalClicks) * 100;
    accuracyEl.innerText = accuracy.toFixed(0) + "%";
  }
}

export function registerClick(isCorrect) {
  totalClicks++;
  if (isCorrect) correctClicks++;
}

export function updateMotorPatterns(pointer) {
  if (!pointer) return;

  pointerHistory.push(pointer);
  if (pointerHistory.length > 10) pointerHistory.shift();

  if (pointerHistory.length > 1) {
    let totalMove = 0;

    for (let i = 1; i < pointerHistory.length; i++) {
      const dx = pointerHistory[i].x - pointerHistory[i - 1].x;
      const dy = pointerHistory[i].y - pointerHistory[i - 1].y;
      totalMove += Math.sqrt(dx * dx + dy * dy);
    }

    const stability = Math.max(0, 100 - totalMove / 5);
    pointScore.innerText = stability.toFixed(0) + "%";
  }

  if (totalClicks > 0) {
    const select = (correctClicks / totalClicks) * 100;
    selectScore.innerText = select.toFixed(0) + "%";
  }

  if (precisionValues.length > 0) {
    const avg = precisionValues.reduce((a, b) => a + b, 0) / precisionValues.length;
    precisionScore.innerText = avg.toFixed(0) + "%";
  }
}

export function sendMotorDataToAI(ws) {
  if (!ws || ws.readyState !== 1) return;

  const motorData = {
    stability: pointScore.innerText,
    precision: precisionScore.innerText,
    select: selectScore.innerText,
    accuracy: accuracyEl.innerText,
    response_time: responseTimeEl.innerText,
  };

  ws.send(JSON.stringify({ type: "motor_analysis", data: motorData }));
}
