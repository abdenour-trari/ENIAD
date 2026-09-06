/**
 * useTouchTheStarEngine.js
 * Logic engine hook for Touch the Star game.
 * Manages single-target spawning with minimum distance constraints,
 * instantaneous direct contact detection, reach metrics calculation,
 * and telemetry output for aiEngine.js.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { DIFFICULTY_CONFIG, ENCOURAGEMENTS } from './touchTheStar.config';
import { soundManager } from '../../utils/soundManager';
import { calculateSmoothness } from '../../hooks/useMediaPipeTracking';

function getNewStarPosition(width, height, starSize, prevPos, minDistance) {
  const margin = starSize + 40;
  const w = Math.max(width - margin * 2, 100);
  const h = Math.max(height - margin * 2 - 120, 100);

  let x = margin + Math.random() * w;
  let y = margin + 80 + Math.random() * h;
  let attempts = 0;

  if (prevPos) {
    while (attempts < 25) {
      const dist = Math.hypot(x - prevPos.x, y - prevPos.y);
      if (dist >= minDistance) break;
      x = margin + Math.random() * w;
      y = margin + 80 + Math.random() * h;
      attempts++;
    }
  }

  return { x, y };
}

export function useTouchTheStarEngine({
  difficultyKey = 'easy',
  containerSize = { width: 900, height: 600 },
  landmarks = null,
  isPointing = true,
  soundEnabled = true,
  onGameComplete = null,
}) {
  const config = DIFFICULTY_CONFIG[difficultyKey] || DIFFICULTY_CONFIG.easy;

  // ── State ─────────────────────────────────────────────────────────────
  const [starTarget, setStarTarget]         = useState(null);
  const [score, setScore]                   = useState(0);
  const [encouragement, setEncouragement]   = useState('');
  const [isGameOver, setIsGameOver]         = useState(false);
  const [fingerPos, setFingerPos]           = useState(null); // { x, y } in px
  const [isTouched, setIsTouched]           = useState(false);

  // ── Reach Telemetry Refs ─────────────────────────────────────────────
  const roundLogsRef         = useRef([]);
  const currentTrajectoryRef = useRef([]);
  const positionHistoryRef   = useRef([]);
  const sessionStartTimeRef  = useRef(Date.now());
  const starSpawnTimeRef     = useRef(Date.now());
  const movementStartTimeRef = useRef(null);
  const pausesCountRef       = useRef(0);
  const lastVelRef           = useRef(null);

  // ── Spawn New Star ────────────────────────────────────────────────────
  const spawnNextStar = useCallback((prevPos = null) => {
    const { x, y } = getNewStarPosition(
      containerSize.width,
      containerSize.height,
      config.starSize,
      prevPos,
      config.minDistance
    );

    const now = Date.now();
    starSpawnTimeRef.current = now;
    movementStartTimeRef.current = null;
    currentTrajectoryRef.current = [];
    pausesCountRef.current = 0;
    lastVelRef.current = null;

    setStarTarget({
      id: `star_${now}_${Math.random().toString(36).substr(2, 5)}`,
      x,
      y,
      size: config.starSize,
      spawnTime: now,
    });
    setIsTouched(false);
  }, [config, containerSize]);

  // Reset Game
  const resetGame = useCallback(() => {
    setScore(0);
    setEncouragement('');
    setIsGameOver(false);
    roundLogsRef.current = [];
    positionHistoryRef.current = [];
    sessionStartTimeRef.current = Date.now();
    spawnNextStar(null);
  }, [spawnNextStar]);

  useEffect(() => {
    resetGame();
  }, [difficultyKey, containerSize.width, containerSize.height]);

  // ── Track Finger Position & Detect Movement Start ─────────────────────
  useEffect(() => {
    if (!landmarks || landmarks.length < 9) {
      setFingerPos(null);
      return;
    }

    // Index tip (landmark 8)
    const indexTip = landmarks[8];
    if (!indexTip) return;

    const px = (1 - indexTip.x) * containerSize.width;
    const py = indexTip.y * containerSize.height;
    const now = Date.now();

    setFingerPos({ x: px, y: py });

    // Store point in current round trajectory
    currentTrajectoryRef.current.push({ x: px, y: py, t: now });
    positionHistoryRef.current.push({ x: px, y: py, t: now });
    if (positionHistoryRef.current.length > 60) positionHistoryRef.current.shift();

    // Detect movement start (when finger moves > 12px from position at spawn)
    if (!movementStartTimeRef.current && currentTrajectoryRef.current.length > 2) {
      const firstPt = currentTrajectoryRef.current[0];
      const distFromStart = Math.hypot(px - firstPt.x, py - firstPt.y);
      if (distFromStart > 12) {
        movementStartTimeRef.current = now;
      }
    }

    // Detect direction change / pauses for corrections metric
    const len = currentTrajectoryRef.current.length;
    if (len >= 3) {
      const p1 = currentTrajectoryRef.current[len - 3];
      const p2 = currentTrajectoryRef.current[len - 2];
      const p3 = currentTrajectoryRef.current[len - 1];

      const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
      const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
      const dot = v1.x * v2.x + v1.y * v2.y;

      if (dot < -5) { // sharp direction correction
        pausesCountRef.current++;
      }
    }
  }, [landmarks, containerSize.width, containerSize.height]);

  // ── Direct Contact Collision Check (No dwell-time) ───────────────────
  useEffect(() => {
    if (isGameOver || isTouched || !fingerPos || !starTarget || !isPointing) return;

    const dist = Math.hypot(fingerPos.x - starTarget.x, fingerPos.y - starTarget.y);
    const hitRadius = starTarget.size / 2 + config.toleranceRadius;

    if (dist <= hitRadius) {
      // CONTACT!
      const now = Date.now();
      setIsTouched(true);

      if (soundEnabled) soundManager.playStarTouch();

      const enc = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
      setEncouragement(enc);

      const reactionTime = movementStartTimeRef.current
        ? movementStartTimeRef.current - starTarget.spawnTime
        : now - starTarget.spawnTime;
      const movementTime = movementStartTimeRef.current
        ? now - movementStartTimeRef.current
        : now - starTarget.spawnTime;

      // Log round metrics
      roundLogsRef.current.push({
        round: score + 1,
        starX: starTarget.x,
        starY: starTarget.y,
        touchX: fingerPos.x,
        touchY: fingerPos.y,
        distFromCenter: Math.round(dist),
        reactionTimeMs: Math.max(100, Math.round(reactionTime)),
        movementTimeMs: Math.max(150, Math.round(movementTime)),
        correctionsCount: pausesCountRef.current,
        trajectory: [...currentTrajectoryRef.current],
        timestamp: now,
      });

      const nextScore = score + 1;
      setScore(nextScore);

      if (nextScore >= config.targetCount) {
        setIsGameOver(true);
        if (soundEnabled) soundManager.playCelebration();
        if (onGameComplete) {
          setTimeout(() => onGameComplete(getTelemetryData(nextScore)), 400);
        }
      } else {
        // Schedule next star spawn after 250ms illumination delay
        setTimeout(() => {
          spawnNextStar({ x: starTarget.x, y: starTarget.y });
        }, 250);
      }
    }
  }, [fingerPos, isPointing, isGameOver, isTouched, starTarget, config, score, soundEnabled, spawnNextStar]);

  // ── Calculate LPI Telemetry Metrics for aiEngine.js ─────────────────
  const getTelemetryData = useCallback((finalScore = score) => {
    const totalTimeMs = Date.now() - sessionStartTimeRef.current;
    const logs = roundLogsRef.current;

    const avgDist = logs.length > 0
      ? logs.reduce((acc, r) => acc + (r.distFromCenter || 0), 0) / logs.length
      : 0;

    const avgReactionTime = logs.length > 0
      ? logs.reduce((acc, r) => acc + (r.reactionTimeMs || 0), 0) / logs.length
      : 0;

    const avgMovementTime = logs.length > 0
      ? logs.reduce((acc, r) => acc + (r.movementTimeMs || 0), 0) / logs.length
      : 0;

    const totalCorrections = logs.reduce((acc, r) => acc + (r.correctionsCount || 0), 0);
    const smoothness = calculateSmoothness(positionHistoryRef.current);

    return {
      session_time_seconds: Math.round(totalTimeMs / 1000),
      total_attempts: logs.length,
      successful_touches: finalScore,
      target_count: config.targetCount,
      accuracy: Math.max(0, Math.min(100, Math.round(100 - avgDist * 1.8))),
      smoothness: Math.round(smoothness * 100) / 100,
      average_reaction_time_ms: Math.round(avgReactionTime),
      average_movement_time_ms: Math.round(avgMovementTime),
      pauses_and_corrections: totalCorrections,
      difficulty: difficultyKey,
      rounds: logs,
    };
  }, [score, config, difficultyKey]);

  return {
    starTarget,
    score,
    targetCount: config.targetCount,
    encouragement,
    isGameOver,
    fingerPos,
    isTouched,
    resetGame,
    getTelemetryData,
  };
}
