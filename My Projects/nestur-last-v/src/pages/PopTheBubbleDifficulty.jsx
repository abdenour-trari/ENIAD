/**
 * PopTheBubbleDifficulty.jsx
 * Difficulty selection page for the Pop the Bubble game.
 * Presents 3 level cards (Easy, Medium, Hard) and navigates to /play/pop-bubble-game?difficulty=<level>.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Sparkles } from 'lucide-react';
import { DIFFICULTY_CONFIG } from '../games/PopTheBubbleGame/popTheBubble.config';
import '../styles/PopTheBubbleGame.css';

const LEVEL_CARDS = [
  {
    key: 'easy',
    ...DIFFICULTY_CONFIG.easy,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    details: '10 Bulles · Maintien 2.2s · Touches géantes',
  },
  {
    key: 'medium',
    ...DIFFICULTY_CONFIG.medium,
    color: '#E8841A',
    gradient: 'linear-gradient(135deg, #E8841A, #D97706)',
    details: '15 Bulles · Maintien 1.8s · Taille moyenne',
  },
  {
    key: 'hard',
    ...DIFFICULTY_CONFIG.hard,
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    details: '20 Bulles · Maintien 1.4s · Pièges rouges ⚠️',
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

export default function PopTheBubbleDifficulty() {
  const navigate = useNavigate();

  const handleSelectLevel = (levelKey) => {
    navigate(`/play/pop-bubble-game?difficulty=${levelKey}`);
  };

  return (
    <div className="ptb-difficulty-page">
      {/* ── Top Header ────────────────────────────────────────────────── */}
      <div className="ptb-difficulty-header">
        <button className="ptb-back-btn" onClick={() => navigate('/play')}>
          <ArrowLeft size={18} />
          Retour aux Jeux
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="ptb-difficulty-title">🫧 Pop the Bubble</h1>
          <p className="ptb-difficulty-subtitle">
            Choisis ton niveau de difficulté et fais éclater les bulles avec ton index !
          </p>
        </motion.div>
      </div>

      {/* ── Level Cards Grid ───────────────────────────────────────────── */}
      <motion.div
        className="ptb-difficulty-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {LEVEL_CARDS.map((card) => (
          <motion.div
            key={card.key}
            className="ptb-level-card"
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

            <div className="ptb-level-emoji">{card.emoji}</div>
            <div className="ptb-level-name">{card.name}</div>
            <div className="ptb-level-desc">{card.desc}</div>

            <div className="ptb-level-tag">
              <Sparkles size={14} />
              <span>{card.details}</span>
            </div>

            <button
              className="ptb-level-play-btn"
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
