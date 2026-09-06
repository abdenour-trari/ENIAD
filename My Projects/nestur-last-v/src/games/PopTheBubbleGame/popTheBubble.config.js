/**
 * popTheBubble.config.js
 * Configuration file for the Pop the Bubble game in NestureAI.
 */

export const BUBBLE_COLORS = [
  { name: 'cyan', fill: 'rgba(6, 182, 212, 0.45)', border: 'rgba(56, 189, 248, 0.85)', glow: 'rgba(6, 182, 212, 0.6)' },
  { name: 'pink', fill: 'rgba(236, 72, 153, 0.45)', border: 'rgba(244, 114, 182, 0.85)', glow: 'rgba(236, 72, 153, 0.6)' },
  { name: 'purple', fill: 'rgba(168, 85, 247, 0.45)', border: 'rgba(192, 132, 252, 0.85)', glow: 'rgba(168, 85, 247, 0.6)' },
  { name: 'yellow', fill: 'rgba(234, 179, 8, 0.45)', border: 'rgba(250, 204, 21, 0.85)', glow: 'rgba(234, 179, 8, 0.6)' },
  { name: 'emerald', fill: 'rgba(16, 185, 129, 0.45)', border: 'rgba(52, 211, 153, 0.85)', glow: 'rgba(16, 185, 129, 0.6)' },
];

export const DISTRACTOR_COLOR = {
  name: 'hazard-red',
  fill: 'rgba(239, 68, 68, 0.55)',
  border: 'rgba(248, 113, 113, 0.95)',
  glow: 'rgba(239, 68, 68, 0.75)',
};

export const DIFFICULTY_CONFIG = {
  easy: {
    name: 'Facile',
    emoji: '🌱',
    desc: 'Bulles géantes, mouvement doux, idéal pour débuter le pointage.',
    targetCount: 10,
    maxSimultaneous: 2,
    bubbleSize: 140, // px
    dwellMs: 2200,   // 2.2s dwell
    hasDistractors: false,
    speedMultiplier: 0.8,
    toleranceRadius: 25, // extra padding for collision
  },
  medium: {
    name: 'Moyen',
    emoji: '⚡',
    desc: 'Bulles de taille moyenne, déplacement fluide et contrôle plus fin.',
    targetCount: 15,
    maxSimultaneous: 3,
    bubbleSize: 100, // px
    dwellMs: 1800,   // 1.8s dwell
    hasDistractors: false,
    speedMultiplier: 1.1,
    toleranceRadius: 20,
  },
  hard: {
    name: 'Difficile',
    emoji: '🔥',
    desc: 'Petites bulles rapides et fausses bulles rouges à éviter (inhibition).',
    targetCount: 20,
    maxSimultaneous: 4,
    bubbleSize: 75,  // px
    dwellMs: 1400,   // 1.4s dwell
    hasDistractors: true,
    distractorRatio: 0.25,
    speedMultiplier: 1.5,
    toleranceRadius: 15,
  },
};

export const ENCOURAGEMENTS = [
  'Super ! 🫧',
  'Bravo ! 🎉',
  'Incroyable ! ✨',
  'Champion ! 🏆',
  'Parfait ! ⭐',
  'Magique ! 🐟',
];

export const TARGET_BUBBLES_PER_SESSION = 10;
