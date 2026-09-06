import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Trophy, Clock, LogOut, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function DifficultySelection() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('medium');

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const LEVELS = [
    { key: 'easy',   label: 'Easy',   desc: '3-letter words · Larger targets',  emoji: '🌱', color: '#10B981' },
    { key: 'medium', label: 'Medium', desc: '5-letter words · Normal targets',  emoji: '⚡', color: '#E8841A' },
    { key: 'hard',   label: 'Hard',   desc: 'Full words · Smaller targets',     emoji: '🔥', color: '#EF4444' },
  ];

  return (
    <div style={styles.root}>
      {/* Background decoration */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      {/* Logout button top-right */}
      <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out">
        <LogOut size={16} />
        Sign Out
      </button>

      {/* Back button top-left */}
      <button onClick={() => navigate('/play')} style={styles.backBtn} title="Back to Games">
        <ArrowLeft size={16} />
        Back
      </button>

      <motion.div style={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={styles.greeting}>
          <div style={styles.avatar}>{user?.name?.[0] || 'M'}</div>
          <div>
            <div style={styles.hi}>LetterQuest Options ✨</div>
            <div style={styles.subtitle}>Ready for today's LetterQuest session?</div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={styles.statsRow}>
          {[
            { icon: <Trophy size={16} />, value: '84%', label: 'Best accuracy' },
            { icon: <Star size={16} />,   value: '10',  label: 'Sessions done' },
            { icon: <Clock size={16} />,  value: '15m', label: 'Avg duration' },
          ].map((s) => (
            <div key={s.label} style={styles.statChip}>
              <span style={styles.statIcon}>{s.icon}</span>
              <div>
                <div style={styles.statVal}>{s.value}</div>
                <div style={styles.statLbl}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Difficulty picker */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Choose your level</div>
          <div style={styles.levelGrid}>
            {LEVELS.map((lvl) => (
              <button
                key={lvl.key}
                onClick={() => setDifficulty(lvl.key)}
                style={{
                  ...styles.levelBtn,
                  ...(difficulty === lvl.key ? { ...styles.levelBtnActive, borderColor: lvl.color } : {}),
                }}
              >
                <div style={styles.levelEmoji}>{lvl.emoji}</div>
                <div style={{ ...styles.levelLabel, color: difficulty === lvl.key ? lvl.color : '#1F2937' }}>
                  {lvl.label}
                </div>
                <div style={styles.levelDesc}>{lvl.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <motion.button
          onClick={() => navigate(`/play/game?difficulty=${difficulty}`)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={styles.startBtn}
        >
          <Play size={20} fill="white" />
          Start Session
        </motion.button>

        <p style={styles.tip}>
          💡 Tip: Find a comfortable position before you start. Take your time!
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    background: '#EEF6F8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  logoutBtn: {
    position: 'absolute', top: 20, right: 24,
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px',
    background: 'rgba(107,114,128,0.1)',
    border: '1px solid rgba(107,114,128,0.2)',
    borderRadius: 10,
    color: '#6B7280',
    fontSize: '0.82rem', fontWeight: 500,
    cursor: 'pointer',
    zIndex: 10,
    transition: 'all 0.15s',
  },
  backBtn: {
    position: 'absolute', top: 20, left: 24,
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px',
    background: 'rgba(107,114,128,0.1)',
    border: '1px solid rgba(107,114,128,0.2)',
    borderRadius: 10,
    color: '#6B7280',
    fontSize: '0.82rem', fontWeight: 500,
    cursor: 'pointer',
    zIndex: 10,
    transition: 'all 0.15s',
  },
  bgCircle1: {
    position: 'absolute', width: 500, height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(13,94,107,0.08) 0%, transparent 70%)',
    top: -100, left: -100,
  },
  bgCircle2: {
    position: 'absolute', width: 400, height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(232,132,26,0.07) 0%, transparent 70%)',
    bottom: -80, right: -80,
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: '40px 36px',
    maxWidth: 520, width: '100%',
    boxShadow: '0 12px 48px rgba(13,94,107,0.14)',
    position: 'relative', zIndex: 1,
  },
  greeting: {
    display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
  },
  avatar: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'linear-gradient(135deg, #0D5E6B, #1A8FA0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800, fontSize: '1.5rem', color: '#fff',
    flexShrink: 0,
  },
  hi: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800, fontSize: '1.5rem', color: '#0D5E6B',
  },
  subtitle: {
    fontSize: '0.9rem', color: '#6B7280', marginTop: 2,
  },
  statsRow: {
    display: 'flex', gap: 12, marginBottom: 28,
  },
  statChip: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 8,
    background: '#EEF6F8', borderRadius: 12, padding: '12px',
  },
  statIcon: { color: '#0D5E6B' },
  statVal: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700, fontSize: '1rem', color: '#0D5E6B',
  },
  statLbl: { fontSize: '0.7rem', color: '#9CA3AF' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700, fontSize: '0.9rem', color: '#374151',
    marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  levelGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  levelBtn: {
    padding: '14px 10px',
    background: '#F9FAFB',
    border: '2px solid #E5E7EB',
    borderRadius: 12,
    cursor: 'pointer', textAlign: 'center',
    transition: 'all 0.15s',
  },
  levelBtnActive: {
    background: '#EEF6F8',
    borderWidth: 2,
  },
  levelEmoji: { fontSize: '1.6rem', marginBottom: 4 },
  levelLabel: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700, fontSize: '0.9rem',
  },
  levelDesc: { fontSize: '0.68rem', color: '#9CA3AF', marginTop: 3 },
  startBtn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(135deg, #0D5E6B 0%, #1A8FA0 100%)',
    border: 'none', borderRadius: 14,
    color: '#fff',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800, fontSize: '1.05rem',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    boxShadow: '0 6px 20px rgba(13,94,107,0.3)',
    marginBottom: 16,
  },
  tip: {
    textAlign: 'center',
    fontSize: '0.82rem', color: '#9CA3AF',
  },
};
