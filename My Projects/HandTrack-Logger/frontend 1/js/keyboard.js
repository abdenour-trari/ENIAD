// keyboard.js — Rendu du clavier sur canvas et détection des clics
import { answer, targetWord, updateAnswerDisplay } from "./answer.js";
import {
  precisionValues,
  registerClick,
  updateMetrics,
  updateMotorPatterns,
} from "./metrics.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const feedbackText = document.getElementById("feedbackText");
const trackingIndicator = document.getElementById("trackingIndicator");

// ── Palette (dark premium — indigo + emerald) ─────────────────────────────
const THEME = {
  bg: "#0e1018",
  keyBg: "#13161f",
  keyBgHover: "#1e2235",
  keyBorder: "rgba(255,255,255,0.08)",
  keyBorderHover: "#6366f1",
  keyText: "#8b92a5",
  keyTextHover: "#f1f2f6",
  correct: "#10b981",
  correctBorder: "#10b981",
  correctText: "#ffffff",
  wrong: "#f43f5e",
  wrongBorder: "#f43f5e",
  wrongText: "#ffffff",
  cursor: "#6366f1",
  cursorPinch: "#10b981",
  shadow: "rgba(99,102,241,0.4)",
};

// ── Disposition QWERTY réelle (3 rangées centrées) ────────────────────────
const ROWS = [
  "QWERTYUIOP", // 10 touches — rangée 1
  "ASDFGHJKL", //  9 touches — rangée 2, décalée
  "ZXCVBNM", //  7 touches — rangée 3, décalée
];

// Dimensions
const KEY_W = 58;
const KEY_H = 52;
const RADIUS = 10;
const GAP = 8;
const ROW_GAP = 8;
const PAD_Y = 18;

// Canvas
const CANVAS_W = 900;
const CANVAS_H = PAD_Y * 2 + 3 * KEY_H + 2 * ROW_GAP;

canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

// Décalages QWERTY standard en fraction de touche
const ROW_OFFSETS = [0, 0.5, 1.5];

// Pré-calcul des positions pour chaque touche
function buildKeyPositions() {
  const positions = [];
  ROWS.forEach((row, rowIdx) => {
    const letters = row.split("");
    const offsetPx = ROW_OFFSETS[rowIdx] * (KEY_W + GAP);
    const totalW = letters.length * (KEY_W + GAP) - GAP + offsetPx;
    const x0 = (CANVAS_W - totalW) / 2 + offsetPx / 2;
    const y = PAD_Y + rowIdx * (KEY_H + ROW_GAP);

    letters.forEach((letter, colIdx) => {
      positions.push({
        letter,
        x: x0 + colIdx * (KEY_W + GAP),
        y,
      });
    });
  });
  return positions;
}

const KEY_POSITIONS = buildKeyPositions();

// ── Historique des feedbacks par lettre ───────────────────────────────────
// { letter: "correct" | "wrong" | null }
const keyFeedback = {};
let lastClick = 0;

function canClick() {
  const now = Date.now();
  if (now - lastClick > 700) {
    lastClick = now;
    return true;
  }
  return false;
}

// ── Utilitaire : rectangle arrondi ────────────────────────────────────────
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Fond canvas avec dégradé ───────────────────────────────────────────────
function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#0f1117");
  grad.addColorStop(1, "#161b2e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ── Dessin d'une touche ────────────────────────────────────────────────────
function drawKey(letter, x, y, isHovered, isPinched) {
  const fb = keyFeedback[letter];

  let bgColor = THEME.keyBg;
  let borderColor = THEME.keyBorder;
  let textColor = THEME.keyText;

  if (fb === "correct") {
    bgColor = THEME.correct;
    borderColor = THEME.correctBorder;
    textColor = THEME.correctText;
  } else if (fb === "wrong") {
    bgColor = THEME.wrong;
    borderColor = THEME.wrongBorder;
    textColor = THEME.wrongText;
  } else if (isHovered) {
    bgColor = THEME.keyBgHover;
    borderColor = THEME.keyBorderHover;
    textColor = THEME.keyTextHover;
  }

  // Ombre portée sur hover
  if (isHovered && !fb) {
    ctx.shadowColor = THEME.shadow;
    ctx.shadowBlur = 18;
  } else {
    ctx.shadowBlur = 0;
  }

  // Fond
  roundRect(x, y, KEY_W, KEY_H, RADIUS);
  ctx.fillStyle = bgColor;
  ctx.fill();

  // Bordure
  ctx.lineWidth = isHovered || fb ? 2 : 1;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Lettre
  ctx.fillStyle = textColor;
  ctx.font = `bold 18px 'Segoe UI', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, x + KEY_W / 2, y + KEY_H / 2);

  // Indicateur lumineux en bas de la touche survolée
  if (isHovered && !fb) {
    const barW = KEY_W * 0.5;
    const barX = x + (KEY_W - barW) / 2;
    const barY = y + KEY_H - 5;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, 3, 2);
    ctx.fillStyle = THEME.keyBorderHover;
    ctx.fill();
  }
}

// ── Curseur stylisé ────────────────────────────────────────────────────────
function drawCursor(pointer, pinch) {
  const color = pinch ? THEME.cursorPinch : THEME.cursor;

  // Halo externe
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, 18, 0, 2 * Math.PI);
  ctx.strokeStyle = color + "55";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Point central
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, 7, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ── Dessin principal ───────────────────────────────────────────────────────
export function drawCanvasKeyboard(pointer, pinch) {
  drawBackground();

  KEY_POSITIONS.forEach(({ letter, x, y }) => {
    const isHovered = pointer
      ? pointer.x > x &&
        pointer.x < x + KEY_W &&
        pointer.y > y &&
        pointer.y < y + KEY_H
      : false;

    drawKey(letter, x, y, isHovered, pinch);

    if (isHovered && pointer) {
      // Précision
      const cx = x + KEY_W / 2;
      const cy = y + KEY_H / 2;
      const dist = Math.sqrt((pointer.x - cx) ** 2 + (pointer.y - cy) ** 2);
      precisionValues.push(Math.max(0, 100 - dist));
      if (precisionValues.length > 20) precisionValues.shift();

      // Clic
      if (pinch && canClick() && answer.length < targetWord.length) {
        const isCorrect = letter === targetWord[answer.length];
        answer.push(letter);
        registerClick(isCorrect);

        keyFeedback[letter] = isCorrect ? "correct" : "wrong";
        setTimeout(() => {
          keyFeedback[letter] = null;
        }, 800);

        feedbackText.innerText = isCorrect
          ? "✅ Great precision!"
          : "❌ Try again carefully.";
        updateAnswerDisplay();
        updateMetrics();
      }
    }
  });

  if (pointer) drawCursor(pointer, pinch);
}

// ── drawUI ─────────────────────────────────────────────────────────────────
export function drawUI(data) {
  // Ratio entre taille logique du canvas et taille affichée (CSS)
  const scaleX = canvas.width / canvas.getBoundingClientRect().width;
  const scaleY = canvas.height / canvas.getBoundingClientRect().height;

  if (data.x !== null) {
    trackingIndicator.classList.add("online");

    const pointer = {
      x: (1 - data.x) * canvas.width,
      y: data.y * canvas.height,
    };

    drawCanvasKeyboard(pointer, data.pinch);
    updateMotorPatterns(pointer);
  } else {
    trackingIndicator.classList.remove("online");
    drawCanvasKeyboard(null, false);
  }
}
