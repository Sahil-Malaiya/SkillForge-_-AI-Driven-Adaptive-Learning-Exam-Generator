import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { progressService } from '../services/progressService';
import { topicService } from '../services/topicService';
import ProgressCard from '../components/ProgressCard';
import TopicDetailModal from '../components/TopicDetailModal';
import QuizTaker from '../components/QuizTaker';
import QuizResult from '../components/QuizResult';
import { studentQuizService } from '../services/studentQuizService';

function StudentDashboard() {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('Dashboard');
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [quizResult, setQuizResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user = authService.getCurrentUser()?.user || authService.getCurrentUser();
    const studentId = user?.userId || user?.id || user?.userId;

    useEffect(() => {
        if (activeMenu === 'Dashboard') {
            fetchDashboardData();
        }
    }, [activeMenu]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await progressService.getDashboardData();
            setDashboardData(data);
        } catch (err) {
            console.error('Error fetching dashboard:', err);
            setError('Failed to load dashboard data. Using demo data.');
            // Set demo data for testing
            setDashboardData({
                currentDifficulty: 'EASY',
                lastQuizScore: 0,
                completionStatus: 'Not yet completed',
                progressCards: [],
                nextSuggestion: null
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = async (topicId) => {
        try {
            const topic = await topicService.getTopicById(topicId);
            setSelectedTopic(topic);
            setShowTopicModal(true);
        } catch (err) {
            console.error('Error fetching topic:', err);
            alert('Failed to load topic details');
        }
    };

    const handleStartQuiz = async (topicId) => {
        try {
            setLoading(true);
            const difficulty = dashboardData?.currentDifficulty || 'EASY';
            const resp = await studentQuizService.generateQuiz(studentId, { topicId, difficulty });
            const mapped = {
                id: resp.quiz.id,
                title: `Adaptive Quiz - ${resp.quiz.topic?.title || 'Topic'}`,
                timeLimit: 15,
                questions: resp.questions.map(q => ({
                    id: q.id,
                    questionText: q.question,
                    optionA: q.optionA,
                    optionB: q.optionB,
                    optionC: q.optionC,
                    optionD: q.optionD
                }))
            };
            setCurrentQuiz(mapped);
            setShowTopicModal(false);
        } catch (err) {
            console.error('Error loading quiz:', err);
            alert('Failed to load quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuizSubmit = async (submission) => {
        try {
            setLoading(true);
            const result = await studentQuizService.submitQuiz(studentId, submission.quizId, submission);
            setQuizResult(result);
            setCurrentQuiz(null);
            // Refresh dashboard data
            fetchDashboardData();
        } catch (err) {
            console.error('Error submitting quiz:', err);
            alert('Failed to submit quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuizCancel = () => {
        if (window.confirm('Are you sure you want to cancel this quiz? Your progress will be lost.')) {
            setCurrentQuiz(null);
        }
    };

    const handleResultClose = () => {
        setQuizResult(null);
        fetchDashboardData();
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const menuItems = [
        {
            name: 'Dashboard',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
        },
        {
            name: 'My Courses',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        },
        {
            name: 'AI Quiz',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
        },
        {
            name: 'Profile',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        },
        {
            name: 'Performance',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><polyline points="3 13 9 7 13 11 21 3" /></svg>
        },
    ];

    // Render quiz taker if quiz is active
    if (currentQuiz) {
        return (
            <div className="dashboard-layout">
                <div className="main-content" style={{ marginLeft: 0, width: '100%' }}>
                    <QuizTaker
                        quiz={currentQuiz}
                        onSubmit={handleQuizSubmit}
                        onCancel={handleQuizCancel}
                    />
                </div>
            </div>
        );
    }

    // Render quiz result if available
    if (quizResult) {
        return (
            <div className="dashboard-layout">
                <div className="main-content" style={{ marginLeft: 0, width: '100%' }}>
                    <QuizResult
                        result={quizResult}
                        onClose={handleResultClose}
                        onRetry={() => {
                            setQuizResult(null);
                            // Could reload the same quiz here
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-brand">SkillForge</div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <div
                            key={item.name}
                            className={`sidebar-item ${activeMenu === item.name ? 'active' : ''}`}
                            onClick={() => {
                                setActiveMenu(item.name);
                                if (item.name === 'Profile') {
                                    navigate('/student-dashboard/profile');
                                } else if (item.name === 'My Courses') {
                                    navigate('/student-dashboard/my-courses');
                                } else if (item.name === 'AI Quiz') {
                                    navigate('/student-dashboard/ai-quiz');
                                } else if (item.name === 'Performance') {
                                    navigate('/student-dashboard/performance');
                                }
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                            {item.name}
                        </div>
                    ))}
                    <div className="sidebar-item" onClick={handleLogout}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </span>
                        Logout
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="content-header">
                    <h1>Student Dashboard</h1>
                    <p>Hello, {user?.fullName || 'Student'}</p>
                </div>

                <div className="content-body">
                    {loading ? (
                        <div className="loading-message">Loading...</div>
                    ) : activeMenu === 'Dashboard' && dashboardData ? (
                        <>
                            {/* Dashboard Header Info */}
                            <div className="dashboard-info">
                                <div className="info-card">
                                    <strong>Difficulty:</strong> {dashboardData.currentDifficulty}
                                </div>
                                <div className="info-card">
                                    <strong>Last Quiz Score:</strong> {dashboardData.lastQuizScore}
                                </div>
                                <div className="info-card status">
                                    {dashboardData.completionStatus === 'Not yet completed' && '❌ '}
                                    {dashboardData.completionStatus}
                                </div>
                            </div>

                            {/* Your Progress Section */}
                            <div className="progress-section">
                                <h2>Your Progress</h2>
                                {dashboardData.progressCards && dashboardData.progressCards.length > 0 ? (
                                    <div className="progress-cards-grid">
                                        {dashboardData.progressCards.map((progress) => (
                                            <ProgressCard
                                                key={progress.id}
                                                progress={progress}
                                                onClick={handleCardClick}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-data">No progress data yet. Start taking quizzes to see your progress!</p>
                                )}
                            </div>

                            {/* Next Suggestion Section */}
                            {dashboardData.nextSuggestion && (
                                <div className="suggestion-section">
                                    <h2>Next Suggested Lesson</h2>
                                    <div className="suggestion-card">
                                        <h3>{dashboardData.nextSuggestion.title}</h3>
                                        <p><strong>Suggested Difficulty:</strong> {dashboardData.nextSuggestion.difficulty}</p>
                                        <div className="suggestion-links">
                                            {dashboardData.nextSuggestion.videoUrl && (
                                                <a href={dashboardData.nextSuggestion.videoUrl} target="_blank" rel="noopener noreferrer" className="suggestion-link">
                                                    📹 Watch Video
                                                </a>
                                            )}
                                            {dashboardData.nextSuggestion.pdfUrl && (
                                                <a href={dashboardData.nextSuggestion.pdfUrl} target="_blank" rel="noopener noreferrer" className="suggestion-link">
                                                    📄 Download PDF
                                                </a>
                                            )}
                                            {dashboardData.nextSuggestion.externalLink && (
                                                <a href={dashboardData.nextSuggestion.externalLink} target="_blank" rel="noopener noreferrer" className="suggestion-link">
                                                    🔗 Open External Link
                                                </a>
                                            )}
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleStartQuiz(dashboardData.nextSuggestion.topicId)}
                                        >
                                            Start Quiz
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="dashboard-cards">
                            <div className="dashboard-card">
                                <h3>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}>
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                    </svg>
                                    Continue Learning
                                </h3>
                                <p>Explore your enrolled courses and continue your journey.</p>
                                <button className="btn btn-primary">View Courses</button>
                            </div>

                            <div className="dashboard-card">
                                <h3>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                    AI Quiz
                                </h3>
                                <p>Take adaptive AI generated quizzes based on your progress.</p>
                                <button className="btn btn-primary">Start Quiz</button>
                            </div>

                            <div className="dashboard-card">
                                <h3>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}>
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                    </svg>
                                    Your Performance
                                </h3>
                                <p>Check your learning growth and analytics.</p>
                                <button className="btn btn-primary">View Stats</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Topic Detail Modal */}
            {showTopicModal && selectedTopic && (
                <TopicDetailModal
                    topic={selectedTopic}
                    onClose={() => setShowTopicModal(false)}
                />
            )}
        </div>
    );
}

export default StudentDashboard;
