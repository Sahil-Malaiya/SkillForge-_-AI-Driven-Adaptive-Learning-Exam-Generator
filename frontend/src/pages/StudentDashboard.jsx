import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { studentQuizService } from '../services/studentQuizService';
import { progression } from '../utils/progression';
import Sidebar from '../components/Sidebar';
import './StudentDashboard.css';

function StudentDashboard() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user = authService.getCurrentUser()?.user || authService.getCurrentUser();
    const studentId = user?.userId || user?.id;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = authService.getCurrentUser()?.user || authService.getCurrentUser();
            const resp = await studentQuizService.getProgress(currentUser || studentId);

            const attempts = resp?.attempts || [];
            const attemptCount = resp?.totalAttempts ?? attempts.length ?? 0;

            // Calculate average score
            let avgScore = 0;
            if (attempts.length > 0) {
                const scores = attempts.map(a => {
                    const autoScore = Number(a.score || 0);
                    const manualScore = Number(a.manualScore || 0);
                    const total = Number(a.totalQuestions || 0);
                    return total > 0 ? Math.min(100, Math.round(((autoScore + manualScore) / total) * 100)) : 0;
                });
                avgScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
            }

            // Finding the latest recommendation
            let recommendation = null;
            if (attempts.length > 0) {
                const latest = attempts[attempts.length - 1];
                const topicId = latest.quiz?.topic?.id || latest.quiz?.topicId;
                if (topicId) {
                    const autoScore = Number(latest.score || 0);
                    const manualScore = Number(latest.manualScore || 0);
                    const total = Number(latest.totalQuestions || 0);
                    const pct = total > 0 ? ((autoScore + manualScore) / total) * 100 : 0;

                    const nextTarget = await progression.findNextTarget(topicId);
                    const context = await progression.getTopicContext(topicId);

                    recommendation = {
                        topicId: topicId,
                        topicTitle: latest.quiz?.topic?.title || latest.quiz?.title || 'Current Topic',
                        percentage: Math.round(pct),
                        nextTarget: nextTarget,
                        context: context
                    };
                }
            }

            setDashboardData({
                totalAttempts: Number(attemptCount),
                avgScore: avgScore,
                enrolledCourses: 0,
                attempts: attempts,
                recentQuizzes: attempts.slice(-3).reverse(),
                recommendation: recommendation
            });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
            setDashboardData({
                totalAttempts: 0,
                avgScore: 0,
                enrolledCourses: 0,
                attempts: [],
                recentQuizzes: []
            });
        } finally {
            setLoading(false);
        }
    };

    const getCurrentDate = () => {
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="main-content">
                <div className="student-dashboard">
                    {/* Welcome Banner */}
                    <div className="welcome-banner">
                        <div className="welcome-content">
                            <p className="welcome-date">{getCurrentDate()}</p>
                            <h1 className="welcome-title">Welcome back, {user?.fullName || 'Student'}!</h1>
                            <p className="welcome-subtitle">Always stay updated in your student portal</p>
                        </div>
                        <div className="welcome-illustration">
                            <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                                <circle cx="100" cy="75" r="50" fill="rgba(255,255,255,0.2)" />
                                <rect x="70" y="50" width="60" height="50" rx="5" fill="rgba(255,255,255,0.3)" />
                                <circle cx="85" cy="65" r="8" fill="rgba(255,255,255,0.5)" />
                                <circle cx="115" cy="65" r="8" fill="rgba(255,255,255,0.5)" />
                            </svg>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">Loading dashboard...</div>
                    ) : (
                        <>
                            {/* Statistics Cards */}
                            <div className="stats-grid">
                                <div className="stat-card stat-purple">
                                    <div className="stat-icon">📝</div>
                                    <div className="stat-value">{dashboardData?.totalAttempts || 0}</div>
                                    <div className="stat-label">Quizzes Attempted</div>
                                </div>
                                <div className="stat-card stat-pink">
                                    <div className="stat-icon">🎯</div>
                                    <div className="stat-value">{dashboardData?.avgScore || 0}%</div>
                                    <div className="stat-label">Average Score</div>
                                </div>
                                <div className="stat-card stat-blue">
                                    <div className="stat-icon">📚</div>
                                    <div className="stat-value">{dashboardData?.enrolledCourses || 0}</div>
                                    <div className="stat-label">Enrolled Courses</div>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="dashboard-content-grid">
                                {/* Recommended for You Section */}
                                <div className="dashboard-section recommendation-section">
                                    <div className="section-header">
                                        <h2>Recommended for You</h2>
                                    </div>
                                    <div className="recommendation-container">
                                        {dashboardData?.recommendation ? (
                                            <div
                                                className={`recommendation-card ${dashboardData.recommendation.percentage < 60 ? 'review-needed' : 'next-step'}`}
                                                onClick={() => {
                                                    const rec = dashboardData.recommendation;
                                                    if (rec.percentage < 60 && rec.context) {
                                                        navigate(`/student-dashboard/my-courses/${rec.context.courseId}/subjects/${rec.context.subjectId}/topics`);
                                                    } else if (rec.nextTarget) {
                                                        const target = rec.nextTarget;
                                                        if (target.type === 'TOPIC') {
                                                            navigate(`/student-dashboard/my-courses/${target.courseId}/subjects/${target.subjectId}/topics`);
                                                        } else if (target.type === 'SUBJECT') {
                                                            navigate(`/student-dashboard/my-courses/${target.courseId}/subjects/${target.id}/topics`);
                                                        } else if (target.type === 'COURSE') {
                                                            navigate(`/student-dashboard/my-courses/${target.id}/subjects`);
                                                        }
                                                    }
                                                }}
                                            >
                                                <div className="recommendation-badge">
                                                    {dashboardData.recommendation.percentage < 60 ? 'NEEDS REVIEW' : 'NEXT STEP'}
                                                </div>
                                                <div className="recommendation-info">
                                                    <div className="recommendation-type">
                                                        {dashboardData.recommendation.percentage < 60 ? 'Reviewing:' : 'Up Next:'}
                                                    </div>
                                                    <h3 className="recommendation-title">
                                                        {dashboardData.recommendation.percentage < 60
                                                            ? dashboardData.recommendation.topicTitle
                                                            : (dashboardData.recommendation.nextTarget?.title || 'Graduation!')}
                                                    </h3>
                                                    <p className="recommendation-description">
                                                        {dashboardData.recommendation.percentage < 60
                                                            ? `You scored ${dashboardData.recommendation.percentage}% on the last quiz. We recommend reviewing this topic to improve.`
                                                            : `Great job! You've mastered the previous topic. Ready for the next challenge?`}
                                                    </p>
                                                </div>
                                                <div className="recommendation-action">
                                                    <span className="action-text">Continue Learning</span>
                                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="recommendation-card empty-rec" onClick={() => navigate('/student-dashboard/my-courses')}>
                                                <div className="recommendation-badge">GET STARTED</div>
                                                <div className="recommendation-info">
                                                    <h3 className="recommendation-title">Ready to Start?</h3>
                                                    <p className="recommendation-description">Begin your learning journey by exploring courses and subjects tailored for you.</p>
                                                </div>
                                                <div className="recommendation-action">
                                                    <span className="action-text">Explore Courses</span>
                                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Quizzes Section */}
                                <div className="dashboard-section">
                                    <div className="section-header">
                                        <h2>Recent Quizzes</h2>
                                        <button className="see-all-btn" onClick={() => navigate('/student-quizzes')}>
                                            See all →
                                        </button>
                                    </div>
                                    <div className="quizzes-list">
                                        {dashboardData?.recentQuizzes && dashboardData.recentQuizzes.length > 0 ? (
                                            dashboardData.recentQuizzes.map((quiz, idx) => {
                                                const autoScore = Number(quiz.score || 0);
                                                const manualScore = Number(quiz.manualScore || 0);
                                                const total = Number(quiz.totalQuestions || 0);
                                                const percentage = total > 0 ? Math.min(100, Math.round(((autoScore + manualScore) / total) * 100)) : 0;
                                                const date = quiz.attemptedAt ? new Date(quiz.attemptedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

                                                return (
                                                    <div key={idx} className="quiz-item">
                                                        <div className="quiz-info">
                                                            <h4>{quiz.quiz?.title || `Quiz ${idx + 1}`}</h4>
                                                            <p className="quiz-date">{date}</p>
                                                        </div>
                                                        <div className="quiz-score">
                                                            <span className="score-badge">{percentage}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="no-data">No quizzes attempted yet. Start learning!</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Daily Notice Section */}
                            <div className="dashboard-section notice-section">
                                <h2>Daily Notice</h2>
                                <div className="notice-list">
                                    <div className="notice-item">
                                        <div className="notice-icon">📢</div>
                                        <div className="notice-content">
                                            <h4>Welcome to SkillForge!</h4>
                                            <p>Start your learning journey by taking your first quiz.</p>
                                        </div>
                                    </div>
                                    <div className="notice-item">
                                        <div className="notice-icon">🎓</div>
                                        <div className="notice-content">
                                            <h4>New Courses Available</h4>
                                            <p>Check out the latest courses added to your curriculum.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;
