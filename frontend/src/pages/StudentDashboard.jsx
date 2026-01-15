import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { studentQuizService } from '../services/studentQuizService';
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

            setDashboardData({
                totalAttempts: Number(attemptCount),
                avgScore: avgScore,
                enrolledCourses: 0, // TODO: Get from API
                attempts: attempts,
                recentQuizzes: attempts.slice(-3).reverse()
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
                                {/* Enrolled Courses Section */}
                                <div className="dashboard-section">
                                    <div className="section-header">
                                        <h2>Enrolled Courses</h2>
                                        <button className="see-all-btn" onClick={() => navigate('/student-courses')}>
                                            See all →
                                        </button>
                                    </div>
                                    <div className="courses-grid">
                                        {/* Placeholder course cards */}
                                        <div className="course-card">
                                            <div className="course-thumbnail">
                                                <svg width="100%" height="120" viewBox="0 0 200 120">
                                                    <rect width="200" height="120" fill="#e0e7ff" />
                                                    <text x="50%" y="50%" textAnchor="middle" fill="#667eea" fontSize="16">Course 1</text>
                                                </svg>
                                            </div>
                                            <div className="course-info">
                                                <h3>Course Title</h3>
                                                <div className="course-progress">
                                                    <div className="progress-bar">
                                                        <div className="progress-fill" style={{ width: '60%' }}></div>
                                                    </div>
                                                    <span className="progress-text">60% Complete</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="course-card">
                                            <div className="course-thumbnail">
                                                <svg width="100%" height="120" viewBox="0 0 200 120">
                                                    <rect width="200" height="120" fill="#fce7f3" />
                                                    <text x="50%" y="50%" textAnchor="middle" fill="#ec4899" fontSize="16">Course 2</text>
                                                </svg>
                                            </div>
                                            <div className="course-info">
                                                <h3>Course Title</h3>
                                                <div className="course-progress">
                                                    <div className="progress-bar">
                                                        <div className="progress-fill" style={{ width: '40%' }}></div>
                                                    </div>
                                                    <span className="progress-text">40% Complete</span>
                                                </div>
                                            </div>
                                        </div>
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
