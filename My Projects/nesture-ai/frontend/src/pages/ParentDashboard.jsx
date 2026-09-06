import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { Download, Mail, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Sidebar from '../components/shared/Sidebar';
import ReflexScoreCard from '../components/shared/ReflexScoreCard';
import api from '../services/api';
import { useAuthStore } from '../store';

const NAV = [
  { id: 'overview',  label: 'Overview',   icon: '🏠', end: true },
  { id: 'progress',  label: 'Progress',   icon: '📈' },
  { id: 'exercises', label: 'Exercises',  icon: '🏃' },
  { id: 'reports',   label: 'Reports',    icon: '📄' },
];

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab]   = useState('overview');
  const [sessions, setSessions]     = useState([]);
  const [reflexes, setReflexes]     = useState([]);
  const [exercises, setExercises]   = useState([]);
  const [analysis, setAnalysis]     = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]       = useState(true);

  const [activeChildId, setActiveChildId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const learnersRes = await api.get(`/learners/by-parent/${user.id}`);
      const children = learnersRes.data;
      if (children.length === 0) { setLoading(false); return; }
      const childId = children[0].id;
      setActiveChildId(childId);

      const [sessRes, reflexRes, exRes, prescRes] = await Promise.all([
        api.get(`/sessions/learner/${childId}?limit=50`),
        api.get(`/reflexes/learner/${childId}/summary`),
        api.get('/exercises/'),
        api.get(`/exercises/prescriptions/${childId}`),
      ]);
      setSessions(sessRes.data);
      setReflexes(reflexRes.data);
      setExercises(exRes.data);
      setPrescriptions(prescRes.data);

      // Get analysis of most recent session
      if (sessRes.data.length > 0) {
        const aRes = await api.get(`/sessions/${sessRes.data[0].id}/analysis`);
        setAnalysis(aRes.data);
      }
    } catch (e) {
      toast.error('Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!sessions[0]) return;
    try {
      const res = await api.get(`/reports/${sessions[0].id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'NestureAI_Report.pdf'; 
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch { toast.error('Error downloading report'); }
  };

  const emailReport = () => {
    toast.success('Report sent! (Email simulation)', { icon: '📧' });
  };

  // Build chart data from sessions
  const chartData = [...sessions].reverse().map((s, i) => ({
    session: `S${i + 1}`,
    accuracy: Math.round(parseFloat(s.accuracy_score || 0) * 100),
    responseTime: Math.round(parseFloat(s.avg_response_time_ms || 0) / 100) / 10,
    lpi: parseInt(s.lpi_score || 0),
  }));

  const latestSession = sessions[0];
  const latestAcc = latestSession ? Math.round(parseFloat(latestSession.accuracy_score || 0) * 100) : 0;
  const prevAcc   = sessions[1]   ? Math.round(parseFloat(sessions[1].accuracy_score || 0) * 100) : 0;
  const accChange = latestAcc - prevAcc;

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
        {/* Header */}
        <motion.div initial={{ opacity:0,y:-12 }} animate={{ opacity:1,y:0 }} style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Parent Dashboard</h1>
            <p style={styles.pageSubtitle}>Welcome back, {user?.name} · {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
          </div>
          <div style={styles.headerActions}>
            <button onClick={downloadReport} className="btn btn-secondary btn-sm">
              <Download size={14} /> Download Report
            </button>
            <button onClick={emailReport} className="btn btn-primary btn-sm">
              <Mail size={14} /> Email to OT
            </button>
          </div>
        </motion.div>

        {activeTab === 'progress' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* KPI row */}
            <div style={styles.kpiRow}>
              {[
                { label: 'Total Sessions', value: sessions.length, change: 'All time', up: true, color: '#0D5E6B' },
                { label: 'Latest Accuracy', value: `${latestAcc}%`,
                  change: accChange >= 0 ? `+${accChange}% vs prev` : `${accChange}% vs prev`,
                  up: accChange >= 0, color: '#E8841A' },
                { label: 'LPI Score', value: latestSession?.lpi_score || '—', change: 'Learner Progress Index', up: true, color: '#8B5CF6' },
                { label: 'Avg Accuracy', value: sessions.length > 0
                  ? `${Math.round(sessions.reduce((a,s) => a + parseFloat(s.accuracy_score||0)*100, 0) / sessions.length)}%`
                  : '—', change: 'Across all sessions', up: true, color: '#10B981' },
              ].map((k) => (
                <motion.div key={k.label} className="card" style={styles.kpiCard}
                  whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
                  <div style={{ ...styles.kpiValue, color: k.color }}>{k.value}</div>
                  <div style={styles.kpiLabel}>{k.label}</div>
                  <div style={{ ...styles.kpiChange, color: k.up ? '#10B981' : '#EF4444' }}>{k.change}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts row */}
            <div style={styles.twoCol}>
              {/* Accuracy + LPI over time */}
              <div className="card" style={styles.chartCard}>
                <div className="section-header">
                  <span className="section-title">Accuracy & LPI Over Time</span>
                  <span className="badge badge-teal">{sessions.length} sessions</span>
                </div>
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={chartData} margin={{ top: 5, right: 16, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="session" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
                    <Line type="monotone" dataKey="accuracy" stroke="#0D5E6B" strokeWidth={2.5}
                      dot={{ r: 4, fill: '#0D5E6B' }} activeDot={{ r: 6 }} name="Accuracy %" />
                    <Line type="monotone" dataKey="lpi" stroke="#E8841A" strokeWidth={2}
                      dot={{ r: 3, fill: '#E8841A' }} strokeDasharray="4 2" name="LPI" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Difficulty breakdown */}
              <div className="card" style={styles.chartCard}>
                <div className="section-header">
                  <span className="section-title">Difficulty Breakdown</span>
                </div>
                {(() => {
                  const counts = { easy: 0, medium: 0, hard: 0 };
                  sessions.forEach(s => { if (counts[s.difficulty] !== undefined) counts[s.difficulty]++; });
                  const total = sessions.length || 1;
                  return (
                    <div style={{ paddingTop: 10 }}>
                      {[
                        { key: 'easy',   label: 'Easy',   color: '#10B981', bg: '#D1FAE5' },
                        { key: 'medium', label: 'Medium', color: '#F59E0B', bg: '#FEF9C3' },
                        { key: 'hard',   label: 'Hard',   color: '#EF4444', bg: '#FEE2E2' },
                      ].map(d => (
                        <div key={d.key} style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{d.label}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: d.color }}>{counts[d.key]} sessions ({Math.round(counts[d.key]/total*100)}%)</span>
                          </div>
                          <div style={{ height: 10, background: '#F3F4F6', borderRadius: 5, overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round(counts[d.key]/total*100)}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              style={{ height: '100%', background: d.color, borderRadius: 5 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Full session history */}
            <div className="card" style={{ marginTop: 20 }}>
              <div style={{ padding: '20px 24px 12px' }}>
                <span className="section-title">Full Session History</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Duration</th><th>Accuracy</th>
                    <th>Difficulty</th><th>LPI</th><th>Words</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td>{s.start_time?.slice(0, 10)}</td>
                      <td>{Math.round(parseInt(s.duration_seconds||0)/60)} min</td>
                      <td><span style={{ fontWeight: 600, color: parseFloat(s.accuracy_score)>0.7?'#10B981':'#F59E0B' }}>
                        {Math.round(parseFloat(s.accuracy_score||0)*100)}%
                      </span></td>
                      <td><span className={`badge badge-${s.difficulty==='hard'?'danger':s.difficulty==='medium'?'warning':'success'}`}>{s.difficulty}</span></td>
                      <td style={{ fontWeight: 600, color: '#0D5E6B' }}>{s.lpi_score}</td>
                      <td>{parseInt(s.perfect_grabs,10)||0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : activeTab === 'exercises' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={styles.pageTitle}>Home Exercise Programme</h2>
              <p style={styles.pageSubtitle}>AI-recommended activities based on the latest session reflex analysis</p>
            </div>

            {/* ── Prescribed by OT ── */}
            {prescriptions.length > 0 && (
              <div className="card" style={{ padding: 24, marginBottom: 20, border: '2px solid #1A8FA0', background: 'linear-gradient(135deg,#F0FAFB,#E0F4F7)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <span style={{ fontSize: '1.4rem' }}>👩‍⚕️</span>
                  <h3 style={{ fontFamily: 'Inter, sans-serif', color: '#0D5E6B', fontSize: '1rem', fontWeight: 800 }}>
                    Prescribed by Your OT
                  </h3>
                  <span className="badge badge-teal">{prescriptions.length} assigned</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {prescriptions
                    .filter((p, idx, arr) => arr.findIndex(x => x.exercise_id === p.exercise_id) === idx)
                    .map((pres, i) => {
                    const ex = pres.exercise || exercises.find(e => e.id === pres.exercise_id);
                    if (!ex) return null;
                    return (
                      <motion.div key={pres.id || i} whileHover={{ y: -3 }} style={{ ...styles.exCard, border: '1.5px solid #1A8FA0', background: '#fff' }}>
                        <div style={styles.exCardTop}>
                          <div style={{ ...styles.exNum, background: '#1A8FA0' }}>{String(i + 1).padStart(2, '0')}</div>
                          <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600 }}>{ex.duration_minutes} min</span>
                        </div>
                        <div style={styles.exName}>{ex.name}</div>
                        <div style={styles.exDesc}>{ex.description}</div>
                        {pres.notes && (
                          <div style={{ fontSize: '0.72rem', color: '#0D5E6B', fontStyle: 'italic', marginTop: 6, padding: '6px 10px', background: '#EEF6F8', borderRadius: 8 }}>
                            💬 {pres.notes}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 12 }}>
                          <span className="badge badge-teal">{ex.target_reflex}</span>
                          <button style={styles.watchBtn}>
                            <Play size={12} /> Watch Video
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── AI-recommended exercise groups ── */}
            {(() => {
              const reflexNames = analysis?.recommendations?.map(r => r.target_reflex).filter(Boolean) || [];
              const uniqueReflexes = [...new Set(reflexNames)];
              if (uniqueReflexes.length === 0) {
                return (
                  <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
                    <h3 style={{ color: '#0D5E6B', fontFamily: 'Inter, sans-serif' }}>No specific exercises needed right now!</h3>
                    <p style={{ color: '#6B7280', marginTop: 8 }}>Your child's session data shows good reflex integration. Keep playing!</p>
                  </div>
                );
              }
              return uniqueReflexes.map(reflexName => {
                const recs = analysis.recommendations.filter(r => r.target_reflex === reflexName);
                const reflex = reflexes.find(r => r.reflex_name === reflexName);
                const confColor = reflex?.confidence_level === 'High' ? '#EF4444' : reflex?.confidence_level === 'Medium' ? '#F59E0B' : '#10B981';
                return (
                  <div key={reflexName} className="card" style={{ padding: 24, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: confColor, flexShrink: 0 }} />
                      <h3 style={{ fontFamily: 'Inter, sans-serif', color: '#0D5E6B', fontSize: '1rem' }}>
                        {reflexName} Reflex Integration
                      </h3>
                      <span className={`badge badge-${reflex?.confidence_level === 'High' ? 'danger' : reflex?.confidence_level === 'Medium' ? 'warning' : 'success'}`}>
                        {reflex?.confidence_level || 'Low'} Priority
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                      {recs.map((rec, i) => {
                        const ex = exercises.find(e => e.id === rec.exercise_id);
                        if (!ex) return null;
                        return (
                          <motion.div key={i} whileHover={{ y: -3 }} style={styles.exCard}>
                            <div style={styles.exCardTop}>
                              <div style={{ ...styles.exNum, background: confColor }}>{'0' + (i + 1)}</div>
                              <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600 }}>{ex.duration_minutes} min</span>
                            </div>
                            <div style={styles.exName}>{ex.name}</div>
                            <div style={styles.exDesc}>{ex.description}</div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 12 }}>
                              <span className={`badge badge-${ex.difficulty_level === 'medium' ? 'warning' : 'success'}`}>{ex.difficulty_level}</span>
                              <button style={styles.watchBtn}>
                                <Play size={12} /> Watch Video
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}

            {/* Full exercise library */}
            <div className="card" style={{ padding: 24, marginTop: 8 }}>
              <div className="section-header" style={{ marginBottom: 16 }}>
                <span className="section-title">All Available Exercises</span>
                <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{exercises.length} exercises in library</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {exercises.map((ex) => (
                  <div key={ex.id} style={styles.exLibCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1F2937' }}>{ex.name}</span>
                      <span className="badge badge-teal" style={{ flexShrink: 0, marginLeft: 8 }}>{ex.target_reflex}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.5, marginBottom: 8 }}>{ex.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>⏱ {ex.duration_minutes} min</span>
                      <button style={{ ...styles.watchBtn, padding: '4px 10px', fontSize: '0.72rem' }}>
                        <Play size={10} /> Watch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        ) : activeTab === 'reports' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={styles.pageTitle}>Session Reports</h2>
                <p style={styles.pageSubtitle}>Download professional PDF reports for each session</p>
              </div>
              <button onClick={downloadReport} className="btn btn-primary btn-sm">
                <Download size={14} /> Latest Report
              </button>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
              {[
                { label: 'Total Sessions', val: sessions.length, icon: '📊', color: '#0D5E6B', bg: '#EEF6F8' },
                { label: 'Reports Available', val: sessions.length, icon: '📄', color: '#E8841A', bg: '#FEF3E2' },
                { label: 'Avg Accuracy', icon: '🎯', color: '#10B981', bg: '#D1FAE5',
                  val: sessions.length > 0 ? `${Math.round(sessions.reduce((a,s) => a + parseFloat(s.accuracy_score||0)*100, 0) / sessions.length)}%` : '—' },
              ].map((k) => (
                <div key={k.label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{k.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: k.color }}>{k.val}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>{k.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sessions table */}
            <div className="card">
              <div style={{ padding: '20px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="section-title">All Sessions</span>
                <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{sessions.length} records found</span>
              </div>
              {sessions.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No sessions recorded yet.</div>
              ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th><th>Date</th><th>Duration</th><th>Accuracy</th>
                    <th>Difficulty</th><th>LPI</th><th>Words</th><th>Report</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr key={s.id}>
                      <td style={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.78rem' }}>#{sessions.length - i}</td>
                      <td>{s.start_time?.slice(0, 10)}</td>
                      <td>{Math.round(parseInt(s.duration_seconds||0)/60)} min</td>
                      <td><span style={{ fontWeight: 700, color: parseFloat(s.accuracy_score) > 0.7 ? '#10B981' : '#F59E0B' }}>
                        {Math.round(parseFloat(s.accuracy_score||0)*100)}%
                      </span></td>
                      <td><span className={`badge badge-${s.difficulty === 'hard' ? 'danger' : s.difficulty === 'medium' ? 'warning' : 'success'}`}>{s.difficulty}</span></td>
                      <td style={{ fontWeight: 700, color: '#0D5E6B' }}>{s.lpi_score}</td>
                      <td>{parseInt(s.perfect_grabs,10)||0}</td>
                      <td>
                        <button
                          onClick={async () => {
                            try {
                              const res = await api.get(`/reports/${s.id}/pdf`, { responseType: 'blob' });
                              const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                              const a = document.createElement('a'); a.href = url;
                              a.download = `NestureAI_Report_${s.start_time?.slice(0,10)}.pdf`;
                              document.body.appendChild(a); a.click(); document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                              toast.success('Report downloaded!');
                            } catch { toast.error('Error generating report'); }
                          }}
                          style={styles.downloadBtn}
                        >
                          ⬇ PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </motion.div>

        ) : (
          <>
            {/* KPI Row */}

        {/* KPI strip */}
        <div style={styles.kpiRow}>
          {[
            { label: 'Latest Accuracy', value: `${latestAcc}%`,
              change: accChange > 0 ? `+${accChange}%` : `${accChange}%`,
              up: accChange >= 0, color: '#0D5E6B' },
            { label: 'Avg Response Time',
              value: latestSession ? `${(parseFloat(latestSession.avg_response_time_ms||0)/1000).toFixed(1)}s` : '—',
              change: '↓ Improving', up: true, color: '#E8841A' },
            { label: 'LPI Score', value: latestSession?.lpi_score || '—',
              change: 'Learner Progress Index', up: true, color: '#8B5CF6' },
            { label: 'Sessions Done', value: sessions.length,
              change: 'Total sessions', up: true, color: '#10B981' },
          ].map((k) => (
            <motion.div key={k.label} className="card" style={styles.kpiCard}
              whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
              <div style={{ ...styles.kpiValue, color: k.color }}>{k.value}</div>
              <div style={styles.kpiLabel}>{k.label}</div>
              <div style={{ ...styles.kpiChange, color: k.up ? '#10B981' : '#EF4444' }}>{k.change}</div>
            </motion.div>
          ))}
        </div>

        <div style={styles.twoCol}>
          {/* Progress chart */}
          <div className="card" style={styles.chartCard}>
            <div className="section-header">
              <span className="section-title">Accuracy Over Time</span>
              <span className="badge badge-teal">{sessions.length} sessions</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 16, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="session" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#0D5E6B" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0D5E6B' }} activeDot={{ r: 6 }} name="Accuracy %" />
                <Line type="monotone" dataKey="lpi" stroke="#E8841A" strokeWidth={2}
                  dot={{ r: 3, fill: '#E8841A' }} strokeDasharray="4 2" name="LPI" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI narrative */}
          <div className="card" style={styles.narrativeCard}>
            <div className="section-header">
              <span className="section-title">AI Session Summary</span>
              <span className="badge badge-teal">Latest</span>
            </div>
            {analysis ? (
              <>
                <p style={styles.narrativeText}>{analysis.narrative}</p>
                <div style={styles.lpiDisplay}>
                  <div style={styles.lpiNum}>{analysis.lpi_score}</div>
                  <div style={styles.lpiLbl}>LPI Score</div>
                </div>
              </>
            ) : (
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No session data yet</p>
            )}
          </div>
        </div>

        {/* Reflex integration */}
        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <div className="section-header">
            <span className="section-title">Reflex Integration Status</span>
            <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Higher score = better integrated</span>
          </div>
          <div style={styles.reflexGrid}>
            {reflexes.map((r) => (
              <ReflexScoreCard
                key={r.reflex_name}
                reflex={r.reflex_name}
                score={r.score}
                confidence={r.confidence_level}
                trend={r.trend}
              />
            ))}
          </div>
        </div>

        {/* Recommended exercises */}
        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <div className="section-header">
            <span className="section-title">Recommended Home Exercises</span>
            <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Based on today's session</span>
          </div>
          {analysis?.recommendations?.slice(0, 3).map((rec, i) => {
            const ex = exercises.find(e => e.id === rec.exercise_id) ||
              { name: rec.exercise_id, description: rec.reason, duration_minutes: '5' };
            return (
              <div key={i} style={styles.exerciseRow}>
                <div style={styles.exNum}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={styles.exName}>{ex.name || rec.exercise_id}</div>
                  <div style={styles.exDesc}>{ex.description || rec.reason}</div>
                </div>
                <div style={styles.exMeta}>
                  <span className="badge badge-teal">{rec.target_reflex}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{ex.duration_minutes} min</span>
                </div>
                <button style={styles.watchBtn}>▶ Watch</button>
              </div>
            );
          })}
        </div>

        {/* Session history */}
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ padding: '20px 24px 12px' }}>
            <span className="section-title">Session History</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Duration</th>
                <th>Accuracy</th>
                <th>Difficulty</th>
                <th>LPI</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>{s.start_time?.slice(0, 10)}</td>
                  <td>{Math.round(parseInt(s.duration_seconds || 0) / 60)} min</td>
                  <td>
                    <span style={{ fontWeight: 600, color: parseFloat(s.accuracy_score) > 0.7 ? '#10B981' : '#F59E0B' }}>
                      {Math.round(parseFloat(s.accuracy_score || 0) * 100)}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${s.difficulty === 'hard' ? 'danger' : s.difficulty === 'medium' ? 'warning' : 'success'}`}>
                      {s.difficulty}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#0D5E6B' }}>{s.lpi_score}</td>
                  <td>
                    <button
                      onClick={async () => {
                        const res = await api.get(`/reports/${s.id}/pdf`, { responseType: 'blob' });
                        const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                        const a = document.createElement('a'); a.href = url; a.download = 'report.pdf'; 
                        document.body.appendChild(a); a.click(); document.body.removeChild(a);
                      }}
                      style={{ color: '#0D5E6B', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      ⬇ PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}
      </main>
    </div>
  );
}

const styles = {
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 28,
  },
  pageTitle: { fontFamily: 'Inter, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#0D5E6B' },
  pageSubtitle: { fontSize: '0.875rem', color: '#9CA3AF', marginTop: 4 },
  headerActions: { display: 'flex', gap: 10 },
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
  kpiValue: { fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.8rem' },
  kpiLabel: { fontSize: '0.78rem', color: '#6B7280', marginTop: 2, fontWeight: 500 },
  kpiChange: { fontSize: '0.72rem', fontWeight: 600, marginTop: 4 },
  twoCol: { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 },
  chartCard: { padding: 24 },
  narrativeCard: { padding: 24, display: 'flex', flexDirection: 'column' },
  narrativeText: { fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, flex: 1 },
  lpiDisplay: { textAlign: 'center', marginTop: 16 },
  lpiNum: { fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '2.5rem', color: '#E8841A' },
  lpiLbl: { fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.06em' },
  reflexGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 },
  exerciseRow: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 0', borderBottom: '1px solid #F3F4F6',
  },
  exNum: {
    width: 28, height: 28, borderRadius: '50%',
    background: '#EEF6F8', color: '#0D5E6B',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.82rem', flexShrink: 0,
  },
  exName: { fontWeight: 600, fontSize: '0.9rem', color: '#1F2937', marginBottom: 2 },
  exDesc: { fontSize: '0.78rem', color: '#6B7280' },
  exMeta: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  watchBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '6px 14px',
    background: '#0D5E6B', color: '#fff',
    border: 'none', borderRadius: 8,
    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
    whiteSpace: 'nowrap', marginLeft: 'auto',
  },
  exCard: {
    background: '#fff', border: '1.5px solid #DDE8EB', borderRadius: 16,
    padding: '18px 16px', display: 'flex', flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(13,94,107,0.05)', minHeight: 180,
  },
  exCardTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  exLibCard: {
    background: '#F8FAFB', border: '1px solid #E5E7EB', borderRadius: 12,
    padding: '14px 16px',
  },
  downloadBtn: {
    padding: '5px 12px', background: '#EEF6F8', color: '#0D5E6B',
    border: '1px solid #B2DFE6', borderRadius: 8,
    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  flagBar: { height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  flagBarFill: { height: '100%', borderRadius: 4 },
};

