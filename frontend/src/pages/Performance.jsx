import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { studentQuizService } from '../services/studentQuizService';
import Sidebar from '../components/Sidebar';
import './Performance.css';

function Performance() {
    const user = authService.getCurrentUser();
    const studentId = user?.userId || user?.id || user?.user?.id;
    const userName = user?.fullName || user?.name || 'Student';
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const data = await studentQuizService.getProgress(studentId);
                if (mounted) setStats(data || {});
            } catch (err) {
                console.error(err);
                if (mounted) setError('Failed to load performance');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [studentId]);

    useEffect(() => {
        if (!stats) return;
        setTimeout(() => drawCharts(stats), 100);
    }, [stats]);

    const safeNumber = (n, fallback = 0) => {
        const num = Number(n);
        return Number.isFinite(num) ? num : fallback;
    };

    const getPerformanceColor = (percentage) => {
        if (percentage >= 80) return '#059669';
        if (percentage >= 60) return '#10b981';
        if (percentage >= 40) return '#f59e0b';
        return '#ef4444';
    };

    const getPerformanceLevel = (percentage) => {
        if (percentage >= 80) return 'Excellent';
        if (percentage >= 60) return 'Good';
        if (percentage >= 40) return 'Average';
        return 'Needs Work';
    };

    const getPerformanceGrade = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        return 'F';
    };

    const calculateTotalScore = (attempt) => {
        // Score is the count of correct MCQ answers (each worth 1 mark)
        // ManualScore is the sum of marks from graded SAQs (each SAQ worth 1 mark)
        const mcqScore = safeNumber(attempt.score, 0);
        const manualScore = safeNumber(attempt.manualScore, 0);
        return mcqScore + manualScore;
    };

    const calculateTotalPossibleMarks = (attempt) => {
        // Total questions is the denominator for percentage calculation
        // Each question (MCQ or SAQ) is worth 1 mark
        return safeNumber(attempt.totalQuestions ?? attempt.total, 1);
    };

    const isFullyGraded = (attempt) => {
        // Use backend status if available
        return attempt.fullyAssessed !== undefined ? attempt.fullyAssessed : true;
    };

    const calculateOverallStats = () => {
        if (!stats?.attempts || stats.attempts.length === 0) {
            return { totalScore: 0, totalQuestions: 0, avgPercentage: 0, totalAttempts: 0 };
        }

        let totalScore = 0;
        let totalQuestions = 0;

        stats.attempts.forEach(attempt => {
            totalScore += calculateTotalScore(attempt);
            totalQuestions += calculateTotalPossibleMarks(attempt);
        });

        return {
            totalScore,
            totalQuestions,
            avgPercentage: totalQuestions > 0 ? Math.min(100, Math.round((totalScore / totalQuestions) * 100)) : 0,
            totalAttempts: stats.attempts.length
        };
    };

    const calculateSubjectPerformance = () => {
        if (!stats?.attempts || stats.attempts.length === 0) return [];

        const subjectMap = {};
        stats.attempts.forEach(attempt => {
            const subject = attempt.quiz?.topic?.subject?.name ||
                attempt.quiz?.topic?.course?.name ||
                'General';

            if (!subjectMap[subject]) {
                subjectMap[subject] = { name: subject, totalScore: 0, totalQuestions: 0, attempts: 0 };
            }

            const score = calculateTotalScore(attempt);
            const total = calculateTotalPossibleMarks(attempt);

            if (total > 0) {
                subjectMap[subject].totalScore += score;
                subjectMap[subject].totalQuestions += total;
                subjectMap[subject].attempts += 1;
            }
        });

        return Object.values(subjectMap).map(subject => ({
            ...subject,
            avgPercentage: subject.totalQuestions > 0
                ? Math.min(100, Math.round((subject.totalScore / subject.totalQuestions) * 100))
                : 0
        }));
    };

    const overallStats = calculateOverallStats();
    const subjectPerformance = calculateSubjectPerformance();
    const overallPercentage = overallStats.avgPercentage;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-content">
                <div className="performance-page">
                    {/* Page Header */}
                    <div className="page-header">
                        <div>
                            <h1>Performance Dashboard</h1>
                            <p>Track your quiz performance and progress</p>
                        </div>
                    </div>

                    {loading && <div className="loading-state">Loading performance data...</div>}
                    {error && <div className="error-state">{error}</div>}

                    {!loading && !error && (
                        <>
                            {/* Stats Overview */}
                            <div className="stats-overview">
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: getPerformanceColor(overallPercentage) + '15', color: getPerformanceColor(overallPercentage) }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 3v18h18" />
                                            <path d="M18 17V9" />
                                            <path d="M13 17V5" />
                                            <path d="M8 17v-3" />
                                        </svg>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-label">Overall Score</span>
                                        <span className="stat-value" style={{ color: getPerformanceColor(overallPercentage) }}>
                                            {overallPercentage}%
                                        </span>
                                        <span className="stat-grade">{getPerformanceGrade(overallPercentage)}</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: '#10b98115', color: '#10b981' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-label">Correct Answers</span>
                                        <span className="stat-value">{overallStats.totalScore}/{overallStats.totalQuestions}</span>
                                        <span className="stat-grade">{overallPercentage}% Accuracy</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: '#8b5cf615', color: '#8b5cf6' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <path d="M14 2v6h6" />
                                            <path d="M16 13H8" />
                                            <path d="M16 17H8" />
                                            <path d="M10 9H8" />
                                        </svg>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-label">Total Quizzes</span>
                                        <span className="stat-value">{overallStats.totalAttempts}</span>
                                        <span className="stat-grade">Completed</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 6v6l4 2" />
                                        </svg>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-label">Performance Level</span>
                                        <span className="stat-value" style={{ color: getPerformanceColor(overallPercentage) }}>
                                            {getPerformanceLevel(overallPercentage)}
                                        </span>
                                        <div className="level-bar">
                                            <div className="level-bar-fill" style={{
                                                width: `${overallPercentage}%`,
                                                background: getPerformanceColor(overallPercentage)
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subject Performance */}
                            {subjectPerformance.length > 0 && (
                                <div className="section">
                                    <h2 className="section-title">Subject Performance</h2>
                                    <div className="subject-list">
                                        {subjectPerformance.map((subject, index) => (
                                            <div key={index} className="subject-item">
                                                <div className="subject-info">
                                                    <span className="subject-name">{subject.name}</span>
                                                    <span className="subject-meta">{subject.attempts} quiz{subject.attempts !== 1 ? 'zes' : ''} · {subject.totalScore}/{subject.totalQuestions} correct</span>
                                                </div>
                                                <div className="subject-performance">
                                                    <div className="performance-bar">
                                                        <div className="performance-bar-fill" style={{
                                                            width: `${subject.avgPercentage}%`,
                                                            background: getPerformanceColor(subject.avgPercentage)
                                                        }}></div>
                                                    </div>
                                                    <span className="performance-percentage" style={{ color: getPerformanceColor(subject.avgPercentage) }}>
                                                        {subject.avgPercentage}%
                                                    </span>
                                                    <span className="performance-badge" style={{
                                                        background: getPerformanceColor(subject.avgPercentage),
                                                        color: 'white'
                                                    }}>
                                                        {getPerformanceGrade(subject.avgPercentage)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Performance Chart */}
                            {stats?.attempts && stats.attempts.length > 0 && (
                                <div className="section">
                                    <h2 className="section-title">Performance Trend</h2>
                                    <div className="chart-container">
                                        <canvas id="performanceChart" width="800" height="250"></canvas>
                                    </div>
                                </div>
                            )}

                            {/* Recent Attempts */}
                            {stats?.attempts && stats.attempts.length > 0 && (
                                <div className="section">
                                    <h2 className="section-title">Recent Attempts</h2>
                                    <div className="attempts-list">
                                        {stats.attempts.slice(0, 10).map((attempt, index) => {
                                            const score = calculateTotalScore(attempt);
                                            const total = calculateTotalPossibleMarks(attempt);
                                            const percentage = total > 0 ? Math.min(100, Math.round((score / total) * 100)) : 0;
                                            const fullyGraded = isFullyGraded(attempt);

                                            return (
                                                <div key={attempt.id || index} className="attempt-item">
                                                    <div className="attempt-main">
                                                        <div className="attempt-title">
                                                            {attempt.quiz?.title || `Quiz ${index + 1}`}
                                                            {attempt.quiz?.difficulty && (
                                                                <span className={`difficulty-badge difficulty-${attempt.quiz.difficulty.toLowerCase()}`}>
                                                                    {attempt.quiz.difficulty}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="attempt-subject">
                                                            {attempt.quiz?.topic?.title || attempt.quiz?.topic?.subject?.name || attempt.quiz?.topic?.course?.name || 'General'}
                                                        </div>
                                                    </div>
                                                    <div className="attempt-progress-panel">
                                                        <div className="progress-bar">
                                                            <div className="progress-bar-fill" style={{ width: `${percentage}%`, background: getPerformanceColor(percentage) }}></div>
                                                        </div>
                                                        <span className="percentage-text">{percentage}%</span>
                                                    </div>
                                                    <div className="attempt-stats">
                                                        <span className="attempt-score">{score}/{total}</span>
                                                        <span className="attempt-badge" style={{
                                                            background: getPerformanceColor(percentage),
                                                            color: 'white'
                                                        }}>
                                                            {getPerformanceGrade(percentage)}
                                                        </span>
                                                        {!fullyGraded && (
                                                            <span className="grading-badge" title="Some answers are pending grading">
                                                                ⏳ Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Performance Insights */}
                            <div className="section">
                                <h2 className="section-title">Insights</h2>
                                <div className="insights-container">
                                    {overallPercentage >= 80 ? (
                                        <div className="insight-box success">
                                            <div className="insight-icon">
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="8" r="6" />
                                                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                                                </svg>
                                            </div>
                                            <div className="insight-content">
                                                <strong>Excellent Work!</strong>
                                                <p>You're performing exceptionally well. Keep up the great work!</p>
                                            </div>
                                        </div>
                                    ) : overallPercentage >= 60 ? (
                                        <div className="insight-box good">
                                            <div className="insight-icon">
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M7 10v12" />
                                                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                                                </svg>
                                            </div>
                                            <div className="insight-content">
                                                <strong>Good Progress!</strong>
                                                <p>You're doing well. Focus on areas where you can improve further.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="insight-box needs-work">
                                            <div className="insight-icon">
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                                </svg>
                                            </div>
                                            <div className="insight-content">
                                                <strong>Keep Practicing!</strong>
                                                <p>Stay consistent with your studies and you'll see improvement.</p>
                                            </div>
                                        </div>
                                    )}

                                    {subjectPerformance.length > 0 && subjectPerformance.some(s => s.avgPercentage < 60) && (
                                        <div className="insight-box info">
                                            <div className="insight-icon">
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                                                    <path d="M9 18h6" />
                                                    <path d="M10 22h4" />
                                                </svg>
                                            </div>
                                            <div className="insight-content">
                                                <strong>Focus Areas</strong>
                                                <p>Consider reviewing: {subjectPerformance.filter(s => s.avgPercentage < 60).map(s => s.name).join(', ')}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Performance;

function drawCharts(stats) {
    if (!stats?.attempts || stats.attempts.length === 0) return;

    const calculateTotalScore = (attempt) => {
        // Score is count of correct answers, manualScore is sum of SAQ marks
        const mcqScore = Number(attempt.score) || 0;
        const manualScore = Number(attempt.manualScore) || 0;
        return mcqScore + manualScore;
    };

    const calculateTotalPossibleMarks = (attempt) => {
        // Total questions for percentage calculation
        return Number(attempt.totalQuestions || attempt.total) || 1;
    };

    try {
        const canvas = document.getElementById('performanceChart');
        if (!canvas || !canvas.getContext) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const sortedAttempts = [...stats.attempts]
            .sort((a, b) => new Date(a.submittedAt || a.attemptedAt || a.createdAt) - new Date(b.submittedAt || b.attemptedAt || b.createdAt))
            .slice(-10);

        ctx.clearRect(0, 0, width, height);

        // Draw grid with purple theme
        ctx.strokeStyle = '#ede9fe';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            ctx.fillStyle = '#8b5cf6';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${100 - i * 25}%`, padding - 10, y + 4);
        }

        // Create gradient for line
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#a78bfa');

        // Draw line
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        sortedAttempts.forEach((attempt, index) => {
            const score = calculateTotalScore(attempt);
            const total = calculateTotalPossibleMarks(attempt);
            const percentage = total > 0 ? (score / total) * 100 : 0;

            const x = padding + (chartWidth / (sortedAttempts.length - 1 || 1)) * index;
            const y = padding + chartHeight - (percentage / 100) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points with gradient
        sortedAttempts.forEach((attempt, index) => {
            const score = calculateTotalScore(attempt);
            const total = calculateTotalPossibleMarks(attempt);
            const percentage = total > 0 ? Math.min(100, (score / total) * 100) : 0;

            const x = padding + (chartWidth / (sortedAttempts.length - 1 || 1)) * index;
            const y = padding + chartHeight - (percentage / 100) * chartHeight;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#8b5cf6';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();

            // X-axis labels
            ctx.fillStyle = '#8b5cf6';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Q${index + 1}`, x, height - padding + 18);
        });
    } catch (e) {
        console.warn('Chart draw failed', e);
    }
}
