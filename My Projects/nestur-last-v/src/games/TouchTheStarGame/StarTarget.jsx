/**
 * StarTarget.jsx
 * Visual component for the star target in Touch the Star game.
 * Renders SVG golden star with Framer Motion idle ambient glow and
 * bright burst sparkles on touch contact.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StarTarget({
  star,
  isTouched,
  onClick,
}) {
  if (!star) return null;

  const { id, x, y, size } = star;
  const radius = size / 2;

  return (
    <motion.div
      key={id}
      initial={{ scale: 0, opacity: 0, rotate: -30 }}
      animate={{
        scale: isTouched ? 1.35 : 1,
        opacity: 1,
        rotate: isTouched ? 45 : 0,
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        scale: { type: 'spring', stiffness: 350, damping: 18 },
        rotate: { duration: 0.3 },
      }}
      onClick={() => onClick && onClick(star)}
      style={{
        position: 'absolute',
        left: x - radius,
        top: y - radius,
        width: size,
        height: size,
        cursor: 'pointer',
        userSelect: 'none',
        zIndex: 10,
      }}
    >
      {/* Radiating Sparkles on Touch */}
      <AnimatePresence>
        {isTouched && (
          <motion.div
            className="star-burst-sparkles"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((deg * Math.PI) / 180) * (size * 0.9),
                  y: Math.sin((deg * Math.PI) / 180) * (size * 0.9),
                  opacity: 0,
                  scale: 0.2,
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#FBBF24',
                  boxShadow: '0 0 12px #FDE047, 0 0 20px #F59E0B',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Golden Star Target */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Glow halo */}
        <div
          style={{
            position: 'absolute',
            inset: -12,
            borderRadius: '50%',
            background: isTouched
              ? 'radial-gradient(circle, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0) 70%)'
              : 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0) 70%)',
            boxShadow: isTouched ? '0 0 30px #FBBF24' : '0 0 15px rgba(251, 191, 36, 0.5)',
            transition: 'all 0.2s ease',
          }}
        />

        {/* Star Icon Vector */}
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="url(#starGradient)"
          stroke="#FBBF24"
          strokeWidth="1"
          style={{
            filter: isTouched
              ? 'drop-shadow(0 0 16px #FDE047) drop-shadow(0 0 24px #F59E0B)'
              : 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.7))',
            transition: 'all 0.2s ease',
          }}
        >
          <defs>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    </motion.div>
  );
}
