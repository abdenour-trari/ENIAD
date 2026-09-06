const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const encouragementBox = document.getElementById("encouragementBox");

const ws = new WebSocket("ws://127.0.0.1:8000/ws");

const answerDisplay = document.getElementById("answerDisplay");
const feedbackText = document.getElementById("feedbackText");
const responseTimeEl = document.getElementById("responseTime");
const accuracyEl = document.getElementById("accuracy");
const trackingIndicator = document.getElementById("trackingIndicator");

const pointScore = document.getElementById("pointScore");
const selectScore = document.getElementById("selectScore");
const precisionScore = document.getElementById("precisionScore");

const targetWord = document.getElementById("targetWord").innerText;

let answer = [];
let keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let lastClick = 0;
let startTime = Date.now();
let totalClicks = 0;
let correctClicks = 0;

let pointerHistory = [];
let precisionValues = [];

// webcam
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => (video.srcObject = stream));

// answer display
function updateAnswerDisplay() {
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
      answer = [];
      updateAnswerDisplay();
    }, 2000);
  }
}
function sendMotorDataToAI() {
  if (ws.readyState !== 1) return;

  const motorData = {
    stability: pointScore.innerText,
    precision: precisionScore.innerText,
    select: selectScore.innerText,
    accuracy: accuracyEl.innerText,
    response_time: responseTimeEl.innerText,
  };

  ws.send(
    JSON.stringify({
      type: "motor_analysis",
      data: motorData,
    }),
  );
}
setInterval(() => {
  sendMotorDataToAI();
}, 5000);

// buttons
function cancelLetter() {
  answer.pop();
  updateAnswerDisplay();
}

function resetAnswer() {
  answer = [];
  updateAnswerDisplay();
}

// click limiter
function canClick() {
  let now = Date.now();

  if (now - lastClick > 700) {
    lastClick = now;
    return true;
  }

  return false;
}

// send frame
let isProcessing = false;

function sendFrame() {
  if (isProcessing) return;
  if (ws.readyState !== 1) return;
  if (video.videoWidth === 0) return;

  isProcessing = true;

  let tempCanvas = document.createElement("canvas");
  let tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = 160;
  tempCanvas.height = 120;

  tempCtx.drawImage(video, 0, 0, 160, 120);

  let base64 = tempCanvas.toDataURL("image/jpeg", 0.5).split(",")[1];

  ws.send(base64);
}

// metrics
function updateMetrics() {
  let time = (Date.now() - startTime) / 1000;
  responseTimeEl.innerText = time.toFixed(1) + "s";

  if (totalClicks > 0) {
    let accuracy = (correctClicks / totalClicks) * 100;
    accuracyEl.innerText = accuracy.toFixed(0) + "%";
  }
}

// motor patterns
function updateMotorPatterns(pointer) {
  if (!pointer) return;

  pointerHistory.push(pointer);

  if (pointerHistory.length > 10) pointerHistory.shift();

  if (pointerHistory.length > 1) {
    let totalMove = 0;

    for (let i = 1; i < pointerHistory.length; i++) {
      let dx = pointerHistory[i].x - pointerHistory[i - 1].x;
      let dy = pointerHistory[i].y - pointerHistory[i - 1].y;

      totalMove += Math.sqrt(dx * dx + dy * dy);
    }

    let stability = Math.max(0, 100 - totalMove / 5);
    pointScore.innerText = stability.toFixed(0) + "%";
  }

  if (totalClicks > 0) {
    let select = (correctClicks / totalClicks) * 100;
    selectScore.innerText = select.toFixed(0) + "%";
  }

  if (precisionValues.length > 0) {
    let avg =
      precisionValues.reduce((a, b) => a + b, 0) / precisionValues.length;

    precisionScore.innerText = avg.toFixed(0) + "%";
  }
}

// keyboard canvas
function drawCanvasKeyboard(pointer, pinch) {
  ctx.fillStyle = "#f5f6fa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let keyWidth = 50;
  let keyHeight = 50;
  let margin = 10;

  let startX = 50;
  let startY = 50;

  keys.forEach((letter, index) => {
    let x = startX + (index % 10) * (keyWidth + margin);
    let y = startY + Math.floor(index / 10) * (keyHeight + margin);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, keyWidth, keyHeight);

    ctx.strokeStyle = "#636e72";
    ctx.strokeRect(x, y, keyWidth, keyHeight);

    ctx.fillStyle = "#2d3436";
    ctx.font = "18px Arial";
    ctx.fillText(letter, x + 18, y + 30);

    if (pointer) {
      let hover =
        pointer.x > x &&
        pointer.x < x + keyWidth &&
        pointer.y > y &&
        pointer.y < y + keyHeight;

      if (hover) {
        let centerX = x + keyWidth / 2;
        let centerY = y + keyHeight / 2;

        let dx = pointer.x - centerX;
        let dy = pointer.y - centerY;

        let dist = Math.sqrt(dx * dx + dy * dy);

        let precision = Math.max(0, 100 - dist);

        precisionValues.push(precision);

        if (precisionValues.length > 20) precisionValues.shift();
      }

      if (hover && pinch && canClick()) {
        totalClicks++;

        if (answer.length < targetWord.length) {
          answer.push(letter);

          if (letter === targetWord[answer.length - 1]) {
            correctClicks++;
            feedbackText.innerText = "Great precision!";
          } else {
            feedbackText.innerText = "Try again carefully.";
          }

          updateAnswerDisplay();
          updateMetrics();
        }
      }
    }
  });

  if (pointer) {
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = pinch ? "#d63031" : "#0984e3";
    ctx.fill();
  }
}

// UI
function drawUI(data) {
  if (data.x !== null) {
    trackingIndicator.style.background = "#00b894";

    let pointer = {
      x: (1 - data.x) * canvas.width,
      y: data.y * canvas.height,
    };

    drawCanvasKeyboard(pointer, data.pinch);
    updateMotorPatterns(pointer);
  } else {
    trackingIndicator.style.background = "#d63031";
    drawCanvasKeyboard(null, false);
  }
}

// websocket
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "ai_feedback") {
    feedbackText.innerText = data.feedback;
    encouragementBox.innerText = "⭐ " + data.encouragement;
    return;
  }

  drawUI(data);
  isProcessing = false;
};

// loop
function loop() {
  sendFrame();
  requestAnimationFrame(loop);
}

// init
video.onloadedmetadata = () => {
  updateAnswerDisplay();
  loop();
};
