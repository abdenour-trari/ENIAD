import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, ChevronRight, Download, Play, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/shared/Sidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';

const NAV = [
  { id: 'overview',  label: 'Learner Overview', icon: '👥', end: true },
  { id: 'analytics', label: 'Analytics',        icon: '📊' },
  { id: 'exercises', label: 'Exercises',        icon: '🏃' },
  { id: 'reports',   label: 'Reports',          icon: '📄' },
];

export default function OTDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [learners, setLearners] = useState([]);
  const [learnerStats, setLearnerStats] = useState({});
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLearners(); }, []);

  const fetchLearners = async () => {
    setLoading(true);
    try {
      const [learnersRes, exRes] = await Promise.all([
        api.get(`/learners/by-ot/${user.id}`),
        api.get('/exercises/'),
      ]);
      setLearners(learnersRes.data);
      setExercises(exRes.data);
      const stats = {};
      await Promise.all(learnersRes.data.map(async (l) => {
        try {
          const [sessRes, reflexRes] = await Promise.all([
            api.get(`/sessions/learner/${l.id}?limit=20`),
            api.get(`/reflexes/learner/${l.id}/summary`),
          ]);
          stats[l.id] = {
            latestSession: sessRes.data[0] || null,
            sessions: sessRes.data,
            reflexes: reflexRes.data,
            needsAttention: reflexRes.data.some(r =>
              r.confidence_level === 'High' && parseInt(r.score) < 40
            ),
          };
        } catch { stats[l.id] = { latestSession: null, sessions: [], reflexes: [], needsAttention: false }; }
      }));
      setLearnerStats(stats);
    } catch { toast.error('Could not load learner data'); }
    finally { setLoading(false); }
  };

  // Aggregate bar chart data
  const chartData = learners.map(l => {
    const s = learnerStats[l.id];
    const acc = s?.latestSession ? Math.round(parseFloat(s.latestSession.accuracy_score || 0) * 100) : 0;
    return { name: l.name.split(' ')[0], accuracy: acc, lpi: parseInt(s?.latestSession?.lpi_score || 0) };
  });

  const attentionCount = Object.values(learnerStats).filter(s => s.needsAttention).length;

  const renderComingSoon = (title) => (
    <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} style={styles.comingSoon}>
      <div style={styles.csIcon}>🚧</div>
      <h2 style={styles.csTitle}>{title}</h2>
      <p style={styles.csText}>We're working hard to bring this feature to you in the next update!</p>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar navItems={NAV} activeId={activeTab} onNavClick={setActiveTab} />
        <div className="main-content" style={{ display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Sidebar navItems={NAV} activeId={activeTab} onNavClick={setActiveTab} />
      <main className="main-content">
        <motion.div initial={{ opacity:0,y:-10 }} animate={{ opacity:1,y:0 }} style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>OT Dashboard</h1>
            <p style={styles.pageSub}>Monitoring {learners.length} learners · {new Date().toLocaleDateString()}</p>
          </div>
          {attentionCount > 0 && (
            <div style={styles.alertBanner}>
              <AlertTriangle size={16} color="#E8841A" />
              <span style={{ fontWeight: 600, color: '#92400E', fontSize: '0.875rem' }}>
                {attentionCount} learner{attentionCount > 1 ? 's' : ''} need attention
              </span>
            </div>
          )}
        </motion.div>

        {activeTab === 'analytics' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* KPI row for analytics */}
            <div style={styles.kpiRow}>
              {[
                { label: 'Active Learners', value: learners.length, color: '#0D5E6B' },
                { label: 'Need Attention',  value: attentionCount,  color: '#EF4444' },
                { label: 'Avg Accuracy',    color: '#E8841A', value: (() => {
                    const vals = Object.values(learnerStats).filter(s => s.latestSession);
                    if (!vals.length) return '—';
                    return Math.round(vals.reduce((a,s) => a + parseFloat(s.latestSession.accuracy_score||0)*100, 0) / vals.length) + '%';
                  })() },
                { label: 'Avg LPI', color: '#8B5CF6', value: (() => {
                    const vals = Object.values(learnerStats).filter(s => s.latestSession);
                    if (!vals.length) return '—';
                    return Math.round(vals.reduce((a,s) => a + parseInt(s.latestSession.lpi_score||0), 0) / vals.length);
                  })() },
              ].map((k) => (
                <div key={k.label} className="card" style={styles.kpiCard}>
                  <div style={{ ...styles.kpiVal, color: k.color }}>{k.value}</div>
                  <div style={styles.kpiLbl}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Bar chart + reflex flags */}
            <div style={styles.twoCol}>
              <div className="card" style={{ padding: 24 }}>
                <div className="section-header">
                  <span className="section-title">Accuracy by Learner</span>
                </div>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                    <Bar dataKey="accuracy" fill="#0D5E6B" radius={[6,6,0,0]} name="Accuracy %" />
                    <Bar dataKey="lpi" fill="#E8841A" radius={[6,6,0,0]} name="LPI" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <div className="section-header">
                  <span className="section-title">Reflex Flags</span>
                </div>
                {['Moro', 'ATNR', 'TLR'].map(rname => {
                  const flagged = Object.values(learnerStats).filter(s =>
                    s.reflexes?.some(r => r.reflex_name === rname && r.confidence_level === 'High')
                  ).length;
                  const pct = learners.length ? Math.round((flagged / learners.length) * 100) : 0;
                  return (
                    <div key={rname} style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{rname} Reflex</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: flagged > 0 ? '#EF4444' : '#10B981' }}>
                          {flagged}/{learners.length} learners
                        </span>
                      </div>
                      <div style={styles.flagBar}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{ ...styles.flagBarFill, background: flagged > 0 ? '#EF4444' : '#10B981' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Learner progress table */}
            <div className="card" style={{ marginTop: 20 }}>
              <div style={{ padding: '20px 24px 12px' }}>
                <span className="section-title">Learner Progress Summary</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Learner</th><th>Age</th><th>Last Accuracy</th>
                    <th>LPI</th><th>Response Time</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {learners.map(l => {
                    const s = learnerStats[l.id] || {};
                    const acc = s.latestSession ? Math.round(parseFloat(s.latestSession.accuracy_score||0)*100) : null;
                    const status = s.needsAttention ? 'attention' : (acc !== null && acc >= 70 ? 'on-track' : 'monitor');
                    return (
                      <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/ot/learner/${l.id}`)}>
                        <td style={{ fontWeight: 600 }}>{l.name}</td>
                        <td>{l.age}</td>
                        <td><span style={{ fontWeight: 700, color: acc >= 70 ? '#10B981' : '#F59E0B' }}>{acc !== null ? `${acc}%` : '—'}</span></td>
                        <td style={{ fontWeight: 600, color: '#0D5E6B' }}>{s.latestSession?.lpi_score || '—'}</td>
                        <td>{s.latestSession ? `${(parseFloat(s.latestSession.avg_response_time_ms||0)/1000).toFixed(1)}s` : '—'}</td>
                        <td><span className={`badge badge-${status==='attention'?'danger':status==='on-track'?'success':'warning'}`}>
                          {status==='attention'?'⚠ Attention':status==='on-track'?'✓ On Track':'Monitor'}
                        </span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : activeTab === 'exercises' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={styles.pageTitle}>Exercise Library</h2>
                <p style={styles.pageSub}>{exercises.length} exercises grouped by target reflex · Assign to any learner</p>
              </div>
            </div>

            {Object.entries(
              exercises.reduce((acc, ex) => {
                const key = ex.target_reflex || 'Other';
                if (!acc[key]) acc[key] = [];
                acc[key].push(ex);
                return acc;
              }, {})
            ).map(([reflex, exList]) => (
              <div key={reflex} className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, color: '#0D5E6B', fontSize: '1rem' }}>{reflex} Reflex</span>
                  <span className="badge badge-teal">{exList.length} exercises</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                  {exList.map((ex) => (
                    <div key={ex.id} style={{ background: '#F8FAFB', border: '1.5px solid #DDE8EB', borderRadius: 14, padding: '16px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, color: '#0D3D47', fontSize: '0.92rem' }}>{ex.name}</span>
                        <span className={`badge badge-${ex.difficulty_level === 'medium' ? 'warning' : 'success'}`}>{ex.difficulty_level}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.5, marginBottom: 12 }}>{ex.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600 }}>⏱ {ex.duration_minutes} min</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ padding: '5px 10px', background: '#EEF6F8', color: '#0D5E6B', border: '1px solid #B2DFE6', borderRadius: 7, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Play size={10} /> Watch
                          </button>
                          <select
                            defaultValue=""
                            onChange={async (e) => {
                              if (!e.target.value) return;
                              try {
                                await api.post('/exercises/prescribe', { learner_id: e.target.value, exercise_id: ex.id, notes: 'Assigned by OT' });
                                toast.success(`Assigned to learner!`);
                                e.target.value = '';
                              } catch { toast.error('Could not assign'); }
                            }}
                            style={{ padding: '5px 8px', borderRadius: 7, border: '1.5px solid #0D5E6B', fontSize: '0.72rem', fontWeight: 600, color: '#0D5E6B', background: '#fff', cursor: 'pointer' }}
                          >
                            <option value="">Assign to…</option>
                            {learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

        ) : activeTab === 'reports' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={styles.pageTitle}>Session Reports</h2>
              <p style={styles.pageSub}>Download PDF reports per learner session</p>
            </div>

            {learners.map((l) => {
              const s = learnerStats[l.id] || {};
              const sessions = s.sessions || [];
              return (
                <div key={l.id} className="card" style={{ marginBottom: 16 }}>
                  <div style={{ padding: '18px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#0D5E6B,#1A8FA0)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>{l.name[0]}</div>
                      <div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#0D3D47' }}>{l.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{sessions.length} sessions recorded</div>
                      </div>
                    </div>
                    {sessions.length > 0 && (
                      <button
                        onClick={async () => {
                          try {
                            const res = await api.get(`/reports/${sessions[0].id}/pdf`, { responseType: 'blob' });
                            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                            const a = document.createElement('a'); a.href = url;
                            a.download = `NestureAI_${l.name.replace(' ', '_')}_Latest.pdf`;
                            document.body.appendChild(a); a.click(); document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            toast.success('Downloaded!');
                          } catch { toast.error('Error generating report'); }
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        <Download size={13} /> Latest PDF
                      </button>
                    )}
                  </div>
                  {sessions.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr><th>#</th><th>Date</th><th>Duration</th><th>Accuracy</th><th>LPI</th><th>Report</th></tr>
                      </thead>
                      <tbody>
                        {sessions.map((sess, i) => (
                          <tr key={sess.id}>
                            <td style={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.78rem' }}>#{sessions.length - i}</td>
                            <td>{sess.start_time?.slice(0, 10)}</td>
                            <td>{Math.round(parseInt(sess.duration_seconds||0)/60)} min</td>
                            <td><span style={{ fontWeight: 700, color: parseFloat(sess.accuracy_score) > 0.7 ? '#10B981' : '#F59E0B' }}>{Math.round(parseFloat(sess.accuracy_score||0)*100)}%</span></td>
                            <td style={{ fontWeight: 700, color: '#0D5E6B' }}>{sess.lpi_score}</td>
                            <td>
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await api.get(`/reports/${sess.id}/pdf`, { responseType: 'blob' });
                                    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                    const a = document.createElement('a'); a.href = url;
                                    a.download = `NestureAI_${l.name.replace(' ', '_')}_${sess.start_time?.slice(0,10)}.pdf`;
                                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                    toast.success('Downloaded!');
                                  } catch { toast.error('Error'); }
                                }}
                                style={{ background: '#EEF6F8', color: '#0D5E6B', border: '1px solid #B2DFE6', borderRadius: 7, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                              >⬇ PDF</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '20px 24px', color: '#9CA3AF', fontSize: '0.85rem' }}>No sessions yet for this learner.</div>
                  )}
                </div>
              );
            })}
          </motion.div>

        ) : (
          <>
            {/* Summary KPIs */}
        <div style={styles.kpiRow}>
          {[
            { label: 'Active Learners',   value: learners.length,  color: '#0D5E6B' },
            { label: 'Need Attention',    value: attentionCount,   color: '#EF4444' },
            { label: 'Avg LPI This Week', value: Math.round(
              Object.values(learnerStats).reduce((a,s) =>
                a + parseInt(s.latestSession?.lpi_score || 0), 0
              ) / (learners.length || 1)
            ), color: '#E8841A' },
            { label: 'Total Sessions',    value: Object.values(learnerStats).reduce((a,s) =>
              a + (s.latestSession ? 1 : 0), 0),
              color: '#10B981' },
          ].map((k) => (
            <div key={k.label} className="card" style={styles.kpiCard}>
              <div style={{ ...styles.kpiVal, color: k.color }}>{k.value}</div>
              <div style={styles.kpiLbl}>{k.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.twoCol}>
          {/* Learner list */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 12px' }}>
              <span className="section-title">Learner Status</span>
            </div>
            {learners.map((l) => {
              const s = learnerStats[l.id] || {};
              const acc = s.latestSession
                ? Math.round(parseFloat(s.latestSession.accuracy_score || 0) * 100) : null;
              const status = s.needsAttention ? 'attention' : (acc !== null && acc >= 70 ? 'on-track' : 'monitor');
              return (
                <motion.div
                  key={l.id}
                  onClick={() => navigate(`/ot/learner/${l.id}`)}
                  whileHover={{ background: '#F9FAFB' }}
                  style={styles.learnerRow}
                >
                  <div style={{ ...styles.learnerAvatar, background: l.avatar_color || '#0D5E6B' }}>
                    {l.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.learnerName}>{l.name}</div>
                    <div style={styles.learnerInfo}>Age {l.age} · {l.diagnosis.split(',')[0]}</div>
                  </div>
                  <div style={styles.learnerMeta}>
                    {acc !== null && (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1rem',
                        color: acc >= 70 ? '#10B981' : '#F59E0B' }}>
                        {acc}%
                      </span>
                    )}
                    <span className={`badge badge-${status === 'attention' ? 'danger' : status === 'on-track' ? 'success' : 'warning'}`}>
                      {status === 'attention' ? '⚠ Attention' : status === 'on-track' ? '✓ On Track' : 'Monitor'}
                    </span>
                  </div>
                  <ChevronRight size={16} color="#9CA3AF" />
                </motion.div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="card" style={{ padding: 24 }}>
            <div className="section-header">
              <span className="section-title">Accuracy Comparison</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                <Bar dataKey="accuracy" fill="#0D5E6B" radius={[4,4,0,0]} name="Accuracy %" />
                <Bar dataKey="lpi" fill="#E8841A" radius={[4,4,0,0]} name="LPI" />
              </BarChart>
            </ResponsiveContainer>

            {/* Reflex legend */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
              <div style={styles.reflexSummaryTitle}>High-Priority Flags Across All Learners</div>
              {['Moro', 'ATNR', 'TLR'].map(rname => {
                const flagged = Object.values(learnerStats).filter(s =>
                  s.reflexes?.some(r => r.reflex_name === rname && r.confidence_level === 'High')
                ).length;
                return (
                  <div key={rname} style={styles.reflexFlag}>
                    <span style={styles.reflexFlagName}>{rname}</span>
                    <div style={styles.flagBar}>
                      <div style={{
                        ...styles.flagBarFill,
                        width: `${(flagged / learners.length) * 100}%`,
                        background: flagged > 0 ? '#EF4444' : '#10B981',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280', minWidth: 30 }}>
                      {flagged}/{learners.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Attention alerts */}
        {learners.filter(l => learnerStats[l.id]?.needsAttention).map(l => {
          const s = learnerStats[l.id];
          const highFlags = s.reflexes.filter(r => r.confidence_level === 'High' && parseInt(r.score) < 40);
          return (
            <motion.div key={l.id}
              initial={{ opacity:0,x:-12 }} animate={{ opacity:1,x:0 }}
              className="card" style={styles.alertCard}
            >
              <AlertTriangle size={20} color="#E8841A" style={{ flexShrink:0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, color: '#1F2937' }}>{l.name}</span>
                {' '}needs attention: {' '}
                <span style={{ color: '#92400E', fontWeight: 600 }}>
                  {highFlags.map(r => r.reflex_name).join(', ')} reflex{highFlags.length > 1 ? 'es' : ''} flagged High confidence
                </span>
              </div>
              <button
                onClick={() => navigate(`/ot/learner/${l.id}`)}
                style={styles.viewBtn}
              >
                View Detail →
              </button>
            </motion.div>
          );
        })}
        </>
        )}
      </main>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28,
  },
  pageTitle: { fontFamily: 'Inter, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#0D5E6B' },
  pageSub: { fontSize: '0.875rem', color: '#9CA3AF', marginTop: 4 },
  alertBanner: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px', background: '#FEF3E2',
    borderRadius: 10, border: '1px solid #FCD34D',
  },
  comingSoon: {
    background: '#fff', borderRadius: 24, padding: 60,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', marginTop: 20, border: '1px solid #F3F4F6'
  },
  csIcon: { fontSize: '4rem', marginBottom: 16 },
  csTitle: { fontFamily: 'Inter, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#0D5E6B', marginBottom: 8 },
  csText: { color: '#6B7280', fontSize: '1rem', maxWidth: 400 },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 },
  kpiCard: { padding: '20px 18px' },
  kpiVal: { fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '2rem' },
  kpiLbl: { fontSize: '0.78rem', color: '#6B7280', marginTop: 2, fontWeight: 500 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  learnerRow: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 24px', cursor: 'pointer',
    borderBottom: '1px solid #F3F4F6', transition: 'background 0.12s',
  },
  learnerAvatar: {
    width: 40, height: 40, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#fff',
    flexShrink: 0,
  },
  learnerName: { fontWeight: 600, fontSize: '0.9rem', color: '#1F2937' },
  learnerInfo: { fontSize: '0.75rem', color: '#9CA3AF', marginTop: 1 },
  learnerMeta: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  reflexSummaryTitle: {
    fontSize: '0.75rem', fontWeight: 600, color: '#374151',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10,
  },
  reflexFlag: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  reflexFlagName: { fontSize: '0.8rem', color: '#6B7280', width: 90, flexShrink: 0 },
  flagBar: { flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  flagBarFill: { height: '100%', borderRadius: 3, transition: 'width 0.4s ease' },
  alertCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '16px 20px',
    border: '1px solid #FCD34D',
    background: '#FFFBEB',
    marginTop: 12,
  },
  viewBtn: {
    padding: '7px 16px', background: '#0D5E6B', color: '#fff',
    border: 'none', borderRadius: 8,
    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};
