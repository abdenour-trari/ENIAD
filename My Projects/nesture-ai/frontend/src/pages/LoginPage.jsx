import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';
import api from '../services/api';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const { login, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      redirectByRole(user?.role);
    }
    // Load demo accounts
    api.get('/users/demo-accounts').then(r => setDemoAccounts(r.data)).catch(() => {});
  }, [isAuthenticated, user]);

  const redirectByRole = (role) => {
    if (role === 'learner') navigate('/play');
    else if (role === 'parent') navigate('/parent');
    else if (role === 'ot') navigate('/ot');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.name}!`);
      redirectByRole(data.role);
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (account) => {
    setLoading(true);
    try {
      const data = await login(account.email, account.password);
      toast.success(`Logged in as ${data.name}`);
      redirectByRole(data.role);
    } catch {
      toast.error('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const roleColors = { learner: '#0D5E6B', parent: '#E8841A', ot: '#5B8DB8' };
  const roleLabels = { learner: 'Learner', parent: 'Parent', ot: 'OT / Educator' };
  const roleIcons  = { learner: '🎮', parent: '👨‍👩‍👧', ot: '🩺' };

  return (
    <div style={styles.root}>
      {/* Left panel */}
      <motion.div
        style={styles.left}
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div style={styles.logo}>
          <div style={styles.logoIcon}>N</div>
          <div>
            <div style={styles.logoName}>Nesture AI</div>
            <div style={styles.logoTagline}>LetterQuest Platform</div>
          </div>
        </div>

        <div style={styles.heroText}>
          <h1 style={styles.heroH1}>
            Transforming<br />
            <span style={{ color: '#E8841A' }}>Movement</span><br />
            into Communication
          </h1>
          <p style={styles.heroP}>
            An AI-powered gesture learning platform for neurodiverse learners.
            Track motor patterns, build communication skills, daily.
          </p>
        </div>

        <div style={styles.stats}>
          {[
            { label: 'More Affordable', value: '194×', sub: 'vs AAC devices' },
            { label: 'Reflex Patterns', value: '6',    sub: 'monitored live' },
            { label: 'Sessions Daily', value: '∞',     sub: 'no limits' },
          ].map((s) => (
            <div key={s.label} style={styles.statItem}>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statSub}>{s.sub}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right panel */}
      <motion.div
        style={styles.right}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Sign In</h2>
          <p style={styles.formSub}>Access your Nesture AI dashboard</p>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
            </div>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          {/* Demo quick-login */}
          {demoAccounts.length > 0 && (
            <div style={styles.demoSection}>
              <div style={styles.demoLabel}>— Demo Accounts —</div>
              <div style={styles.demoGrid}>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => quickLogin(acc)}
                    disabled={loading}
                    style={{
                      ...styles.demoBtn,
                      borderColor: roleColors[acc.role] + '55',
                      color: roleColors[acc.role],
                    }}
                  >
                    <span style={styles.demoBtnIcon}>{roleIcons[acc.role]}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{acc.name}</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>{roleLabels[acc.role]}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0F1E22',
  },
  left: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '48px 56px',
    background: 'linear-gradient(145deg, #0D5E6B 0%, #0F1E22 100%)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  logoIcon: {
    width: 44, height: 44,
    background: '#E8841A',
    borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800, fontSize: 22,
    color: '#fff',
  },
  logoName: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800, fontSize: '1.1rem',
    color: '#fff',
  },
  logoTagline: {
    fontSize: '0.72rem',
    color: '#C8E8ED',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  heroText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  heroH1: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 'clamp(2rem, 3.5vw, 3rem)',
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.1,
    marginBottom: 20,
  },
  heroP: {
    color: '#C8E8ED',
    fontSize: '1rem',
    lineHeight: 1.7,
    maxWidth: 400,
  },
  stats: {
    display: 'flex',
    gap: 24,
    borderTop: '1px solid rgba(200,232,237,0.2)',
    paddingTop: 32,
  },
  statItem: { flex: 1 },
  statValue: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '2rem', fontWeight: 800,
    color: '#E8841A',
  },
  statLabel: {
    fontSize: '0.8rem', fontWeight: 600,
    color: '#fff', marginTop: 2,
  },
  statSub: {
    fontSize: '0.72rem',
    color: '#C8E8ED',
  },
  right: {
    width: 460,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 32px',
    background: '#EEF6F8',
  },
  formCard: {
    width: '100%',
    maxWidth: 380,
  },
  formTitle: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '1.8rem', fontWeight: 800,
    color: '#0D5E6B',
    marginBottom: 6,
  },
  formSub: {
    fontSize: '0.875rem',
    color: '#6B7280',
    marginBottom: 28,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '11px 14px',
    borderRadius: 10,
    border: '1.5px solid #D1D5DB',
    fontSize: '0.9rem',
    background: '#fff',
    color: '#1F2937',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    marginTop: 8,
    padding: '13px',
    background: '#0D5E6B',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  demoSection: {
    marginTop: 28,
    paddingTop: 24,
    borderTop: '1px solid #E5E7EB',
  },
  demoLabel: {
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#9CA3AF',
    marginBottom: 14,
    letterSpacing: '0.06em',
  },
  demoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  demoBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    background: '#fff',
    border: '1.5px solid',
    borderRadius: 10,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  demoBtnIcon: {
    fontSize: '1.4rem',
  },
};
