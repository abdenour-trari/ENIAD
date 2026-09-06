import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { LogOut } from 'lucide-react';
import { useSessionStore, useAuthStore } from '../store';
import useHandTracking, { isGripping, getPalmCenter } from '../hooks/useHandTracking';
import api from '../services/api';

// ── Keyboard layout ───────────────────────────────────────────────────────────
const KEYBOARD_LAYOUT = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];

// ── Word banks ────────────────────────────────────────────────────────────────
const WORD_PROMPTS = {
  easy:   ['CAT', 'SUN', 'DOG', 'HAT', 'BUS', 'CUP', 'BOX', 'FAN', 'MAP', 'BED'],
  medium: ['BREAD', 'LIGHT', 'PLANT', 'MUSIC', 'WATER', 'APPLE', 'HOUSE', 'TRAIN', 'CHAIR', 'CLOUD'],
  hard:   ['BUTTER', 'ROCKET', 'BRIDGE', 'JUNGLE', 'PLANET', 'CASTLE', 'SCHOOL', 'GARDEN'],
};

const WORD_IMAGES = {
  CAT:'🐱', SUN:'☀️', DOG:'🐶', HAT:'🎩', BUS:'🚌', CUP:'☕', BOX:'📦', FAN:'🌀', MAP:'🗺️', BED:'🛏️',
  BREAD:'🍞', LIGHT:'💡', PLANT:'🌿', MUSIC:'🎵', WATER:'💧', APPLE:'🍎', HOUSE:'🏠', TRAIN:'🚆', CHAIR:'🪑', CLOUD:'☁️',
  BUTTER:'🧈', ROCKET:'🚀', BRIDGE:'🌉', JUNGLE:'🌴', PLANET:'🪐', CASTLE:'🏰', SCHOOL:'🏫', GARDEN:'🌷',
};

const ENCOURAGEMENTS = ['Awesome! 🌟', 'Great job! 🎉', 'Amazing! ✨', 'Champion! 🏆', 'Perfect! ⭐'];
const TARGET_WORDS = 5;

// ── Gesture simulation ────────────────────────────────────────────────────────
function simulateGestureDetection(letter, difficulty) {
  const base = difficulty === 'easy' ? 0.78 : difficulty === 'medium' ? 0.72 : 0.65;
  const r = Math.random();
  if (r < base)
    return { classification:'Perfect', response_time_ms:2000+Math.random()*2000, trajectory_smoothness:0.7+Math.random()*0.25, midline_crossing:Math.random()>0.5, head_hand_coupling:0.2+Math.random()*0.4, fatigue_indicator:0.1+Math.random()*0.3 };
  if (r < base+0.15)
    return { classification:'Failed',  response_time_ms:3000+Math.random()*3000, trajectory_smoothness:0.3+Math.random()*0.3, midline_crossing:Math.random()>0.7, head_hand_coupling:0.5+Math.random()*0.4, fatigue_indicator:0.4+Math.random()*0.4 };
  return   { classification:'Skipped', response_time_ms:5000+Math.random()*2000, trajectory_smoothness:0.4+Math.random()*0.2, midline_crossing:false, head_hand_coupling:0.3+Math.random()*0.3, fatigue_indicator:0.5+Math.random()*0.4 };
}

