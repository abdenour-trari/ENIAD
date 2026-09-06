/**
 * TouchTheStarDifficulty.jsx
 * Difficulty selection page for Touch the Star game.
 * Presents 3 challenge level cards (Easy, Medium, Hard).
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Sparkles } from 'lucide-react';
import { DIFFICULTY_CONFIG } from '../games/TouchTheStarGame/touchTheStar.config';
import '../styles/TouchTheStarGame.css';

const LEVEL_CARDS = [
  {
    key: 'easy',
    ...DIFFICULTY_CONFIG.easy,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    details: '15 Étoiles · Grande cible · Zone centrale',
  },
  {
    key: 'medium',
    ...DIFFICULTY_CONFIG.medium,
    color: '#E8841A',
    gradient: 'linear-gradient(135deg, #E8841A, #D97706)',
    details: '20 Étoiles · Taille moyenne · Plein écran',
  },
  {
    key: 'hard',
    ...DIFFICULTY_CONFIG.hard,
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    details: '25 Étoiles · Petite cible rapide · Portée max',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

export default function TouchTheStarDifficulty() {
  const navigate = useNavigate();

  const handleSelectLevel = (levelKey) => {
    navigate(`/play/touch-star-game?difficulty=${levelKey}`);
  };

  return (
    <div className="tts-difficulty-page">
      {/* Top Header */}
      <div className="tts-difficulty-header">
        <button className="tts-back-btn" onClick={() => navigate('/play')}>
          <ArrowLeft size={18} />
          Retour aux Jeux
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="tts-difficulty-title">⭐ Touch the Star</h1>
          <p className="tts-difficulty-subtitle">
            Choisis ton niveau et touche l’étoile qui apparaît à l’écran !
          </p>
        </motion.div>
      </div>

      {/* Level Cards Grid */}
      <motion.div
        className="tts-difficulty-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {LEVEL_CARDS.map((card) => (
          <motion.div
            key={card.key}
            className="tts-level-card"
            variants={cardVariants}
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectLevel(card.key)}
            style={{ '--level-color': card.color }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 5,
                background: card.gradient,
                borderRadius: '20px 20px 0 0',
              }}
            />

            <div className="tts-level-emoji">{card.emoji}</div>
            <div className="tts-level-name">{card.name}</div>
            <div className="tts-level-desc">{card.desc}</div>

            <div className="tts-level-tag">
              <Sparkles size={14} />
              <span>{card.details}</span>
            </div>

            <button
              className="tts-level-play-btn"
              style={{ background: card.gradient }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectLevel(card.key);
              }}
            >
              <Play size={18} />
              Commencer ({card.name})
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
