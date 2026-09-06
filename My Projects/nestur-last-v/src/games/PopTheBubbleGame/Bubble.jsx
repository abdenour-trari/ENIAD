/**
 * Bubble.jsx
 * Visual component for individual soap bubbles in Pop the Bubble game.
 * Features Framer Motion float animations, circular dwell-time progress ring,
 * soapy highlights/reflections, and pop burst particles.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Bubble({
  bubble,
  isHovered,
  onClick,
}) {
  const { id, x, y, size, color, dwellProgress, popped, isDistractor } = bubble;
  const radius = size / 2;
  const strokeWidth = 6;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - dwellProgress * circumference;

  if (popped) {
    return (
      <AnimatePresence>
        <motion.div
          key={`pop_${id}`}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.6, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: x - radius,
            top: y - radius,
            width: size,
            height: size,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {/* Pop particles */}
          <div className="bubble-burst-particles">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((deg * Math.PI) / 180) * (size * 0.8),
                  y: Math.sin((deg * Math.PI) / 180) * (size * 0.8),
                  opacity: 0,
                  scale: 0.2,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: color.border,
                  boxShadow: `0 0 10px ${color.glow}`,
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      key={id}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isHovered ? 1.08 : 1,
        opacity: 1,
        y: [0, -8, 0],
      }}
      transition={{
        scale: { type: 'spring', stiffness: 300, damping: 20 },
        y: { repeat: Infinity, duration: 3 + (bubble.seed % 2), ease: 'easeInOut' },
      }}
      onClick={() => onClick && onClick(bubble)}
      style={{
        position: 'absolute',
        left: x - radius,
        top: y - radius,
        width: size,
        height: size,
        cursor: 'pointer',
        userSelect: 'none',
        zIndex: isHovered ? 20 : 5,
      }}
    >
      {/* ── Circular Dwell Progress Ring ───────────────────────────────── */}
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        {/* Track */}
        <circle
          stroke="rgba(255, 255, 255, 0.2)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Arc */}
        {dwellProgress > 0 && (
          <circle
            stroke={isDistractor ? '#EF4444' : '#F59E0B'}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 60ms linear' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        )}
      </svg>

      {/* ── Soap Bubble Body ───────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: color.fill,
          border: `2px solid ${color.border}`,
          boxShadow: `0 8px 24px ${color.glow}, inset 0 0 15px rgba(255, 255, 255, 0.4)`,
          backdropFilter: 'blur(3px)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Soap reflection highlight */}
        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: '18%',
            width: '28%',
            height: '22%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 100%)',
            transform: 'rotate(-25deg)',
          }}
        />

        {/* Secondary subtle reflection */}
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '20%',
            width: '18%',
            height: '14%',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.4)',
          }}
        />

        {/* Content / Icon inside bubble */}
        {isDistractor ? (
          <span style={{ fontSize: size * 0.35, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
            ⚠️
          </span>
        ) : (
          <span
            style={{
              fontSize: size * 0.35,
              opacity: isHovered ? 1 : 0.7,
              transform: isHovered ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.2s ease',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }}
          >
            🫧
          </span>
        )}
      </div>
    </motion.div>
  );
}
