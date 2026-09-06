/**
 * touchTheStar.config.js
 * Configuration file for the Touch the Star game in NestureAI.
 */

export const DIFFICULTY_CONFIG = {
  easy: {
    name: 'Facile',
    emoji: '🌱',
    desc: 'Grande étoile au centre, mouvement doux. Idéal pour débuter l’atteinte.',
    targetCount: 15,
    starSize: 130,       // px
    minDistance: 180,    // minimum distance from previous position in px
    toleranceRadius: 30, // extra padding around star for collision
    idleOscillation: false,
    sessionTimeSeconds: 60,
  },
  medium: {
    name: 'Moyen',
    emoji: '⚡',
    desc: 'Étoile de taille moyenne se déplaçant dans tout l’espace de jeu.',
    targetCount: 20,
    starSize: 90,
    minDistance: 280,
    toleranceRadius: 22,
    idleOscillation: false,
    sessionTimeSeconds: 60,
  },
  hard: {
    name: 'Difficile',
    emoji: '🔥',
    desc: 'Petite étoile rapide nécessitant une grande amplitude de mouvement.',
    targetCount: 25,
    starSize: 65,
    minDistance: 380,
    toleranceRadius: 16,
    idleOscillation: true,
    sessionTimeSeconds: 60,
  },
};

export const ENCOURAGEMENTS = [
  'Brillant ! ⭐',
  'Super Reach ! 🚀',
  'Quelle Vitesse ! ⚡',
  'Magnifique ! ✨',
  'Champion ! 🏆',
  'Étoile Filante ! ☄️',
];

export const STAR_COLOR = {
  fill: 'linear-gradient(135deg, #FDE047 0%, #F59E0B 100%)',
  stroke: '#FBBF24',
  glow: 'rgba(251, 191, 36, 0.75)',
};
