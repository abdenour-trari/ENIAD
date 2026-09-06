import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

export default function Sidebar({ navItems, activeId, onNavClick }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <aside style={styles.sidebar} className="sidebar">
      {/* Decorative glow */}
      <div style={styles.glow} />

      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>N</div>
        <div>
          <div style={styles.logoName}>Nesture AI</div>
          <div style={styles.logoSub}>LetterQuest Platform</div>
        </div>
      </div>

      {/* User chip */}
      <div style={styles.userChip}>
        <div style={{
          ...styles.avatar,
          background: user?.role === 'parent' ? '#E8841A'
            : user?.role === 'ot' ? '#5B8DB8'
            : '#1A8FA0',
        }}>
          {user?.name?.[0] || '?'}
        </div>
        <div>
          <div style={styles.userName}>{user?.name}</div>
          <div style={styles.userRole}>
            {{ learner: 'Learner', parent: 'Parent', ot: 'OT / Educator' }[user?.role]}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          /* ── Tab mode (Parent / OT) ── */
          if (item.id && onNavClick) {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavClick(item.id)}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            );
          }

          /* ── Route mode (NavLink) ── */
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout} style={styles.logoutBtn}>
        <LogOut size={15} />
        Sign Out
      </button>
    </aside>
  );
}


const styles = {
  sidebar: {
    // Layout handled by .sidebar CSS class — these are supplementary overrides
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -80, left: -80,
    width: 240, height: 240,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,143,160,0.22) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '0 8px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: 16,
    position: 'relative',
  },
  logoIcon: {
    width: 36, height: 36,
    background: 'linear-gradient(135deg, #1A8FA0, #23BFDB)',
    borderRadius: 11,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800, fontSize: 18, color: '#fff',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(26,143,160,0.4)',
  },
  logoName: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800, fontSize: '0.92rem', color: '#fff',
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: '0.65rem', color: 'rgba(200,232,237,0.7)',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    marginTop: 2,
  },
  userChip: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 8px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    marginBottom: 12,
  },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800, fontSize: '0.9rem', color: '#fff',
    flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.15)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  userName: {
    fontSize: '0.82rem', fontWeight: 700, color: '#fff',
  },
  userRole: {
    fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase', letterSpacing: '0.07em',
    marginTop: 1,
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 16px',
    borderRadius: 12,
    fontSize: '0.9rem', fontWeight: 600,
    color: 'rgba(255,255,255,0.55)',
    textDecoration: 'none', cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid transparent',
    background: 'transparent',
    width: '100%',
    boxSizing: 'border-box',
  },
  navItemActive: {
    background: 'rgba(26,143,160,0.25)',
    color: '#7FDBEA',
    border: '1px solid rgba(26,143,160,0.35)',
  },
  navIcon: { fontSize: '1rem', width: 20, textAlign: 'center' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 18px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    color: 'rgba(255,255,255,0.65)',
    fontSize: '0.85rem', fontWeight: 600,
    cursor: 'pointer',
    marginTop: 'auto',
    width: '100%',
    justifyContent: 'center',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },
};

