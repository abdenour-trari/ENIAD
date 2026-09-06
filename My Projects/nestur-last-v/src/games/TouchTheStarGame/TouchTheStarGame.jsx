/**
 * TouchTheStarGame.jsx
 * Main core game component for "Touch the Star".
 * Features night sky space theme, single-target reach testing,
 * instant touch-and-go validation, telemetry logging, and accessible UI.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Volume2, VolumeX, Clock, Award, RefreshCw, CheckCircle } from 'lucide-react';
import useMediaPipeTracking, { isIndexPointing } from '../../hooks/useMediaPipeTracking';
import { useReflexEngine } from '../../hooks/useReflexEngine';
import { useSessionStore, useAuthStore } from '../../store';
import { soundManager } from '../../utils/soundManager';
import { useTouchTheStarEngine } from './useTouchTheStarEngine';
import StarTarget from './StarTarget';
import '../../styles/TouchTheStarGame.css';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TouchTheStarGame({
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

  // ── Container Dimensions & Time State ────────────────────────────────
  const [containerSize, setContainerSize] = useState({ width: 900, height: 600 });
  const [soundEnabled, setSoundEnabled]   = useState(true);
  const [sessionTime, setSessionTime]     = useState(0);

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

  // Timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── MediaPipe Tracking & Reflex Engine ───────────────────────────────
  const { landmarks, isTracking } = useMediaPipeTracking(videoRef, canvasRef, true);
  const { startTracking, stopTracking } = useReflexEngine({ analyzeEveryMs: 4000 });

  const isPointing = isIndexPointing(landmarks);

  // ── Handle Game Completion ───────────────────────────────────────────
  const handleGameComplete = async (telemetryData) => {
    if (sessionActiveRef.current) {
      sessionActiveRef.current = false;
      stopTracking();

      if (telemetryData.rounds) {
        telemetryData.rounds.forEach((r) => recordGesture(r));
      }

      await endSession();
      if (propOnComplete) propOnComplete(telemetryData);
    }
  };

  // ── Game Engine Hook ─────────────────────────────────────────────────
  const {
    starTarget,
    score,
    targetCount,
    encouragement,
    isGameOver,
    fingerPos,
    isTouched,
    resetGame,
    getTelemetryData,
  } = useTouchTheStarEngine({
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
    const sessionId = `tts_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    startSession(sessionId, learnerId, difficulty);
    startTracking();
    sessionActiveRef.current = true;

    return () => {
      stopTracking();
    };
  }, []);

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
    <div className="tts-game-page">
      {/* Hidden Video Elements for MediaPipe */}
      <video ref={videoRef} className="tts-hidden-video" playsInline muted />
      <canvas ref={canvasRef} className="tts-hidden-canvas" />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="tts-header">
        <div className="tts-header-left">
          {/* Home Button */}
          <button
            className="tts-home-btn"
            onClick={handleExit}
            aria-label="Accueil / Retour au catalogue"
            title="Home"
          >
            <Home size={20} />
          </button>

          {/* Score Badge */}
          <div className="tts-score-badge" aria-label={`Score: ${score}`}>
            <span className="tts-score-label">Score:</span>
            <span className="tts-score-val">{score}</span>
          </div>
        </div>

        <div className="tts-header-right">
          {/* Session Timer */}
          <div className="tts-timer-badge" aria-label={`Temps de session: ${formatTime(sessionTime)}`}>
            <Clock size={18} className="tts-timer-icon" />
            <span>{formatTime(sessionTime)}</span>
          </div>
        </div>
      </header>

      {/* ── Main Night Sky Playground Container ───────────────────────── */}
      <main ref={containerRef} className="tts-playground">
        {/* Deep Night Sky Background */}
        <div className="tts-space-bg" />

        {/* Moon & Ringed Planet */}
        <div className="tts-moon" />
        <div className="tts-planet" />

        {/* Animated Stars Background */}
        <div className="tts-star-twinkles">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="tts-twinkle-dot"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 23) % 75}%`,
                animationDelay: `${(i % 5) * 0.7}s`,
              }}
            />
          ))}
        </div>

        {/* Mountains & Lake Bottom Vector Silhouette */}
        <svg className="tts-mountains-svg" viewBox="0 0 1200 140" preserveAspectRatio="none">
          <polygon points="0,140 120,60 250,140" fill="rgba(30, 27, 75, 0.7)" />
          <polygon points="180,140 340,30 520,140" fill="rgba(15, 23, 42, 0.85)" />
          <polygon points="450,140 650,45 850,140" fill="rgba(30, 27, 75, 0.7)" />
          <polygon points="780,140 980,20 1200,140" fill="rgba(15, 23, 42, 0.9)" />
          <rect x="0" y="110" width="1200" height="30" fill="rgba(14, 165, 233, 0.25)" />
        </svg>

        {/* Floating Encouragement Banner */}
        <AnimatePresence>
          {encouragement && (
            <motion.div
              className="tts-encouragement-banner"
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {encouragement}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Star Target */}
        <StarTarget
          star={starTarget}
          isTouched={isTouched}
          onClick={() => {
            // Mouse / touch fallback support for testing
          }}
        />

        {/* Finger Pointer Circle Overlay */}
        {fingerPos && (
          <div
            className={`tts-finger-pointer ${isPointing ? 'pointing' : ''}`}
            style={{
              left: fingerPos.x,
              top: fingerPos.y,
            }}
          >
            <div className="tts-pointer-dot" />
            <div className="tts-pointer-pulse" />
          </div>
        )}
      </main>

      {/* ── Bottom Fixed Instruction Pill Banner ──────────────────────── */}
      <footer className="tts-instruction-bar">
        <div className="tts-instruction-pill">
          <button
            className={`tts-sound-btn ${soundEnabled ? 'active' : ''}`}
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          <span className="tts-instruction-text">
            Touche l'étoile aussi vite et précisément que possible.
          </span>
        </div>
      </footer>

      {/* ── End of Session Celebration Modal ─────────────────────────── */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            className="tts-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="tts-modal-content"
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="tts-modal-header">
                <Award size={48} className="tts-trophy-icon" />
                <h2>Bravo ! Session Réussie 🌟</h2>
                <p>Tes mouvements de reach sont super précis !</p>
              </div>

              {telemetry && (
                <div className="tts-modal-stats">
                  <div className="tts-stat-card">
                    <span className="stat-label">Étoiles touchées</span>
                    <span className="stat-value">{score} / {targetCount}</span>
                  </div>
                  <div className="tts-stat-card">
                    <span className="stat-label">Précision de visée</span>
                    <span className="stat-value">{telemetry.accuracy}%</span>
                  </div>
                  <div className="tts-stat-card">
                    <span className="stat-label">Temps de réaction</span>
                    <span className="stat-value">{telemetry.average_reaction_time_ms}ms</span>
                  </div>
                </div>
              )}

              <div className="tts-modal-actions">
                <button
                  className="tts-btn primary"
                  onClick={() => {
                    resetGame();
                    startTracking();
                    sessionActiveRef.current = true;
                  }}
                >
                  <RefreshCw size={20} />
                  Rejouer
                </button>
                <button className="tts-btn secondary" onClick={handleExit}>
                  <CheckCircle size={20} />
                  Retour aux jeux
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
