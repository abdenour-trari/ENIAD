import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowLeft, Download, Plus } from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import ReflexScoreCard from '../components/shared/ReflexScoreCard';
import api from '../services/api';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/ot', label: 'Learner Overview', icon: '👥', end: true },
  { to: '/ot', label: 'Analytics',        icon: '📊' },
  { to: '/ot', label: 'Exercises',        icon: '🏃' },
  { to: '/ot', label: 'Reports',          icon: '📄' },
];

export default function LearnerDetail() {
  const { learnerId } = useParams();
  const navigate = useNavigate();

  const [learner,   setLearner]   = useState(null);
  const [sessions,  setSessions]  = useState([]);
  const [reflexes,  setReflexes]  = useState([]);
  const [exercises, setExercises] = useState([]);
  const [analysis,  setAnalysis]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [prescribing, setPrescribing] = useState(false);

  useEffect(() => { fetchAll(); }, [learnerId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [lRes, sRes, rRes, exRes] = await Promise.all([
        api.get(`/learners/${learnerId}`),
        api.get(`/sessions/learner/${learnerId}?limit=10`),
        api.get(`/reflexes/learner/${learnerId}/summary`),
        api.get('/exercises/'),
      ]);
      setLearner(lRes.data);
      setSessions(sRes.data);
      setReflexes(rRes.data);
      setExercises(exRes.data);

      if (sRes.data.length > 0) {
        const aRes = await api.get(`/sessions/${sRes.data[0].id}/analysis`);
        setAnalysis(aRes.data);
      }
    } catch { toast.error('Could not load learner data'); }
    finally { setLoading(false); }
  };

  const prescribeExercise = async (exerciseId) => {
    try {
      await api.post('/exercises/prescribe', {
        learner_id: learnerId,
        exercise_id: exerciseId,
      });
      toast.success('Exercise prescribed!');
    } catch { toast.error('Could not prescribe exercise'); }
  };

  const downloadReport = async () => {
    if (!sessions[0]) return;
    try {
      const res = await api.get(`/reports/${sessions[0].id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `Report_${learner?.name?.replace(' ','_')}.pdf`; 
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch { toast.error('Error downloading report'); }
  };

  const chartData = [...sessions].reverse().map((s, i) => ({
    session: `S${i + 1}`,
    accuracy: Math.round(parseFloat(s.accuracy_score || 0) * 100),
    responseTime: parseFloat((parseFloat(s.avg_response_time_ms || 0) / 1000).toFixed(1)),
    lpi: parseInt(s.lpi_score || 0),
  }));

  const needsAttention = reflexes.some(r => r.confidence_level === 'High' && parseInt(r.score) < 40);

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar navItems={NAV} />
        <div className="main-content" style={{ display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Sidebar navItems={NAV} />
      <main className="main-content">
        {/* Header */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={styles.header}>
          <button onClick={() => navigate('/ot')} style={styles.backBtn}>
            <ArrowLeft size={16} /> All Learners
          </button>
          <div style={styles.headerRight}>
            <div style={{ ...styles.avatar, background: learner?.avatar_color || '#0D5E6B' }}>
              {learner?.name?.[0]}
            </div>
            <div>
              <h1 style={styles.learnerName}>{learner?.name}</h1>
              <p style={styles.learnerInfo}>Age {learner?.age} · {learner?.diagnosis}</p>
            </div>
            {needsAttention && (
              <span className="badge badge-danger" style={{ marginLeft: 12 }}>⚠ Needs Attention</span>
            )}
          </div>
          <div style={{ display:'flex', gap:10, marginLeft:'auto' }}>
            <button onClick={downloadReport} className="btn btn-secondary btn-sm">
              <Download size={14} /> Export Report
            </button>
          </div>
        </motion.div>

        {/* Charts */}
        <div style={styles.twoCol}>
          <div className="card" style={{ padding: 24 }}>
            <div className="section-header">
              <span className="section-title">Accuracy & LPI Trend</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top:5,right:10,bottom:5,left:-20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="session" tick={{ fontSize:11, fill:'#9CA3AF' }} />
                <YAxis tick={{ fontSize:11, fill:'#9CA3AF' }} domain={[0,100]} />
                <Tooltip contentStyle={{ borderRadius:10,border:'none',fontSize:12 }} />
                <Line type="monotone" dataKey="accuracy" stroke="#0D5E6B" strokeWidth={2.5}
                  dot={{ r:4 }} name="Accuracy %" />
                <Line type="monotone" dataKey="lpi" stroke="#E8841A" strokeWidth={2}
                  strokeDasharray="4 2" dot={{ r:3 }} name="LPI" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="section-header">
              <span className="section-title">Response Time Trend</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top:5,right:10,bottom:5,left:-20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="session" tick={{ fontSize:11, fill:'#9CA3AF' }} />
                <YAxis tick={{ fontSize:11, fill:'#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius:10,border:'none',fontSize:12 }} />
                <Line type="monotone" dataKey="responseTime" stroke="#8B5CF6" strokeWidth={2.5}
                  dot={{ r:4 }} name="Response Time (s)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reflex assessment panel */}
        <div className="card" style={{ padding:24, marginTop:16 }}>
          <div className="section-header">
            <span className="section-title">Primitive Reflex Assessment Panel</span>
            <span style={{ fontSize:'0.8rem', color:'#9CA3AF' }}>
              Data from {sessions.length} sessions
            </span>
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
          {analysis?.narrative && (
            <div style={styles.aiBox}>
              <span style={{ fontSize:'0.75rem', fontWeight:700, color:'#0D5E6B',
                textTransform:'uppercase', letterSpacing:'0.05em' }}>AI Analysis</span>
              <p style={{ fontSize:'0.875rem', color:'#374151', marginTop:6, lineHeight:1.7 }}>
                {analysis.narrative}
              </p>
            </div>
          )}
        </div>

        {/* Exercise prescription */}
        <div className="card" style={{ padding:24, marginTop:16 }}>
          <div className="section-header">
            <span className="section-title">Exercise Prescription</span>
            <span style={{ fontSize:'0.8rem', color:'#9CA3AF' }}>
              Assign exercises to {learner?.name?.split(' ')[0]}
            </span>
          </div>
          <div style={styles.exerciseGrid}>
            {exercises.slice(0,6).map((ex) => (
              <div key={ex.id} style={styles.exCard}>
                <div style={styles.exCardTop}>
                  <span className="badge badge-teal">{ex.target_reflex}</span>
                  <span style={{ fontSize:'0.7rem', color:'#9CA3AF' }}>{ex.duration_minutes} min</span>
                </div>
                <div style={styles.exCardName}>{ex.name}</div>
                <div style={styles.exCardDesc}>{ex.description.slice(0, 80)}…</div>
                <div style={styles.exCardFooter}>
                  <span className={`badge badge-${ex.difficulty_level === 'easy' ? 'success' : 'warning'}`}>
                    {ex.difficulty_level}
                  </span>
                  <button onClick={() => prescribeExercise(ex.id)} style={styles.prescribeBtn}>
                    <Plus size={12} /> Prescribe
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session history */}
        <div className="card" style={{ marginTop:16 }}>
          <div style={{ padding:'20px 24px 12px' }}>
            <span className="section-title">Session History (IEP Reference)</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th><th>Duration</th><th>Accuracy</th>
                <th>Attempts</th><th>Perfect</th><th>LPI</th>
                <th>Scenario</th><th>Report</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>{s.start_time?.slice(0,10)}</td>
                  <td>{Math.round(parseInt(s.duration_seconds||0)/60)} min</td>
                  <td>
                    <span style={{ fontWeight:600, color: parseFloat(s.accuracy_score)>0.7 ? '#10B981' : '#F59E0B' }}>
                      {Math.round(parseFloat(s.accuracy_score||0)*100)}%
                    </span>
                  </td>
                  <td>{s.total_attempts}</td>
                  <td style={{ color:'#10B981', fontWeight:600 }}>{s.perfect_grabs}</td>
                  <td style={{ fontFamily:'Inter,sans-serif', fontWeight:700, color:'#0D5E6B' }}>{s.lpi_score}</td>
                  <td>
                    <span className={`badge badge-${s.scenario === 'happy_path' ? 'success' : 'warning'}`}>
                      {s.scenario === 'happy_path' ? 'On Track' : 'Attention'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={async () => {
                        const res = await api.get(`/reports/${s.id}/pdf`, { responseType:'blob' });
                        const url = URL.createObjectURL(new Blob([res.data], { type:'application/pdf' }));
                        const a = document.createElement('a'); a.href = url;
                        a.download = `Report_${s.id.slice(0,8)}.pdf`; 
                        document.body.appendChild(a); a.click(); document.body.removeChild(a);
                      }}
                      style={{ color:'#0D5E6B', background:'none', border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.8rem' }}
                    >⬇ PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

const styles = {
  header: { display:'flex', alignItems:'center', gap:16, marginBottom:24, flexWrap:'wrap' },
  backBtn: {
    display:'flex', alignItems:'center', gap:6,
    padding:'8px 14px', background:'#EEF6F8',
    border:'1.5px solid #C8E8ED', borderRadius:8,
    color:'#0D5E6B', fontSize:'0.82rem', fontWeight:600, cursor:'pointer',
  },
  headerRight: { display:'flex', alignItems:'center', gap:14 },
  avatar: {
    width:48, height:48, borderRadius:'50%',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontFamily:'Inter,sans-serif', fontWeight:800, fontSize:'1.2rem', color:'#fff',
  },
  learnerName: { fontFamily:'Inter,sans-serif', fontWeight:800, fontSize:'1.3rem', color:'#0D5E6B' },
  learnerInfo: { fontSize:'0.8rem', color:'#9CA3AF', marginTop:2 },
  twoCol: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:0 },
  reflexGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 },
  aiBox: {
    background:'#EEF6F8', borderRadius:12, padding:'14px 16px',
    border:'1px solid #C8E8ED',
  },
  exerciseGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 },
  exCard: {
    background:'#F9FAFB', borderRadius:12, padding:'14px',
    border:'1px solid #E5E7EB', display:'flex', flexDirection:'column', gap:6,
  },
  exCardTop: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  exCardName: { fontWeight:700, fontSize:'0.875rem', color:'#1F2937' },
  exCardDesc: { fontSize:'0.75rem', color:'#6B7280', lineHeight:1.5 },
  exCardFooter: { display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 },
  prescribeBtn: {
    display:'flex', alignItems:'center', gap:4,
    padding:'5px 12px', background:'#0D5E6B', color:'#fff',
    border:'none', borderRadius:7, fontSize:'0.75rem', fontWeight:600, cursor:'pointer',
  },
};
