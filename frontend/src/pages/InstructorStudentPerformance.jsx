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

    // Helper function to calculate scores correctly
    const calculateScore = (attempt) => {
        const autoScore = Number(attempt.score || 0);
        const manualScore = Number(attempt.manualScore || 0);
        const total = Number(attempt.totalQuestions || 0);
        const totalScore = autoScore + manualScore;
        const percentage = total > 0 ? Math.min(100, Math.round((totalScore / total) * 100)) : 0;

        return { autoScore, manualScore, totalScore, total, percentage };
    };

    const safeNumber = (n, fallback = 0) => { const v = Number(n); return Number.isFinite(v) ? v : fallback; };


    const attempts = stats?.attempts || [];
    const totalAttempts = safeNumber(stats?.totalAttempts, attempts.length);

    // Recalculate average and accuracy on frontend to ensure correctness
    let avgScore = 0;
    let accuracy = 0;

    if (attempts.length > 0) {
        // Calculate average score (average of all quiz percentages)
        const percentages = attempts.map(a => {
            const { percentage } = calculateScore(a);
            return percentage;
        });
        avgScore = Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length);

        // Calculate overall accuracy (total correct / total questions)
        const totalCorrect = attempts.reduce((sum, a) => {
            const autoScore = Number(a.score || 0);
            const manualScore = Number(a.manualScore || 0);
            return sum + autoScore + manualScore;
        }, 0);

        const totalQuestions = attempts.reduce((sum, a) => {
            return sum + Number(a.totalQuestions || 0);
        }, 0);

        accuracy = totalQuestions > 0 ? Math.min(100, Math.round((totalCorrect / totalQuestions) * 100)) : 0;
    }

    console.log('Performance Stats:', { totalAttempts, avgScore, accuracy, attemptsCount: attempts.length });

    // Calculate highest score correctly
    const highest = attempts.reduce((mx, a) => {
        const { percentage } = calculateScore(a);
        return Math.max(mx, percentage);
    }, 0);

    // Calculate topic-wise performance
    const topicMap = {};
    attempts.forEach(a => {
        const topic = a.quiz?.topic?.title || a.topicName || a.quiz?.title || 'General';
        if (!topicMap[topic]) {
            topicMap[topic] = { totalPct: 0, count: 0, scores: [] };
        }
        const { percentage } = calculateScore(a);
        topicMap[topic].totalPct += percentage;
        topicMap[topic].count += 1;
        topicMap[topic].scores.push(percentage);
    });

    const topicRows = Object.keys(topicMap).map(k => ({
        topic: k,
        attempts: topicMap[k].count,
        avg: topicMap[k].count ? Math.round(topicMap[k].totalPct / topicMap[k].count) : 0,
        scores: topicMap[k].scores
    })).sort((a, b) => b.avg - a.avg);

    const getPerformanceLevel = (pct) => {
        if (pct >= 90) return { label: 'Excellent', color: '#059669', bg: '#d1fae5' };
        if (pct >= 75) return { label: 'Good', color: '#0891b2', bg: '#cffafe' };
        if (pct >= 50) return { label: 'Average', color: '#d97706', bg: '#fed7aa' };
        return { label: 'Needs Improvement', color: '#dc2626', bg: '#fecaca' };
    };

    const performanceLevel = getPerformanceLevel(accuracy);

    // Prepare chart data (last 10 attempts)
    const chartData = attempts
        .slice(-10)
        .map((a, idx) => {
            const { percentage } = calculateScore(a);
            return {
                label: `Q${attempts.length - 10 + idx + 1}`,
                percentage,
                date: a.attemptedAt ? new Date(a.attemptedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
            };
        });

    return (
        <div className="performance-container">
            <div className="performance-content">
                {/* Header Section */}
                <div className="performance-header">
                    <button onClick={() => navigate('/students')} className="back-btn">
                        ← Back to Students
                    </button>

                    <div className="student-info">
                        <div className="student-avatar-large">
                            {student?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="student-details">
                            <h1 className="student-name-large">{student?.name || 'Student'}</h1>
                            <p className="student-email">{student?.email || '—'}</p>
                        </div>
                        <div className="performance-badge-container">
                            <div className="performance-badge" style={{ background: performanceLevel.bg, color: performanceLevel.color }}>
                                {performanceLevel.label}
                            </div>
                            <div className="overall-performance">
                                Overall: <strong style={{ color: performanceLevel.color }}>{accuracy}%</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Loading performance data...</div>
                ) : error ? (
                    <div className="alert alert-error">{error}</div>
                ) : (
                    <>
                        {/* Key Metrics Cards */}
                        <div className="metrics-grid">
                            <div className="metric-card metric-purple">
                                <div className="metric-label">Total Quizzes</div>
                                <div className="metric-value">{totalAttempts}</div>
                            </div>
                            <div className="metric-card metric-pink">
                                <div className="metric-label">Average Score</div>
                                <div className="metric-value">{avgScore}%</div>
                            </div>
                            <div className="metric-card metric-blue">
                                <div className="metric-label">Overall Accuracy</div>
                                <div className="metric-value">{accuracy}%</div>
                            </div>
                            <div className="metric-card metric-green">
                                <div className="metric-label">Highest Score</div>
                                <div className="metric-value">{highest}%</div>
                            </div>
                        </div>

                        {/* Performance Chart */}
                        {chartData.length > 0 && (
                            <div className="chart-card">
                                <h3 className="card-title">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                    Performance Trend
                                </h3>
                                <div className="chart-container">
                                    <div className="chart-y-axis">
                                        <span>100%</span>
                                        <span>75%</span>
                                        <span>50%</span>
                                        <span>25%</span>
                                        <span>0%</span>
                                    </div>
                                    <div className="chart-bars">
                                        {chartData.map((item, idx) => (
                                            <div key={idx} className="chart-bar-container">
                                                <div className="chart-bar-wrapper">
                                                    <div
                                                        className="chart-bar"
                                                        style={{
                                                            height: `${item.percentage}%`,
                                                            background: getPerformanceLevel(item.percentage).color
                                                        }}
                                                        title={`${item.percentage}% - ${item.date}`}
                                                    >
                                                        <span className="bar-value">{item.percentage}%</span>
                                                    </div>
                                                </div>
                                                <div className="chart-label">{item.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Content Grid */}
                        <div className="content-grid">
                            {/* Topic Performance */}
                            <div className="topic-card">
                                <h3 className="card-title">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Topic Performance
                                </h3>
                                {topicRows.length === 0 ? (
                                    <div className="empty-state">No topic data available</div>
                                ) : (
                                    <div className="topic-list">
                                        {topicRows.map((r, i) => {
                                            const level = getPerformanceLevel(r.avg);
                                            return (
                                                <div key={i} className="topic-item" style={{ borderColor: level.color + '40' }}>
                                                    <div className="topic-header">
                                                        <span className="topic-name">{r.topic}</span>
                                                        <span className="topic-score" style={{ background: level.bg, color: level.color }}>
                                                            {r.avg}%
                                                        </span>
                                                    </div>
                                                    <div className="topic-progress-bar">
                                                        <div
                                                            className="topic-progress-fill"
                                                            style={{
                                                                width: `${r.avg}%`,
                                                                background: level.color
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="topic-meta">
                                                        {r.attempts} {r.attempts === 1 ? 'attempt' : 'attempts'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Recent Quizzes */}
                            <div className="quiz-card">
                                <h3 className="card-title">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Recent Quizzes
                                </h3>
                                {attempts.length === 0 ? (
                                    <div className="empty-state">No quiz attempts yet</div>
                                ) : (
                                    <div className="quiz-list">
                                        {attempts.slice(-8).reverse().map((a, idx) => {
                                            const { autoScore, manualScore, totalScore, total, percentage } = calculateScore(a);
                                            const level = getPerformanceLevel(percentage);
                                            const date = a.attemptedAt ? new Date(a.attemptedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                                            const isFullyAssessed = a.fullyAssessed !== false;

                                            return (
                                                <div key={a.id || idx} className="quiz-item" style={{ borderLeftColor: level.color }}>
                                                    <div className="quiz-info">
                                                        <div className="quiz-title">{a.quiz?.title || `Quiz ${idx + 1}`}</div>
                                                        <div className="quiz-meta">
                                                            <span>{date}</span>
                                                            {!isFullyAssessed && <span className="pending-badge">Pending Assessment</span>}
                                                        </div>
                                                        <div className="quiz-score-breakdown">
                                                            Auto: {autoScore} | Manual: {manualScore} | Total: {totalScore}/{total}
                                                        </div>
                                                    </div>
                                                    <div className="quiz-score">
                                                        <div className="quiz-percentage" style={{ color: level.color }}>{percentage}%</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Performance Summary */}
                        <div className="summary-card">
                            <h3 className="card-title">
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Performance Summary
                            </h3>
                            <div className="summary-grid">
                                <div className="summary-box summary-strong">
                                    <div className="summary-title">
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Strong Areas
                                    </div>
                                    <div className="summary-content">
                                        {topicRows.filter(r => r.avg >= 75).length > 0
                                            ? topicRows.filter(r => r.avg >= 75).map(r => r.topic).join(', ')
                                            : 'Keep practicing to identify strengths'}
                                    </div>
                                </div>
                                <div className="summary-box summary-weak">
                                    <div className="summary-title">
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        Needs Attention
                                    </div>
                                    <div className="summary-content">
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
