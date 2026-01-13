import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { studentQuizService } from '../services/studentQuizService';
import QuizTaker from '../components/QuizTaker';
import QuizResult from '../components/QuizResult';
import Sidebar from '../components/Sidebar';
import './StudentQuizzes.css';

function StudentQuizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [quizResult, setQuizResult] = useState(null);
    const [gradingPending, setGradingPending] = useState(false);

    const user = authService.getCurrentUser()?.user || authService.getCurrentUser();
    const studentId = user?.userId || user?.id || user?.userId;

    useEffect(() => {
        fetchAssignedQuizzes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAssignedQuizzes = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/students/${studentId}/assignments`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            console.log('Assigned quizzes response:', data);

            // Be tolerant of response shape: prefer array, otherwise try common container fields
            const list = Array.isArray(data)
                ? data
                : (data.assignedQuizzes || data.assignments || data.quizzes || []);

            setQuizzes(list || []);
        } catch (err) {
            console.error('Failed to fetch assigned quizzes', err);
            setError('Failed to load assigned quizzes. See console for details.');
        } finally {
            setLoading(false);
        }
    };

    const onStart = async (quiz) => {
        try {
            setLoading(true);
            const quizId = quiz.id || quiz.quizId || (quiz.quiz && quiz.quiz.id);
            if (!quizId) throw new Error('Cannot determine quiz id to start');
            // Compute frontend-driven nextDifficulty based on available last score
            const lastPct = Number(quiz.lastScore ?? quiz.percentage ?? quiz.progress ?? 0);
            const computeNext = (pct) => {
                if (pct < 50) return 'EASY';
                if (pct <= 75) return 'MEDIUM';
                if (pct < 90) return 'HARD';
                return 'ADVANCED';
            };
            const nextDifficulty = computeNext(lastPct);

            // Pass nextDifficulty in payload (frontend-only guidance)
            const resp = await studentQuizService.generateQuiz(studentId, { quizId, nextDifficulty });
            console.log('generateQuiz response:', resp);

            const mapped = {
                id: resp.quiz?.id || resp.id || quizId,
                title: resp.quiz?.title || resp.quiz?.topic?.title || resp.title || `Quiz ${quizId}`,
                timeLimit: resp.timeLimit || resp.quiz?.timeLimit || 15,
                nextDifficulty: resp.nextDifficulty || resp.next_difficulty || nextDifficulty,
                questions: Array.isArray(resp.questions)
                    ? resp.questions.map(q => ({
                        id: q.id || q.questionId,
                        questionText: q.question || q.questionText,
                        optionA: q.optionA || q.options?.[0] || null,
                        optionB: q.optionB || q.options?.[1] || null,
                        optionC: q.optionC || q.options?.[2] || null,
                        optionD: q.optionD || q.options?.[3] || null,
                        type: q.type || ((q.optionA || q.options?.[0]) ? 'MCQ' : 'SAQ')
                    }))
                    : (resp.quiz?.questions || []),
                topicId: resp.quiz?.topicId || resp.topicId || (quiz.quiz && quiz.quiz.topicId) || quiz.topicId
            };

            setCurrentQuiz(mapped);
        } catch (err) {
            console.error('Failed to start quiz', err);
            setError('Failed to start quiz. See console for details.');
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();

    const handleQuizSubmit = async (submission) => {
        try {
            setLoading(true);
            const resp = await studentQuizService.submitQuiz(studentId, submission.quizId || submission.id || submission.quiz?.id, submission);
            console.log('submitQuiz response:', resp);

            // Map backend response to the UI shape expected by QuizResult (be defensive)
            const totalQuestions = resp.totalQuestions || resp.total || resp.total_questions || 0;
            const accuracy = typeof resp.accuracy === 'number' ? resp.accuracy : (resp.accuracy ? Number(resp.accuracy) : null);
            const score = typeof resp.score === 'number' ? resp.score : (accuracy !== null ? accuracy : 0);
            const correctAnswers = resp.correctAnswers ?? resp.correct_answers ?? (totalQuestions && accuracy != null ? Math.round((accuracy / (accuracy > 1 ? 100 : 1)) * totalQuestions) : undefined);

            const mappedResult = {
                score: Number(score) || 0,
                totalQuestions: Number(totalQuestions) || (Array.isArray(resp.questionResults) ? resp.questionResults.length : 0),
                accuracy: Number(accuracy) || 0,
                attemptId: resp.attemptId || resp.attempt_id || resp.id || null,
                correctAnswers: correctAnswers !== undefined ? correctAnswers : null,
                passed: resp.passed ?? (Number(score) >= 50),
                questionResults: resp.questionResults || resp.question_results || [],
                nextDifficulty: resp.nextDifficulty || resp.next_difficulty || 'MEDIUM',
                nextDifficulty: resp.nextDifficulty || resp.next_difficulty || 'MEDIUM',
                topicId: submission.topicId || (currentQuiz && currentQuiz.topicId),
                quizId: submission.quizId || submission.id || submission.quiz?.id
            };

            if (resp.fullyAssessed === false) {
                setGradingPending(true);
                setCurrentQuiz(null);
            } else {
                setQuizResult(mappedResult);
                setCurrentQuiz(null);
            }
            // refresh list after submit (optional)
            fetchAssignedQuizzes();
        } catch (err) {
            console.error('Error submitting quiz:', err);
            setError('Failed to submit quiz. See console.');
        } finally {
            setLoading(false);
        }
    };


    const handleQuizCancel = () => {
        if (window.confirm('Cancel this quiz? Progress will be lost.')) setCurrentQuiz(null);
    };

    const handleRetake = () => {
        if (!quizResult || !quizResult.quizId) {
            console.error('Retake failed: missing quizId in result', quizResult);
            return;
        }
        const q = quizzes.find(x => String(x.id) === String(quizResult.quizId) || String(x.quizId) === String(quizResult.quizId));
        if (q) {
            setQuizResult(null);
            onStart(q);
        } else {
            console.error('Retake failed: quiz not found in list', quizResult.quizId);
        }
    };

    const handleResultClose = () => {
        setQuizResult(null);
        setCurrentQuiz(null);
        setGradingPending(false);
        // navigate back to the assigned quizzes route
        navigate('/student-dashboard/quizzes');
        // refresh list
        fetchAssignedQuizzes();
    };

    const handlePendingClose = () => {
        setGradingPending(false);
        setCurrentQuiz(null);
        navigate('/student-dashboard/quizzes');
        fetchAssignedQuizzes();
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className={`main-content ${(currentQuiz || quizResult) ? 'quiz-active' : ''}`} style={{ background: '#ffffff' }}>
                <div className="page-quizzes">
                    {!currentQuiz && !quizResult && !gradingPending ? (
                        <>
                            <div className="content-header">
                                <h1>Assigned Quizzes</h1>
                                <p style={{ color: '#7f8c8d' }}>Practice and improve your skills with available quizzes.</p>
                            </div>

                            <div className="content-body">
                                {error && <div className="quizzes-error">{error}</div>}
                                {loading && <p>Loading assigned quizzes...</p>}
                                {!loading && quizzes.length === 0 && <p>No assigned quizzes found.</p>}

                                <div className="quizzes-grid">
                                    {quizzes
                                        .filter(q => {
                                            const pct = Number(q.lastScore ?? q.percentage ?? q.progress ?? (q.latestAttempt && q.latestAttempt.percentage) ?? 0);
                                            return pct < 90;
                                        })
                                        .map((q, i) => {
                                            const title = q.title || q.name || (q.quiz && q.quiz.title) || `Quiz ${i + 1}`;
                                            const duration = q.duration || q.timeLimit || (q.quiz && q.quiz.timeLimit) || '—';
                                            const status = (q.status || q.state || 'Assigned').toString();
                                            const pct = Number(q.lastScore ?? q.percentage ?? q.progress ?? (q.latestAttempt && q.latestAttempt.percentage) ?? NaN);
                                            const badgeColor = (() => {
                                                if (Number.isNaN(pct)) return '#6c757d';
                                                if (pct >= 90) return '#28a745';
                                                if (pct >= 75) return '#0d6efd';
                                                if (pct >= 50) return '#fd7e14';
                                                return '#dc3545';
                                            })();
                                            return (
                                                <div key={q.id || q.quizId || i} className="quiz-card">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <h3>{title}</h3>
                                                        <div className="status-pill" style={{ background: badgeColor, color: '#fff', padding: '4px 8px', borderRadius: 6 }}>{status}</div>
                                                    </div>

                                                    <div className="quiz-meta">
                                                        <div><strong>Course:</strong> {q.courseName || '—'}</div>
                                                        <div><strong>Duration:</strong> {duration}</div>
                                                    </div>

                                                    <div className="quiz-actions">
                                                        {status === 'SUBMITTED' ? (
                                                            q.fullyAssessed === false ? (
                                                                <div className="ongoing-assessment">Ongoing Assessment</div>
                                                            ) : (
                                                                <>
                                                                    <button className="btn-result" onClick={() => {
                                                                        setQuizResult({
                                                                            score: q.score,
                                                                            totalQuestions: duration,
                                                                            accuracy: (q.score * 100) / duration,
                                                                            passed: q.score >= (duration / 2),
                                                                            quizId: q.id || q.quizId,
                                                                            topicId: q.topicId || (q.quiz && q.quiz.topicId)
                                                                        });
                                                                    }}>View Result</button>
                                                                    <button
                                                                        className="btn-start"
                                                                        style={{ marginLeft: '10px' }}
                                                                        onClick={() => onStart(q)}
                                                                    >
                                                                        Retake Quiz
                                                                    </button>
                                                                </>
                                                            )
                                                        ) : (
                                                            <button
                                                                className="btn-start"
                                                                onClick={() => onStart(q)}
                                                                disabled={status === 'SUBMITTED' || status === 'COMPLETED'}
                                                            >
                                                                Start Quiz
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            maxWidth: 850,
                            width: '90%',
                            margin: '40px auto',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            {error && <div className="quizzes-error">{error}</div>}
                            {currentQuiz && (
                                <QuizTaker
                                    quiz={currentQuiz}
                                    onSubmit={handleQuizSubmit}
                                    onCancel={handleQuizCancel}
                                />
                            )}

                            {quizResult && (
                                <QuizResult
                                    result={quizResult}
                                    onClose={handleResultClose}
                                    onRetry={handleRetake}
                                />
                            )}

                            {gradingPending && (
                                <div className="quiz-result" style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
                                    <h2 style={{ color: '#f39c12', marginBottom: '16px' }}>Grading Ongoing</h2>
                                    <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '30px' }}>
                                        This quiz contains short answer questions that require manual grading by your instructor.
                                        You can check back later to view your full results.
                                    </p>
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '10px 24px', fontSize: '1rem' }}
                                        onClick={handlePendingClose}
                                    >
                                        Back to Assigned Quizzes
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}

export default StudentQuizzes;
