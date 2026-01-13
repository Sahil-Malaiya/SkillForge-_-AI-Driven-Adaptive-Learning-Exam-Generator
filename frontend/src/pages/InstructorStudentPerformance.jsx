import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { studentQuizService } from '../services/studentQuizService';
import './InstructorStudentPerformance.css';

function InstructorStudentPerformance() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                let profile = null;
                try {
                    const res = await fetch(`http://localhost:8080/api/students/${studentId}`, {
                        headers: { 'Authorization': `Bearer ${authService.getToken()}` }
                    });
                    if (res.ok) profile = await res.json();
                } catch (e) { }

                const progress = await studentQuizService.getProgress(studentId);
                if (mounted) {
                    setStudent(profile || { id: studentId, name: profile?.name || `Student ${studentId}`, email: profile?.email || '—' });
                    setStats(progress || {});
                }
            } catch (err) {
                console.error(err);
                if (mounted) setError('Failed to load student performance');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [studentId]);

    const safeNumber = (n, fallback = 0) => { const v = Number(n); return Number.isFinite(v) ? v : fallback };

    const attempts = stats?.attempts || [];
    const totalAttempts = safeNumber(stats?.totalAttempts, attempts.length);
    const avgScore = safeNumber(stats?.avgScore, (() => {
        if (attempts.length === 0) return 0;
        const vals = attempts.map(a => Number(a.score ?? 0));
        return Math.round(vals.reduce((s, n) => s + n, 0) / vals.length);
    })());
    const accuracy = safeNumber(stats?.accuracy, (() => {
        if (attempts.length === 0) return 0;
        const vals = attempts.map(a => {
            const total = Number(a.totalQuestions ?? a.total ?? 0) || 0;
            return total > 0 ? Math.round((Number(a.score || 0) / total) * 100) : Number(a.percentage ?? a.accuracy ?? 0);
        });
        return Math.round(vals.reduce((s, n) => s + n, 0) / vals.length);
    })());
    const highest = attempts.reduce((mx, a) => Math.max(mx, Number(a.score ?? 0)), 0);

    const topicMap = {};
    attempts.forEach(a => {
        const topic = a.quiz?.topic?.title || a.topicName || a.quiz?.title || 'General';
        topicMap[topic] = topicMap[topic] || { totalPct: 0, count: 0 };
        const total = Number(a.totalQuestions ?? a.total ?? 0) || 0;
        const pct = total > 0 ? Math.round((Number(a.score || 0) / total) * 100) : Number(a.percentage ?? a.accuracy ?? 0);
        topicMap[topic].totalPct += Number.isFinite(pct) ? pct : 0;
        topicMap[topic].count += 1;
    });
    const topicRows = Object.keys(topicMap).map(k => ({ topic: k, attempts: topicMap[k].count, avg: topicMap[k].count ? Math.round(topicMap[k].totalPct / topicMap[k].count) : 0 }));

    const getPerformanceLevel = (pct) => {
        if (pct >= 90) return { label: 'Excellent', color: '#28a745', bg: '#d4edda' };
        if (pct >= 75) return { label: 'Good', color: '#0d6efd', bg: '#cfe2ff' };
        if (pct >= 50) return { label: 'Average', color: '#fd7e14', bg: '#ffe5d0' };
        return { label: 'Needs Improvement', color: '#dc3545', bg: '#f8d7da' };
    };

    const performanceLevel = getPerformanceLevel(accuracy);

    return (
        <div className="content-body">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
                {/* Header Section */}
                <div style={{ marginBottom: '30px' }}>
                    <button
                        onClick={() => navigate('/students')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#1976d2',
                            fontSize: '14px',
                            cursor: 'pointer',
                            marginBottom: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontWeight: 500
                        }}
                    >
                        ← Back to Students
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '28px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                        }}>
                            {student?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600, color: '#2c3e50' }}>{student?.name || 'Student'}</h1>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6c757d' }}>{student?.email || '—'}</p>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                background: performanceLevel.bg,
                                color: performanceLevel.color,
                                fontSize: '14px',
                                fontWeight: 600,
                                display: 'inline-block'
                            }}>
                                {performanceLevel.label}
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#6c757d' }}>
                                Overall Performance: <strong style={{ color: performanceLevel.color }}>{accuracy}%</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#6c757d' }}>Loading...</div>
                ) : error ? (
                    <div className="alert alert-error">{error}</div>
                ) : (
                    <>
                        {/* Key Metrics */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            <div className="card" style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }}>
                                <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Total Quizzes</div>
                                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{totalAttempts}</div>
                            </div>
                            <div className="card" style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)' }}>
                                <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Average Score</div>
                                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{avgScore}%</div>
                            </div>
                            <div className="card" style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)' }}>
                                <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Accuracy Rate</div>
                                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{accuracy}%</div>
                            </div>
                            <div className="card" style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)' }}>
                                <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Highest Score</div>
                                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{highest}</div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            {/* Topic Performance */}
                            <div className="card" style={{ padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#667eea' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Topic Performance
                                </h3>
                                {topicRows.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>No topic data available</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {topicRows.map((r, i) => {
                                            const level = getPerformanceLevel(r.avg);
                                            return (
                                                <div key={i} style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: `2px solid ${level.color}20` }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#2c3e50' }}>{r.topic}</span>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '12px',
                                                            background: level.bg,
                                                            color: level.color,
                                                            fontSize: '13px',
                                                            fontWeight: 700
                                                        }}>
                                                            {r.avg}%
                                                        </span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${r.avg}%`,
                                                            height: '100%',
                                                            background: `linear-gradient(90deg, ${level.color}, ${level.color}dd)`,
                                                            transition: 'width 0.5s ease'
                                                        }}></div>
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '6px' }}>
                                                        {r.attempts} {r.attempts === 1 ? 'attempt' : 'attempts'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Quiz History */}
                            <div className="card" style={{ padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#667eea' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Recent Quizzes
                                </h3>
                                {attempts.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>No quiz attempts yet</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {attempts.slice(0, 6).map((a, idx) => {
                                            const score = Number(a.score ?? 0);
                                            const total = Number(a.totalQuestions ?? a.total ?? 0) || 0;
                                            const pct = total > 0 ? Math.round((score / total) * 100) : Math.round(Number(a.percentage ?? a.accuracy ?? 0));
                                            const level = getPerformanceLevel(pct);
                                            const date = a.attemptedAt ? new Date(a.attemptedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

                                            return (
                                                <div key={a.id || idx} style={{
                                                    padding: '12px 15px',
                                                    background: '#f8f9fa',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    borderLeft: `4px solid ${level.color}`
                                                }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#2c3e50', marginBottom: '4px' }}>
                                                            {a.quiz?.title || `Quiz ${idx + 1}`}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>{date}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '18px', fontWeight: 700, color: level.color }}>{pct}%</div>
                                                        <div style={{ fontSize: '11px', color: '#6c757d' }}>{score}/{total}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Performance Summary */}
                        <div className="card" style={{ padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#667eea' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Performance Summary
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ padding: '20px', background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)', borderRadius: '10px', borderLeft: '5px solid #28a745' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#155724', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Strong Areas
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#155724', lineHeight: '1.6' }}>
                                        {topicRows.filter(r => r.avg >= 75).length > 0
                                            ? topicRows.filter(r => r.avg >= 75).map(r => r.topic).join(', ')
                                            : 'Keep practicing to identify strengths'}
                                    </div>
                                </div>
                                <div style={{ padding: '20px', background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)', borderRadius: '10px', borderLeft: '5px solid #dc3545' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#721c24', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        Needs Attention
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#721c24', lineHeight: '1.6' }}>
                                        {topicRows.filter(r => r.avg < 50).length > 0
                                            ? topicRows.filter(r => r.avg < 50).map(r => r.topic).join(', ')
                                            : 'No weak areas identified - Great job!'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default InstructorStudentPerformance;
