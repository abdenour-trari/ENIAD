/**
 * usePopTheBubbleEngine.js
 * Game logic engine hook for Pop the Bubble.
 * Handles bubble spawning, collision detection with MediaPipe index landmark,
 * dwell progress calculations, scoring, and telemetry compilation.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { BUBBLE_COLORS, DISTRACTOR_COLOR, DIFFICULTY_CONFIG, ENCOURAGEMENTS } from './popTheBubble.config';
import { soundManager } from '../../utils/soundManager';
import { calculateSmoothness } from '../../hooks/useMediaPipeTracking';

function getRandomPosition(containerWidth, containerHeight, bubbleSize, existingBubbles = []) {
  const margin = bubbleSize + 20;
  const w = Math.max(containerWidth - margin * 2, 100);
  const h = Math.max(containerHeight - margin * 2 - 120, 100); // 120px safety for header

  let x = margin + Math.random() * w;
  let y = margin + 80 + Math.random() * h;
  let attempts = 0;

  // Anti-overlap check
  while (attempts < 15) {
    const overlaps = existingBubbles.some(b => {
      if (b.popped) return false;
      const d = Math.hypot(b.x - x, b.y - y);
      return d < (b.size / 2 + bubbleSize / 2 + 30);
    });

    if (!overlaps) break;
    x = margin + Math.random() * w;
    y = margin + 80 + Math.random() * h;
    attempts++;
  }

  return { x, y };
}

export function usePopTheBubbleEngine({
  difficultyKey = 'easy',
  containerSize = { width: 800, height: 600 },
  landmarks = null,
  isPointing = true,
  soundEnabled = true,
  onGameComplete = null,
}) {
  const config = DIFFICULTY_CONFIG[difficultyKey] || DIFFICULTY_CONFIG.easy;

  // ── State ─────────────────────────────────────────────────────────────
  const [bubbles, setBubbles]               = useState([]);
  const [score, setScore]                   = useState(0);
  const [poppedCount, setPoppedCount]       = useState(0);
  const [encouragement, setEncouragement]   = useState('');
  const [isGameOver, setIsGameOver]         = useState(false);
  const [fingerPos, setFingerPos]           = useState(null); // { x, y } in px
  const [activeHoverId, setActiveHoverId]   = useState(null);

  // ── Telemetry Refs ───────────────────────────────────────────────────
  const gestureLogsRef       = useRef([]);
  const positionBufferRef    = useRef([]);
  const sessionStartTimeRef  = useRef(Date.now());
  const dwellStartMapRef     = useRef({}); // bubbleId -> timestamp
  const dwellInterruptsRef   = useRef(0);
  const totalCollisionsRef   = useRef(0);
  const offTargetCollisionsRef = useRef(0);

  // ── Init & Spawn initial bubbles ──────────────────────────────────────
  const spawnBubble = useCallback((currentBubbles = [], forceDistractor = false) => {
    const id = `b_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const isDistractor = forceDistractor || (config.hasDistractors && Math.random() < config.distractorRatio);
    const colorObj = isDistractor ? DISTRACTOR_COLOR : BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    const size = isDistractor ? Math.round(config.bubbleSize * 0.85) : config.bubbleSize;

    const { x, y } = getRandomPosition(containerSize.width, containerSize.height, size, currentBubbles);

    return {
      id,
      x,
      y,
      size,
      color: colorObj,
      isDistractor,
      dwellProgress: 0,
      popped: false,
      spawnTime: Date.now(),
      seed: Math.random() * 100, // for floating animation drift
    };
  }, [config, containerSize]);

  // Reset or initialize game
  const resetGame = useCallback(() => {
    const initialBubbles = [];
    for (let i = 0; i < config.maxSimultaneous; i++) {
      const b = spawnBubble(initialBubbles, i === 1 && config.hasDistractors);
      initialBubbles.push(b);
    }
    setBubbles(initialBubbles);
    setScore(0);
    setPoppedCount(0);
    setEncouragement('');
    setIsGameOver(false);
    gestureLogsRef.current = [];
    positionBufferRef.current = [];
    dwellStartMapRef.current = {};
    dwellInterruptsRef.current = 0;
    sessionStartTimeRef.current = Date.now();
  }, [config, spawnBubble]);

  useEffect(() => {
    resetGame();
  }, [difficultyKey, containerSize.width, containerSize.height]);

  // ── Convert Landmarks to Container Canvas Pixels ─────────────────────
  useEffect(() => {
    if (!landmarks || landmarks.length < 9) {
      setFingerPos(null);
      return;
    }

    // Index tip landmark 8
    const indexTip = landmarks[8];
    if (!indexTip) return;

    // MediaPipe landmark (0..1) -> mirrored X for camera preview
    const px = (1 - indexTip.x) * containerSize.width;
    const py = indexTip.y * containerSize.height;

    setFingerPos({ x: px, y: py });

    // Save for trajectory smoothness calculation
    positionBufferRef.current.push({ x: px, y: py, t: Date.now() });
    if (positionBufferRef.current.length > 50) {
      positionBufferRef.current.shift();
    }
  }, [landmarks, containerSize.width, containerSize.height]);

  // ── Collision & Dwell Loop ───────────────────────────────────────────
  useEffect(() => {
    if (isGameOver || !fingerPos) return;

    const now = Date.now();
    let currentHoverId = null;

    setBubbles((prevBubbles) => {
      let stateChanged = false;

      const nextBubbles = prevBubbles.map((bubble) => {
        if (bubble.popped) return bubble;

        const dist = Math.hypot(fingerPos.x - bubble.x, fingerPos.y - bubble.y);
        const radius = bubble.size / 2 + config.toleranceRadius;
        const isHovering = dist <= radius && isPointing;

        if (isHovering) {
          currentHoverId = bubble.id;
          totalCollisionsRef.current++;

          if (!dwellStartMapRef.current[bubble.id]) {
            dwellStartMapRef.current[bubble.id] = now;
            if (soundEnabled) soundManager.playHover();
          }

          const elapsed = now - dwellStartMapRef.current[bubble.id];
          const progress = Math.min(1, elapsed / config.dwellMs);

          if (progress >= 1 && !bubble.popped) {
            // POPPED!
            stateChanged = true;

            if (bubble.isDistractor) {
              // Penalty for pop distractor
              offTargetCollisionsRef.current++;
              if (soundEnabled) soundManager.playOffPath();
              return { ...bubble, popped: true, dwellProgress: 1 };
            } else {
              // Success!
              if (soundEnabled) soundManager.playPopBubble();

              const encMsg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
              setEncouragement(encMsg);
              setScore((s) => s + 1);
              setPoppedCount((c) => {
                const nextCount = c + 1;
                if (nextCount >= config.targetCount) {
                  setIsGameOver(true);
                  if (soundEnabled) soundManager.playCelebration();
                  if (onGameComplete) {
                    setTimeout(() => onGameComplete(getTelemetryData()), 500);
                  }
                }
                return nextCount;
              });

              // Log gesture telemetry
              gestureLogsRef.current.push({
                type: 'bubble_pop',
                bubbleId: bubble.id,
                targetX: bubble.x,
                targetY: bubble.y,
                touchX: fingerPos.x,
                touchY: fingerPos.y,
                distFromCenter: Math.round(dist),
                reactionTimeMs: now - bubble.spawnTime,
                dwellMs: elapsed,
                isDistractor: false,
                timestamp: now,
              });

              return { ...bubble, popped: true, dwellProgress: 1 };
            }
          }

          if (Math.abs(progress - bubble.dwellProgress) > 0.02) {
            stateChanged = true;
            return { ...bubble, dwellProgress: progress };
          }
        } else {
          // Reset dwell if finger leaves
          if (dwellStartMapRef.current[bubble.id]) {
            delete dwellStartMapRef.current[bubble.id];
            dwellInterruptsRef.current++;
            if (bubble.dwellProgress > 0) {
              stateChanged = true;
              return { ...bubble, dwellProgress: 0 };
            }
          }
        }

        return bubble;
      });

      return stateChanged ? nextBubbles : prevBubbles;
    });

    setActiveHoverId(currentHoverId);
  }, [fingerPos, isPointing, isGameOver, config, soundEnabled]);

  // ── Spawn replacement bubbles when popped ─────────────────────────────
  useEffect(() => {
    if (isGameOver) return;

    setBubbles((prev) => {
      const activeCount = prev.filter((b) => !b.popped).length;
      if (activeCount < config.maxSimultaneous && poppedCount < config.targetCount) {
        const newB = spawnBubble(prev);
        return [...prev.filter((b) => !b.popped), newB];
      }
      return prev;
    });
  }, [poppedCount, config, isGameOver, spawnBubble]);

  // ── Generate Telemetry Metrics for aiEngine.js ──────────────────────
  const getTelemetryData = useCallback(() => {
    const totalTimeMs = Date.now() - sessionStartTimeRef.current;
    const logs = gestureLogsRef.current;
    const avgDist = logs.length > 0
      ? logs.reduce((acc, g) => acc + (g.distFromCenter || 0), 0) / logs.length
      : 0;

    const avgReactionTime = logs.length > 0
      ? logs.reduce((acc, g) => acc + (g.reactionTimeMs || 0), 0) / logs.length
      : 0;

    const smoothness = calculateSmoothness(positionBufferRef.current);

    return {
      session_time_seconds: Math.round(totalTimeMs / 1000),
      total_attempts: logs.length + dwellInterruptsRef.current,
      successful_pops: score,
      target_count: config.targetCount,
      accuracy: Math.max(0, Math.min(100, Math.round(100 - avgDist * 1.5))),
      smoothness: Math.round(smoothness * 100) / 100,
      average_reaction_time_ms: Math.round(avgReactionTime),
      dwell_interrupts: dwellInterruptsRef.current,
      off_target_clicks: offTargetCollisionsRef.current,
      difficulty: difficultyKey,
      gestures: logs,
    };
  }, [score, config, difficultyKey]);

  return {
    bubbles,
    score,
    poppedCount,
    targetCount: config.targetCount,
    encouragement,
    isGameOver,
    fingerPos,
    activeHoverId,
    resetGame,
    getTelemetryData,
  };
}