// ── Virtual Hand SVG ──────────────────────────────────────────────────────────
function VirtualHand({ isGrip }) {
  const col  = isGrip ? 'rgba(16,185,129,0.95)' : 'rgba(34,211,238,0.85)';
  const bord = isGrip ? '#10b981' : '#22d3ee';
  const glow = isGrip
    ? 'drop-shadow(0 0 18px rgba(16,185,129,0.9))'
    : 'drop-shadow(0 0 18px rgba(34,211,238,0.8))';
  return (
    <svg width="72" height="82" viewBox="0 0 64 74" style={{ filter: glow }}>
      {isGrip ? (
        <>
          <rect x="10" y="30" width="44" height="32" rx="11" fill={col} stroke={bord} strokeWidth="2"/>
          <rect x="10" y="20" width="11" height="18" rx="6"  fill={col} stroke={bord} strokeWidth="1.5"/>
          <rect x="23" y="14" width="11" height="20" rx="6"  fill={col} stroke={bord} strokeWidth="1.5"/>
          <rect x="36" y="17" width="11" height="17" rx="6"  fill={col} stroke={bord} strokeWidth="1.5"/>
          <rect x="49" y="23" width="9"  height="14" rx="5"  fill={col} stroke={bord} strokeWidth="1.5"/>
          <rect x="4"  y="36" width="9"  height="14" rx="5"  fill={col} stroke={bord} strokeWidth="1.5" transform="rotate(-20 4 36)"/>
        </>
      ) : (
        <>
          <rect x="14" y="38" width="37" height="29" rx="11" fill={col} stroke={bord} strokeWidth="2"/>
          <rect x="14" y="8"  width="10" height="32" rx="5"  fill={col} stroke={bord} strokeWidth="1.5"/>
          <rect x="26" y="2"  width="10" height="38" rx="5"  fill={col} stroke={bord} strokeWidth="1.5"/>
          <rect x="38" y="6"  width="10" height="34" rx="5"  fill={col} stroke={bord} strokeWidth="1.5"/>
          <rect x="50" y="14" width="9"  height="26" rx="4"  fill={col} stroke={bord} strokeWidth="1.5"/>
          <rect x="5"  y="37" width="11" height="19" rx="5"  fill={col} stroke={bord} strokeWidth="1.5" transform="rotate(-28 5 37)"/>
        </>
      )}
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GamePage() {
  const [searchParams] = useSearchParams();
  const difficulty     = searchParams.get('difficulty') || 'medium';
  const navigate       = useNavigate();
  const { user, logout }  = useAuthStore();
  const { activeSession, startSession, recordGesture, endSession } = useSessionStore();

  // DOM refs
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const timerRef  = useRef(null);
  const keyRefs   = useRef({});   // letter → DOM element
  const keyRects  = useRef({});   // letter → DOMRect (cached)
  const slotRefs  = useRef([]);   // slot index → DOM element
  const slotRects = useRef([]);   // slot index → DOMRect (cached)

  // Game state
  const [phase, setPhase]             = useState('warmup');
  const [currentWord, setCurrentWord] = useState('');
  // slots: array of { letter: string|null, correct: bool }
  const [slots, setSlots]             = useState([]);
  const [score, setScore]             = useState({ perfect:0, failed:0, total:0 });
  const [lastGesture, setLastGesture] = useState(null);
  const [processing, setProcessing]   = useState(false);
  const [warmupCount, setWarmupCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [showSuperAnim, setShowSuperAnim]   = useState(false);
  const [encouragementText, setEncouragementText] = useState('');
  const [learnerLevel, setLearnerLevel]     = useState(1);
  const [realtimeMetrics, setRealtimeMetrics] = useState({ avgResponseTime:0, accuracy:0, smoothness:0, fatigue:0 });
  const [hoveredKey, setHoveredKey]   = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // Hand cursor
  const [handPos, setHandPos]     = useState({ x:-300, y:-300 });
  const [isGrip, setIsGrip]       = useState(false);
  const [warmupFlash, setWarmupFlash] = useState(false);

  // Floating ghost letter (copy of grabbed key)
  // { letter: string } | null
  const [ghostLetter, setGhostLetter] = useState(null);

  // Stale-closure refs
  const slotsRef          = useRef([]);
  const currentWordRef    = useRef('');
  const isGripRef         = useRef(false);
  const lastGripTime      = useRef(0);
  const grabbedLetterRef  = useRef(null);  // letter being dragged
  const dragStartTime     = useRef(0);
  const pendingEndSession = useRef(false);
  const wordQueueRef      = useRef([]);
  const gestureLog        = useRef([]);

  // Hand tracking
  const { landmarks, isTracking, error: cameraError } = useHandTracking(videoRef, canvasRef, true);

  // ── Session init ──────────────────────────────────────────────────────────
  useEffect(() => {
    initSession();
    return () => clearInterval(timerRef.current);
  }, []);

  const initSession = async () => {
    try {
      const learnerId = user?.learner_id || 'learner-001';
      api.get(`/sessions/learner/${learnerId}?limit=500`)
        .then(r => setLearnerLevel(Math.max(1, Math.floor(r.data.length/2)+1)))
        .catch(()=>{});
      const res = await api.post('/sessions/start', { learner_id: learnerId, difficulty });
      startSession(res.data.session_id, learnerId, difficulty);
      pickNewWord();
      startCamera();
      startTimer();
    } catch {
      toast.error('Could not start session');
      navigate('/play');
    }
  };

  const startTimer  = () => { timerRef.current = setInterval(() => setSessionTime(t => t+1), 1000); };
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {}
  };

  // ── Pick new word ─────────────────────────────────────────────────────────
  const pickNewWord = useCallback(() => {
    if (wordQueueRef.current.length === 0)
      wordQueueRef.current = shuffle([...(WORD_PROMPTS[difficulty]||WORD_PROMPTS.medium)]);
    const word = wordQueueRef.current.pop();
    currentWordRef.current = word;
    const emptySlots = word.split('').map(() => ({ letter: null, correct: false }));
    slotsRef.current = emptySlots;
    setCurrentWord(word);
    setSlots(emptySlots);
    setGhostLetter(null);
    grabbedLetterRef.current = null;
  }, [difficulty]);

  // ── Cache hitboxes ────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      // Keys
      const kr = {};
      for (const [k, el] of Object.entries(keyRefs.current)) {
        if (el) kr[k] = el.getBoundingClientRect();
      }
      keyRects.current = kr;
      // Slots
      slotRects.current = slotRefs.current.filter(Boolean).map(el => el.getBoundingClientRect());
    };
    setTimeout(update, 400);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [phase, currentWord, slots, showSuperAnim]);

  // ── Hand tracking → cursor, hover, grip ──────────────────────────────────
  useEffect(() => {
    if (!isTracking || !landmarks) {
      setHandPos({ x:-300, y:-300 });
      setHoveredKey(null);
      setHoveredSlot(null);
      if (isGripRef.current) {
        isGripRef.current = false;
        setIsGrip(false);
        // Release any grabbed letter without dropping
        if (grabbedLetterRef.current) {
          grabbedLetterRef.current = null;
          setGhostLetter(null);
        }
      }
      return;
    }

    const palm = getPalmCenter(landmarks);
    if (!palm) return;

    const hx = (1 - palm.x) * window.innerWidth;
    const hy = palm.y * window.innerHeight;
    setHandPos({ x: hx, y: hy });

    // Detect hovered key
    let hKey = null;
    for (const [k, rect] of Object.entries(keyRects.current)) {
      if (hx >= rect.left-16 && hx <= rect.right+16 &&
          hy >= rect.top-16  && hy <= rect.bottom+16) {
        hKey = k; break;
      }
    }
    setHoveredKey(hKey);

    // Detect hovered slot
    let hSlot = null;
    for (let i = 0; i < slotRects.current.length; i++) {
      const rect = slotRects.current[i];
      if (!rect) continue;
      if (hx >= rect.left-20 && hx <= rect.right+20 &&
          hy >= rect.top-20  && hy <= rect.bottom+20) {
        hSlot = i; break;
      }
    }
    setHoveredSlot(hSlot);

    const gripping = isGripping(landmarks);

    // ── WARMUP ──
    if (phase === 'warmup') {
      if (gripping && !isGripRef.current) {
        isGripRef.current = true; setIsGrip(true);
        const now = performance.now();
        if (now - lastGripTime.current > 800) {
          lastGripTime.current = now;
          setWarmupFlash(true);
          setTimeout(() => setWarmupFlash(false), 500);
          setWarmupCount(c => {
            if (c+1 >= 3) { setPhase('playing'); toast.success('Ready! Grip a letter to drag it! ✊'); }
            return c+1;
          });
        }
      } else if (!gripping && isGripRef.current) {
        isGripRef.current = false; setIsGrip(false);
      }
      return;
    }

    if (phase !== 'playing' || showSuperAnim) return;

    // ── GRIP START → grab letter from keyboard ──
    if (gripping && !isGripRef.current) {
      isGripRef.current = true; setIsGrip(true);
      const now = performance.now();
      if (hKey && now - lastGripTime.current > 400) {
        lastGripTime.current = now;
        dragStartTime.current = now;
        grabbedLetterRef.current = hKey;
        setGhostLetter(hKey);
      }
    }

    // ── GRIP RELEASE → drop onto slot ──
    if (!gripping && isGripRef.current) {
      isGripRef.current = false; setIsGrip(false);

      if (grabbedLetterRef.current && hSlot !== null) {
        dropLetterOnSlot(grabbedLetterRef.current, hSlot);
      }

      grabbedLetterRef.current = null;
      setGhostLetter(null);
    }

  }, [landmarks, isTracking, phase, showSuperAnim]);

  // ── Drop letter onto a slot ───────────────────────────────────────────────
  const dropLetterOnSlot = useCallback((letter, slotIndex) => {
    const word = currentWordRef.current;
    const expectedLetter = word[slotIndex];
    const isCorrect = letter === expectedLetter;

    // Update slot (replace any existing letter)
    const newSlots = [...slotsRef.current];
    newSlots[slotIndex] = { letter, correct: isCorrect };
    slotsRef.current = newSlots;
    setSlots([...newSlots]);

    // Record gesture
    const gesture = {
      target_letter: letter,
      ...simulateGestureDetection(letter, difficulty),
      classification: isCorrect ? 'Perfect' : 'Failed',
    };
    recordGesture(gesture);
    gestureLog.current.push(gesture);
    setLastGesture({ letter, result: gesture.classification });

    setScore(s => ({
      perfect: s.perfect + (isCorrect ? 1 : 0),
      failed:  s.failed  + (!isCorrect ? 1 : 0),
      total:   s.total   + 1,
    }));

    const log = gestureLog.current;
    setRealtimeMetrics({
      avgResponseTime: log.reduce((a,g) => a+g.response_time_ms, 0) / log.length,
      accuracy:        log.filter(g => g.classification==='Perfect').length / log.length,
      smoothness:      log.reduce((a,g) => a+g.trajectory_smoothness, 0) / log.length,
      fatigue:         log[log.length-1]?.fatigue_indicator || 0,
    });

    // Check word complete
    const allFilled  = newSlots.every(s => s.letter !== null);
    const allCorrect = newSlots.every((s, i) => s.letter === word[i]);
    if (allFilled && allCorrect) {
      const text = ENCOURAGEMENTS[Math.floor(Math.random()*ENCOURAGEMENTS.length)];
      setEncouragementText(text);
      setShowSuperAnim(true);
      setTimeout(() => {
        setShowSuperAnim(false);
        setWordsCompleted(prev => {
          const next = prev + 1;
          if (next >= TARGET_WORDS) pendingEndSession.current = true;
          else pickNewWord();
          return next;
        });
      }, 3000);
    }
  }, [difficulty, pickNewWord, recordGesture]);

  // Mouse fallback: click on a key → place in the first wrong/empty slot
  const handleKeyClick = useCallback((letter) => {
    if (isTracking) return; // hand mode active, ignore mouse
    if (processing || showSuperAnim || phase !== 'playing') return;
    const word = currentWordRef.current;

    // Find first empty slot or first wrong slot
    const targetIdx = slotsRef.current.findIndex(s => s.letter === null)
      ?? slotsRef.current.findIndex(s => !s.correct);
    if (targetIdx === -1) return;
    dropLetterOnSlot(letter, targetIdx);
  }, [isTracking, processing, showSuperAnim, phase, dropLetterOnSlot]);

  // ── Pending end session ───────────────────────────────────────────────────
  useEffect(() => {
    if (pendingEndSession.current && !processing) {
      pendingEndSession.current = false;
      handleEndSession();
    }
  }, [wordsCompleted]);

  // ── End session ───────────────────────────────────────────────────────────
  const handleEndSession = async () => {
    if (processing) return;
    setProcessing(true); setPhase('ending');
    clearInterval(timerRef.current);
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t=>t.stop());
    try {
      const analysis = await endSession();
      if (analysis) {
        navigate(`/play/results/${analysis.session_id||activeSession?.id}`, { state: { analysis } });
      } else { toast.error('No analysis returned'); navigate('/play'); }
    } catch { toast.error('Error saving session'); navigate('/play'); }
  };

  const handleLogout = () => {
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t=>t.stop());
    clearInterval(timerRef.current);
    logout(); toast.success('Logged out'); navigate('/login');
  };

  const formatTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const accuracyPct = score.total > 0 ? Math.round((score.perfect/score.total)*100) : 0;

  // Next correct letter (first empty slot)
  const nextSlotIndex    = slots.findIndex(s => s.letter === null);
  const nextCorrectLetter = currentWord && nextSlotIndex !== -1 ? currentWord[nextSlotIndex] : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>

      {/* ── Super animation ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSuperAnim && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={styles.superOverlay}>
            <motion.div
              initial={{scale:0,rotate:-30}} animate={{scale:[0,1.2,1],rotate:0}}
              transition={{type:'spring',damping:10,stiffness:100}} style={styles.superContent}
            >
              <div style={{fontSize:'5rem',filter:'drop-shadow(0 0 30px rgba(255,215,0,0.8))'}}>✨ 🎉 ⭐</div>
              <div style={styles.superText}>{encouragementText}</div>
            </motion.div>
            {Array.from({length:20}).map((_,i)=>(
              <motion.div key={i}
                initial={{x:0,y:0,scale:0,opacity:1}}
                animate={{x:(Math.random()-.5)*800,y:(Math.random()-.5)*600,scale:Math.random()*2+.5,opacity:0,rotate:Math.random()*360}}
                transition={{duration:2.5,ease:'easeOut'}}
                style={{position:'absolute',fontSize:'2rem',zIndex:999}}
              >
                {['🌟','🎈','🎊','✨','🏆'][i%5]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating ghost letter (follows hand while gripping) ──────────── */}
      <AnimatePresence>
        {ghostLetter && (
          <motion.div
            key="ghost"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            style={{
              ...styles.ghostLetter,
              left: handPos.x,
              top:  handPos.y,
            }}
          >
            {ghostLetter}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Virtual hand cursor ──────────────────────────────────────────── */}
      {isTracking && (phase==='playing'||phase==='warmup') && !showSuperAnim && (
        <motion.div
          style={{ ...styles.virtualHand, left: handPos.x, top: handPos.y }}
          animate={{ scale: isGrip ? 0.88 : 1 }}
          transition={{ type:'spring', stiffness:320, damping:22 }}
        >
          <VirtualHand isGrip={isGrip} />
        </motion.div>
      )}

      {/* ── LEFT PANEL: camera + metrics ─────────────────────────────────── */}
      <div style={styles.leftPanel}>
        <div style={styles.cameraBox}>
          {cameraError ? (
            <div style={styles.cameraError}>
              <div style={{fontSize:'2rem',marginBottom:8}}>📷</div>
              <div style={{fontWeight:600,marginBottom:4}}>Camera unavailable</div>
              <div style={{fontSize:'0.8rem',color:'#9CA3AF'}}>Allow camera access for hand tracking.</div>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay muted playsInline style={styles.video}/>
              <canvas ref={canvasRef} style={styles.canvas}/>
              {isTracking && (
                <div style={styles.trackingBadge}>
                  <span style={styles.trackingDot}/> GPU Tracking
                </div>
              )}
              {isTracking && (
                <motion.div
                  style={styles.gripBadge}
                  animate={{ background: isGrip ? 'rgba(16,185,129,0.9)' : 'rgba(0,0,0,0.65)' }}
                >
                  {isGrip ? '✊ GRIPPING' : '🖐 OPEN'}
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Live metrics */}
        <div style={styles.metricsPanel}>
          <div style={{...styles.metricsPanelTitle, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            Live Metrics
            <div style={styles.levelBadgeMini}>Level {learnerLevel}</div>
          </div>
          <div style={styles.metricsGrid}>
            {[
              {label:'Accuracy',   value:`${accuracyPct}%`,                                      color:accuracyPct>75?'#10B981':'#F59E0B'},
              {label:'Avg Speed',  value:`${(realtimeMetrics.avgResponseTime/1000).toFixed(1)}s`,color:'#0D5E6B'},
              {label:'Smoothness', value:`${Math.round(realtimeMetrics.smoothness*100)}%`,       color:'#8B5CF6'},
              {label:'Time',       value:formatTime(sessionTime),                                color:'#E8841A'},
            ].map(m=>(
              <div key={m.label} style={styles.metricItem}>
                <div style={{...styles.metricValue,color:m.color}}>{m.value}</div>
                <div style={styles.metricLabel}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontSize:'0.72rem',color:'#9CA3AF'}}>Fatigue Indicator</span>
              <span style={{fontSize:'0.72rem',color:'#9CA3AF'}}>{Math.round(realtimeMetrics.fatigue*100)}%</span>
            </div>
            <div style={styles.fatigueBar}>
              <div style={{...styles.fatigueFill,width:`${realtimeMetrics.fatigue*100}%`,background:realtimeMetrics.fatigue>0.6?'#EF4444':realtimeMetrics.fatigue>0.35?'#F59E0B':'#10B981'}}/>
            </div>
          </div>
        </div>
      </div>

      {/* ── CENTER PANEL ─────────────────────────────────────────────────── */}
      <div style={styles.centerPanel}>
        <AnimatePresence mode="wait">

          {/* WARMUP */}
          {phase === 'warmup' && (
            <motion.div key="warmup" initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={styles.warmupBanner}>
              <div style={{fontSize:'2.5rem',marginBottom:8}}>✊</div>
              <div style={{fontWeight:700,fontSize:'1.1rem',marginBottom:6}}>Warm-up Mode</div>
              <div style={{fontSize:'0.9rem',color:'#C8E8ED',opacity:0.85}}>
                Close your fist {3-warmupCount} more time{3-warmupCount!==1?'s':''} to begin!
              </div>
              <AnimatePresence>
                {warmupFlash && (
                  <motion.div key="flash" initial={{scale:0,opacity:1}} animate={{scale:1.3,opacity:0}} transition={{duration:0.4}}
                    style={{position:'absolute',fontSize:'2.5rem'}}>✅</motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* PLAYING */}
          {phase === 'playing' && (
            <motion.div key="playing" initial={{opacity:0}} animate={{opacity:1}} style={{width:'100%',display:'flex',flexDirection:'column',alignItems:'center',gap:18}}>

              {/* Progress bar */}
              <div style={styles.progressionContainer}>
                <div style={styles.progressionText}>Words: {wordsCompleted} / {TARGET_WORDS}</div>
                <div style={styles.progressionBarBg}>
                  <div style={{...styles.progressionBarFill,width:`${(wordsCompleted/TARGET_WORDS)*100}%`}}/>
                </div>
              </div>

              {/* Word image + drop slots */}
              <div style={styles.wordCard}>
                <div style={{fontSize:'4rem',filter:'drop-shadow(0 10px 15px rgba(0,0,0,0.3))'}}>
                  {WORD_IMAGES[currentWord]||'❓'}
                </div>

                {/* Hint */}
                {nextCorrectLetter && (
                  <div style={styles.nextLetterHint}>
                    Drag the <span style={{color:'#10B981',fontWeight:800}}>{nextCorrectLetter}</span> key
                    <span style={{opacity:0.5,marginLeft:6,fontSize:'0.75rem'}}>(highlighted in green)</span>
                  </div>
                )}

                {/* Drop slots */}
                <div style={styles.slotsContainer}>
                  {currentWord.split('').map((char, i) => {
                    const slot    = slots[i] || { letter: null, correct: false };
                    const filled  = slot.letter !== null;
                    const correct = slot.correct;
                    const isHoverTarget = hoveredSlot === i && !!ghostLetter;
                    return (
                      <motion.div
                        key={`slot-${i}-${currentWord}`}
                        ref={el => slotRefs.current[i] = el}
                        animate={filled && !correct ? {x:[-3,3,-3,3,0]} : {}}
                        transition={{duration:0.3}}
                        style={{
                          ...styles.slot,
                          ...(filled && correct   ? styles.slotCorrect   : {}),
                          ...(filled && !correct  ? styles.slotWrong     : {}),
                          ...(!filled             ? styles.slotEmpty     : {}),
                          ...(isHoverTarget       ? styles.slotHoverTarget : {}),
                        }}
                      >
                        {filled ? slot.letter : (
                          <span style={{fontSize:'0.75rem',color:'rgba(34,211,238,0.35)',fontWeight:400}}>{i+1}</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* ── QWERTY keyboard — letters stay fixed ── */}
              <div style={styles.letterBoard}>
                {KEYBOARD_LAYOUT.map((row, ri) => (
                  <div key={ri} style={styles.letterRow}>
                    {row.map(letter => {
                      const isNextCorrect = letter === nextCorrectLetter;
                      const isHovered     = hoveredKey === letter;
                      const isBeingGripped = isGrip && hoveredKey === letter && ghostLetter === letter;
                      return (
                        <motion.button
                          key={letter}
                          ref={el => keyRefs.current[letter] = el}
                          onClick={() => handleKeyClick(letter)}
                          disabled={phase==='ending'||showSuperAnim}
                          whileTap={{scale:0.88}}
                          animate={{
                            scale: isBeingGripped ? 0.9 : 1,
                            boxShadow: isNextCorrect
                              ? '0 0 24px rgba(16,185,129,0.75), 0 0 8px rgba(16,185,129,0.4)'
                              : isHovered
                                ? '0 0 18px rgba(34,211,238,0.5)'
                                : '0 4px 12px rgba(0,0,0,0.15)',
                          }}
                          style={{
                            ...styles.letterKey,
                            ...(isHovered      ? styles.letterKeyHovered  : {}),
                            ...(isNextCorrect  ? styles.letterKeyCorrect  : {}),
                            ...(isBeingGripped ? styles.letterKeyGripping : {}),
                            opacity: (phase==='ending'||showSuperAnim) ? 0.5 : 1,
                          }}
                        >
                          {letter}
                          {/* Pulsing dot under next correct key */}
                          {isNextCorrect && (
                            <motion.div
                              style={styles.correctDot}
                              animate={{opacity:[0.5,1,0.5],scale:[0.8,1.1,0.8]}}
                              transition={{repeat:Infinity,duration:1.2}}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </div>

            </motion.div>
          )}

          {/* ENDING */}
          {phase === 'ending' && (
            <motion.div key="ending" initial={{opacity:0}} animate={{opacity:1}} style={styles.processingBanner}>
              <div className="spinner" style={{margin:'0 auto 12px'}}/>
              <div>Analysing your session…</div>
              <div style={{fontSize:'0.8rem',color:'#C8E8ED',marginTop:4}}>The AI is processing your motor patterns</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div style={styles.controls}>
          <button onClick={pickNewWord} style={styles.skipBtn}>Skip Word →</button>
          <button onClick={handleEndSession} disabled={processing} style={styles.endBtn}>
            {processing ? 'Processing…' : 'End Session'}
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <div style={styles.rightPanel}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
          <div style={styles.scoreTitle}>Session Score</div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out"><LogOut size={13}/></button>
        </div>

        {/* Accuracy ring */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
          <svg viewBox="0 0 120 120" style={{width:100,height:100}}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#C8E8ED" strokeWidth="8"/>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E8841A" strokeWidth="8"
              strokeDasharray={`${2*Math.PI*52}`}
              strokeDashoffset={`${2*Math.PI*52*(1-accuracyPct/100)}`}
              strokeLinecap="round" transform="rotate(-90 60 60)"
              style={{transition:'stroke-dashoffset 0.6s ease'}}
            />
            <text x="60" y="66" textAnchor="middle"
              style={{fontFamily:'Inter,sans-serif',fontWeight:800,fontSize:'1.4rem',fill:'#0D5E6B'}}>
              {accuracyPct}%
            </text>
          </svg>
          <div style={{fontSize:'0.75rem',color:'#6B7280'}}>Accuracy</div>
        </div>

        {/* Score breakdown */}
        <div style={{width:'100%',display:'flex',flexDirection:'column',gap:8,borderTop:'1px solid rgba(255,255,255,0.07)',paddingTop:16}}>
          {[
            {label:'Perfect ✅',count:score.perfect,color:'#10B981'},
            {label:'Failed ❌', count:score.failed, color:'#EF4444'},
            {label:'Total',     count:score.total,  color:'#0D5E6B'},
          ].map(s=>(
            <div key={s.label} style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}>
              <span style={{fontSize:'0.8rem',color:'#6B7280'}}>{s.label}</span>
              <span style={{fontFamily:'Inter,sans-serif',fontWeight:700,color:s.color}}>{s.count}</span>
            </div>
          ))}
        </div>

        {/* Interaction guide */}
        <div style={styles.interactionGuide}>
          <div style={{fontSize:'0.72rem',fontWeight:700,color:'#0D5E6B',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.1em'}}>Controls</div>
          {[
            {icon:'🖐', label:'Move over a key'},
            {icon:'✊', label:'Grip = grab letter copy'},
            {icon:'📦', label:'Drag to a slot'},
            {icon:'🖐', label:'Release = drop letter'},
            {icon:'🔄', label:'Drop on filled slot = replace'},
            {icon:'🟢', label:'Green = correct next letter'},
          ].map((g,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:'0.73rem',color:'#9CA3AF',padding:'3px 0'}}>
              <span style={{fontSize:'0.95rem'}}>{g.icon}</span>{g.label}
            </div>
          ))}
        </div>

        {/* Last gesture */}
        {lastGesture && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${lastGesture.letter}-${lastGesture.result}`}
              initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
              style={{...styles.gestureFeedback, background:lastGesture.result==='Perfect'?'#D1FAE5':'#FEE2E2'}}
            >
              <div style={{fontSize:'1.4rem'}}>{lastGesture.result==='Perfect'?'✅':'❌'}</div>
              <div style={{fontWeight:600,fontSize:'0.85rem',color:'#1F2937'}}>{lastGesture.letter} — {lastGesture.result}</div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  root: { display:'flex', height:'100vh', background:'#0F1E22', overflow:'hidden', position:'relative' },

  superOverlay: { position:'absolute',top:0,left:0,width:'100%',height:'100%',background:'rgba(15,30,34,0.82)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000 },
  superContent: { display:'flex',flexDirection:'column',alignItems:'center',gap:16,zIndex:2001 },
  superText: { fontFamily:'Inter,sans-serif',fontWeight:900,fontSize:'4rem',background:'linear-gradient(135deg,#FCD34D,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textTransform:'uppercase',letterSpacing:'0.05em',textAlign:'center' },

  // Ghost letter follows hand
  ghostLetter: {
    position: 'fixed',
    transform: 'translate(-50%, -50%)',
    zIndex: 10000,
    pointerEvents: 'none',
    width: 64, height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(34,211,238,0.25)',
    border: '2px solid #22d3ee',
    borderRadius: 14,
    fontSize: '1.8rem',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800,
    color: '#22d3ee',
    boxShadow: '0 0 30px rgba(34,211,238,0.6), 0 8px 24px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(6px)',
  },

  virtualHand: { position:'fixed', transform:'translate(-48px,-90px)', pointerEvents:'none', zIndex:9999, userSelect:'none' },

  // Left panel
  leftPanel: { width:260,display:'flex',flexDirection:'column',borderRight:'1px solid rgba(255,255,255,0.07)',zIndex:10 },
  cameraBox: { flex:1,background:'#0D1A1D',position:'relative',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center' },
  video:  { width:'100%',height:'100%',objectFit:'cover',transform:'scaleX(-1)' },
  canvas: { position:'absolute',top:0,left:0,width:'100%',height:'100%',transform:'scaleX(-1)' },
  cameraError: { padding:24,textAlign:'center',color:'#9CA3AF' },
  trackingBadge: { position:'absolute',bottom:38,left:10,display:'flex',alignItems:'center',gap:6,background:'rgba(0,0,0,0.6)',padding:'4px 10px',borderRadius:99,fontSize:'0.72rem',color:'#10B981' },
  trackingDot: { width:6,height:6,borderRadius:'50%',background:'#10B981',animation:'pulse 1.5s infinite' },
  gripBadge: { position:'absolute',bottom:10,left:10,padding:'4px 12px',borderRadius:99,fontSize:'0.75rem',color:'#fff',fontWeight:700,transition:'background 0.2s' },

  metricsPanel: { padding:'16px',background:'#0D1A1D',borderTop:'1px solid rgba(255,255,255,0.07)' },
  metricsPanelTitle: { fontSize:'0.9rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'#0D5E6B',marginBottom:16,paddingBottom:8,borderBottom:'1px solid rgba(13,94,107,0.1)' },
  levelBadgeMini: { background:'linear-gradient(135deg,#1A8FA0,#14B8A6)',color:'white',padding:'4px 10px',borderRadius:'12px',fontSize:'0.75rem',fontWeight:'800' },
  metricsGrid: { display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 },
  metricItem:  { textAlign:'center' },
  metricValue: { fontFamily:'Inter,sans-serif',fontWeight:800,fontSize:'1.2rem' },
  metricLabel: { fontSize:'0.68rem',color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'0.05em' },
  fatigueBar:  { height:6,background:'rgba(255,255,255,0.1)',borderRadius:3,overflow:'hidden' },
  fatigueFill: { height:'100%',borderRadius:3,transition:'width 0.4s ease,background 0.4s ease' },

  // Center panel
  centerPanel: { flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 14px',gap:18,zIndex:10 },

  warmupBanner: { position:'relative',background:'rgba(13,94,107,0.4)',border:'1px solid rgba(13,94,107,0.6)',borderRadius:20,padding:'32px 48px',color:'#C8E8ED',textAlign:'center',maxWidth:420 },

  progressionContainer: { width:'100%',maxWidth:560 },
  progressionText: { fontFamily:'Inter,sans-serif',fontSize:'0.85rem',color:'#C8E8ED',fontWeight:700,marginBottom:8,textAlign:'center',textTransform:'uppercase',letterSpacing:'0.08em' },
  progressionBarBg:   { height:10,background:'rgba(255,255,255,0.1)',borderRadius:5,overflow:'hidden' },
  progressionBarFill: { height:'100%',background:'linear-gradient(90deg,#E8841A,#F59E0B)',borderRadius:5,transition:'width 0.5s ease' },

  wordCard: { display:'flex',flexDirection:'column',alignItems:'center',gap:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:24,padding:'20px 44px',boxShadow:'0 12px 40px rgba(0,0,0,0.2)' },
  nextLetterHint: { fontSize:'0.82rem',color:'rgba(255,255,255,0.5)',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:20,padding:'5px 16px' },

  slotsContainer: { display:'flex',gap:12,marginTop:4 },
  slot: { width:60,height:72,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:14,fontSize:'2rem',fontFamily:'Inter,sans-serif',fontWeight:800,color:'#C8E8ED',transition:'all 0.2s ease' },
  slotEmpty:       { background:'rgba(34,211,238,0.04)',border:'2px dashed rgba(34,211,238,0.35)',boxShadow:'0 0 16px rgba(34,211,238,0.06)' },
  slotCorrect:     { background:'rgba(16,185,129,0.15)',border:'2px solid #10B981',color:'#10B981',boxShadow:'0 0 18px rgba(16,185,129,0.4)' },
  slotWrong:       { background:'rgba(239,68,68,0.12)',border:'2px solid #EF4444',color:'#EF4444' },
  slotHoverTarget: { background:'rgba(34,211,238,0.15)',border:'2px solid #22d3ee',boxShadow:'0 0 22px rgba(34,211,238,0.5)',transform:'scale(1.08)' },

  // QWERTY keyboard — larger keys, more spacing
  letterBoard: { display:'flex',flexDirection:'column',gap:13 },
  letterRow:   { display:'flex',gap:13,justifyContent:'center' },
  letterKey: {
    position: 'relative',
    width: 74, height: 74,
    background: 'rgba(255,255,255,0.07)',
    border: '2px solid rgba(255,255,255,0.15)',
    borderRadius: 14,
    color: '#C8E8ED',
    fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.75rem',
    cursor: 'pointer', transition: 'all 0.1s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    userSelect: 'none',
  },
  letterKeyHovered:  { background:'rgba(34,211,238,0.18)',border:'2px solid #22d3ee',transform:'scale(1.07)' },
  letterKeyCorrect:  { background:'rgba(16,185,129,0.25)',border:'2px solid #10B981',color:'#10B981',boxShadow:'0 0 24px rgba(16,185,129,0.55)',transform:'scale(1.09)' },
  letterKeyGripping: { background:'rgba(34,211,238,0.35)',border:'2px solid #22d3ee',transform:'scale(0.92)' },
  correctDot: { position:'absolute',bottom:5,left:'50%',transform:'translateX(-50%)',width:6,height:6,borderRadius:'50%',background:'#10B981' },

  processingBanner: { background:'rgba(13,94,107,0.4)',border:'1px solid rgba(13,94,107,0.6)',borderRadius:16,padding:'24px 40px',textAlign:'center',color:'#C8E8ED',fontWeight:600 },

  controls: { display:'flex',gap:12,marginTop:4 },
  skipBtn: { padding:'10px 20px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,color:'#9CA3AF',fontFamily:'Inter,sans-serif',fontWeight:500,fontSize:'0.875rem',cursor:'pointer' },
  endBtn:  { padding:'10px 24px',background:'#EF4444',border:'none',borderRadius:10,color:'#fff',fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:'0.9rem',cursor:'pointer' },

  // Right panel
  rightPanel: { width:220,background:'#0D1A1D',borderLeft:'1px solid rgba(255,255,255,0.07)',padding:'24px 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:16,zIndex:10 },
  scoreTitle: { fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:'0.8rem',color:'#C8E8ED',textTransform:'uppercase',letterSpacing:'0.08em' },
  logoutBtn:  { display:'flex',alignItems:'center',justifyContent:'center',padding:'5px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:7,color:'#6B7280',cursor:'pointer' },
  interactionGuide: { width:'100%',background:'rgba(13,94,107,0.15)',border:'1px solid rgba(13,94,107,0.25)',borderRadius:12,padding:'12px' },
  gestureFeedback:  { width:'100%',borderRadius:10,padding:'12px',display:'flex',flexDirection:'column',alignItems:'center',gap:4,marginTop:'auto' },
};
