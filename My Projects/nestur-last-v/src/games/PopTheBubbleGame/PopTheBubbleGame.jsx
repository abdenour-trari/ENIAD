/**
 * PopTheBubbleGame.jsx
 * Core main game component for "Pop the Bubble".
 * Integrates MediaPipe Hand tracking, Web Audio sound effects,
 * underwater visual decorations, dwell-time interactions, and telemetry logging.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, VolumeX, Star, RefreshCw, CheckCircle, Award, Sparkles } from 'lucide-react';
import useMediaPipeTracking, { isIndexPointing } from '../../hooks/useMediaPipeTracking';
import { useReflexEngine } from '../../hooks/useReflexEngine';
import { useSessionStore, useAuthStore } from '../../store';
import { soundManager } from '../../utils/soundManager';
import { usePopTheBubbleEngine } from './usePopTheBubbleEngine';
import Bubble from './Bubble';
import '../../styles/PopTheBubbleGame.css';

export default function PopTheBubbleGame({
  difficulty: propDifficulty,
  onComplete: propOnComplete,
  onExit: propOnExit,
}) {
  const [searchParams] = useSearchParams();
  const difficulty = propDifficulty || searchParams.get('difficulty') || 'easy';
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const { startSession, recordGesture, endSession } = useSessionStore();

  // ── Refs ─────────────────────────────────────────────────────────────
  const containerRef = useRef(null);
  const videoRef     = useRef(null);
  const canvasRef    = useRef(null);
  const sessionActiveRef = useRef(false);

  // ── Container Dimensions ─────────────────────────────────────────────
  const [containerSize, setContainerSize] = useState({ width: 900, height: 600 });
  const [soundEnabled, setSoundEnabled]   = useState(true);
  const [showWebcam, setShowWebcam]       = useState(true);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 900,
          height: containerRef.current.clientHeight || 600,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ── Hand Tracking Hook ───────────────────────────────────────────────
  const { landmarks, isTracking, error: cameraError } = useMediaPipeTracking(videoRef, canvasRef, true);

  // ── Reflex Engine ────────────────────────────────────────────────────
  const { startTracking, stopTracking } = useReflexEngine({ analyzeEveryMs: 4000 });

  // Index pointing state
  const isPointing = isIndexPointing(landmarks);

  // ── Handle Game Completion Telemetry ─────────────────────────────────
  const handleGameComplete = async (telemetryData) => {
    if (sessionActiveRef.current) {
      sessionActiveRef.current = false;
      stopTracking();

      // Record gesture telemetry
      if (telemetryData.gestures) {
        telemetryData.gestures.forEach((g) => recordGesture(g));
      }

      await endSession();
      if (propOnComplete) propOnComplete(telemetryData);
    }
  };

  // ── Game Engine Hook ─────────────────────────────────────────────────
  const {
    bubbles,
    score,
    poppedCount,
    targetCount,
    encouragement,
    isGameOver,
    fingerPos,
    activeHoverId,
    resetGame,
    getTelemetryData,
  } = usePopTheBubbleEngine({
    difficultyKey: difficulty,
    containerSize,
    landmarks,
    isPointing,
    soundEnabled,
    onGameComplete: handleGameComplete,
  });

  // ── Session Initialization ───────────────────────────────────────────
  useEffect(() => {
    const learnerId = profile?.learner_id || user?.id || 'demo_learner';
    const sessionId = `ptb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    startSession(sessionId, learnerId, difficulty);
    startTracking();
    sessionActiveRef.current = true;

    return () => {
      stopTracking();
    };
  }, []);

  // Sound toggle handler
  const toggleSound = () => {
    const nextState = soundManager.toggle();
    setSoundEnabled(nextState);
  };

  const handleExit = () => {
    if (propOnExit) propOnExit();
    else navigate('/play');
  };

  const telemetry = isGameOver ? getTelemetryData() : null;

  return (
    <div className="ptb-game-page">
      {/* ── Hidden video elements for MediaPipe ────────────────────── */}
      <video ref={videoRef} className="ptb-hidden-video" playsInline muted />
      <canvas ref={canvasRef} className="ptb-hidden-canvas" />

      {/* ── Top Navigation / Game Header ────────────────────────────── */}
      <header className="ptb-header">
        <div className="ptb-header-left">
          <button className="ptb-back-btn" onClick={handleExit} aria-label="Retour aux jeux">
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>
          <div className="ptb-title-group">
            <h1 className="ptb-title">🫧 Pop the Bubble</h1>
            <p className="ptb-subtitle">Touche les bulles avec ton index.</p>
          </div>
        </div>

        <div className="ptb-header-right">
          {/* Sound toggle button (accessible via keyboard & aria) */}
          <button
            className={`ptb-icon-btn ${soundEnabled ? 'active' : ''}`}
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>

          {/* Star Score Counter */}
          <div className="ptb-score-badge" aria-label={`Score: ${score} sur ${targetCount}`}>
            <Star className="ptb-star-icon" size={24} />
            <span className="ptb-score-text">{score} / {targetCount}</span>
          </div>
        </div>
      </header>

      {/* ── Main Underwater Playground Container ─────────────────────── */}
      <main ref={containerRef} className="ptb-playground">
        {/* Ocean Background & SVG Decorations */}
        <div className="ptb-ocean-bg" />

        {/* Swimming Clownfish (Framer Motion) */}
        <motion.div
          className="ptb-clownfish"
          animate={{
            x: [0, containerSize.width * 0.7, containerSize.width * 0.3, 0],
            y: [0, -30, 20, 0],
            scaleX: [1, 1, -1, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🐠
        </motion.div>

        {/* Seaweed & Corals Vector Decoration */}
        <svg className="ptb-corals-svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,120 Q30,60 60,120 Q90,40 120,120 Q150,70 180,120" fill="none" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="12" strokeLinecap="round" />
          <path d="M1000,120 Q1040,50 1080,120 Q1120,30 1160,120 Q1180,70 1200,120" fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="14" strokeLinecap="round" />
        </svg>

        {/* Floating Encouragement Banner */}
        <AnimatePresence>
          {encouragement && (
            <motion.div
              className="ptb-encouragement-banner"
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {encouragement}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Render Bubbles */}
        {bubbles.map((bubble) => (
          <Bubble
            key={bubble.id}
            bubble={bubble}
            isHovered={activeHoverId === bubble.id}
            onClick={() => {
              // Mouse/touch fallback support for E2E tests & non-camera users
            }}
          />
        ))}

        {/* Finger Pointers Visual Overlay */}
        {fingerPos && (
          <div
            className={`ptb-finger-pointer ${isPointing ? 'pointing' : ''}`}
            style={{
              left: fingerPos.x,
              top: fingerPos.y,
            }}
          >
            <div className="ptb-pointer-dot" />
            <div className="ptb-pointer-pulse" />
          </div>
        )}
      </main>

      {/* ── PIP Webcam Feed Window (Bottom Right) ──────────────────── */}
      <div className="ptb-webcam-pip">
        <div className="ptb-pip-header">
          <span>{isTracking ? '🟢 Tracking Actif' : '🔴 Recherche Main...'}</span>
          <button onClick={() => setShowWebcam(!showWebcam)} className="ptb-pip-toggle">
            {showWebcam ? 'Masquer' : 'Voir'}
          </button>
        </div>
        {showWebcam && (
          <div className="ptb-pip-body">
            {!isTracking && <div className="ptb-pip-placeholder">Pointez votre index vers la caméra 🖐️</div>}
          </div>
        )}
      </div>

      {/* ── End of Session / Game Over Celebration Modal ───────────── */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            className="ptb-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="ptb-modal-content"
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="ptb-modal-header">
                <Award size={48} className="ptb-trophy-icon" />
                <h2>Session Terminée ! 🎉</h2>
                <p>Tu as fait un travail formidable !</p>
              </div>

              {telemetry && (
                <div className="ptb-modal-stats">
                  <div className="ptb-stat-card">
                    <span className="stat-label">Bulles éclatéess</span>
                    <span className="stat-value">{score} / {targetCount}</span>
                  </div>
                  <div className="ptb-stat-card">
                    <span className="stat-label">Précision motrice</span>
                    <span className="stat-value">{telemetry.accuracy}%</span>
                  </div>
                  <div className="ptb-stat-card">
                    <span className="stat-label">Temps total</span>
                    <span className="stat-value">{telemetry.session_time_seconds}s</span>
                  </div>
                </div>
              )}

              <div className="ptb-modal-actions">
                <button
                  className="ptb-btn primary"
                  onClick={() => {
                    resetGame();
                    startTracking();
                    sessionActiveRef.current = true;
                  }}
                >
                  <RefreshCw size={20} />
                  Rejouer
                </button>
                <button className="ptb-btn secondary" onClick={handleExit}>
                  <CheckCircle size={20} />
                  Retour au tableau de bord
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
