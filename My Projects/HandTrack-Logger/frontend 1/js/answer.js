// answer.js — Gestion de la réponse (lettres saisies)
const answerDisplay = document.getElementById("answerDisplay");
const feedbackText = document.getElementById("feedbackText");
const trackingIndicator = document.getElementById("trackingIndicator");
const targetWord = document.getElementById("targetWord").innerText;

export let answer = [];

export { targetWord };

export function updateAnswerDisplay() {
  answerDisplay.innerHTML = "";

  for (let i = 0; i < targetWord.length; i++) {
    const slot = document.createElement("div");
    slot.className = "answer-slot";
    slot.innerText = answer[i] || "";
    answerDisplay.appendChild(slot);
  }

  if (answer.join("") === targetWord) {
    feedbackText.innerText = "🎉 Excellent! Word completed!";
    trackingIndicator.style.background = "#00b894";

    setTimeout(() => {
      answer.length = 0;
      updateAnswerDisplay();
    }, 2000);
  }
}

export function cancelLetter() {
  answer.pop();
  updateAnswerDisplay();
}

export function resetAnswer() {
  answer.length = 0;
  updateAnswerDisplay();
}
