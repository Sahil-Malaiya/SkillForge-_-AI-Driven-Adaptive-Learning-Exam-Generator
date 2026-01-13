import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { progression } from '../utils/progression';
import { topicService } from '../services/topicService';
import './QuizResult.css';

function QuizResult({ result = {}, onClose, onRetry }) {
    const totalQuestions = Number(result.totalQuestions ?? result.total ?? (result.questionResults ? result.questionResults.length : 0) ?? 0);
    const correct = Number(result.correctAnswers ?? result.correct_answers ?? result.correct ?? result.score ?? NaN);

    // Calculate percentage defensively: prefer using number of correct answers when available.
    let percentage = 0;
    if (totalQuestions === 0) {
        percentage = 0;
    } else if (!Number.isNaN(correct)) {
        percentage = Math.round((correct / totalQuestions) * 100);
    } else if (result.score != null) {
        // Fallback: score might already be a percentage or fraction
        const raw = Number(result.score);
        if (!Number.isNaN(raw)) {
            if (raw <= 1) percentage = Math.round(raw * 100);
            else if (raw <= 100) percentage = Math.round(raw);
            else percentage = 0;
        }
    }

    const getScoreColor = (pct) => {
        if (pct >= 90) return '#28a745'; // green
        if (pct >= 75) return '#0d6efd'; // blue
        if (pct >= 50) return '#fd7e14'; // orange
        return '#dc3545'; // red
    };

    const getStatusLabel = (pct) => {
        if (pct < 50) return 'Low / Below Average';
        if (pct <= 75) return 'Average';
        if (pct < 90) return 'Good';
        if (pct <= 95) return 'Very Good';
        return 'Top 1% / Excellent';
    };

    const statusLabel = getStatusLabel(percentage);

    const getScoreMessage = (pct) => {
        if (pct > 95) return 'Outstanding — top performer!';
        if (pct >= 90) return 'Very strong performance.';
        if (pct >= 76) return 'Good work — keep it up.';
        if (pct >= 50) return 'Satisfactory — room to improve.';
        return 'Needs improvement — practice more.';
    };

    const mapNextDifficulty = (pct) => {
        if (pct < 50) return 'EASY';
        if (pct <= 75) return 'MEDIUM';
        if (pct < 90) return 'HARD';
        return 'ADVANCED';
    };

    const nextDifficulty = mapNextDifficulty(percentage);

    const navigate = useNavigate();
    const [nextTarget, setNextTarget] = useState(null);
    const [loadingNext, setLoadingNext] = useState(false);

    useEffect(() => {
        const fetchNextTarget = async () => {
            if (result.topicId || result.quiz?.topicId || result.quiz?.topic?.id) {
                setLoadingNext(true);
                const target = await progression.findNextTarget(result.topicId || result.quiz?.topicId || result.quiz?.topic?.id);
                setNextTarget(target);
                setLoadingNext(false);
            }
        };
        fetchNextTarget();
    }, [result]);

    const handleOpenTarget = async () => {
        if (!nextTarget) return;

        if (nextTarget.type === 'TOPIC') {
            navigate(`/student-dashboard/my-courses?topicId=${nextTarget.id}`);
        } else if (nextTarget.type === 'SUBJECT') {
            // If we have a subject recommendation, we could just go to courses,
            // or we could add a subjectId link if we wanted similar logic.
            navigate('/student-dashboard/my-courses');
        } else if (nextTarget.type === 'COURSE') {
            navigate('/student-dashboard/my-courses');
        }
    };

    return (
        <div className="quiz-result">
            <div className="result-header">
                <div
                    className="score-circle"
                    style={{ borderColor: getScoreColor(percentage) }}
                >
                    <div className="score-value" style={{ color: getScoreColor(percentage) }}>
                        {Number.isFinite(percentage) ? `${percentage}%` : '0%'}
                    </div>
                    <div className="score-label">Your Score</div>
                </div>

                <h2 className={`status ${statusLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                    {statusLabel}
                </h2>

                <p className="score-message">
                    {getScoreMessage(percentage)}
                </p>
            </div>

            <div className="result-stats">
                <div className="stat-item">
                    <div className="stat-value">{correct ?? '—'}</div>
                    <div className="stat-label">Correct</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{(totalQuestions && correct != null) ? (totalQuestions - correct) : '—'}</div>
                    <div className="stat-label">Incorrect</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{totalQuestions}</div>
                    <div className="stat-label">Total</div>
                </div>
            </div>

            <div className="next-recommendation">
                <h3>Recommended Next Step</h3>
                {loadingNext ? (
                    <p>Calculating your next step...</p>
                ) : percentage >= 90 ? (
                    <div className="recommendation-content">
                        {nextTarget && nextTarget.type === 'COMPLETED' ? (
                            <div className="completion-badge">
                                <span className="icon">🏆</span>
                                <p>{nextTarget.message}</p>
                            </div>
                        ) : nextTarget ? (
                            <>
                                <div className="target-info">
                                    <span className="target-type">{nextTarget.type}:</span>
                                    <span className="target-title">{nextTarget.title}</span>
                                </div>
                                <button className="btn btn-primary mt-2" onClick={handleOpenTarget}>
                                    Go to {nextTarget.type.toLowerCase()}
                                </button>
                            </>
                        ) : (
                            <p>Analyzing your performance...</p>
                        )}
                    </div>
                ) : percentage >= 60 ? (
                    <div className="recommendation-content">
                        <div className="target-info">
                            <span className="target-type">STRATEGY:</span>
                            <span className="target-title">Retake Quiz & Review Topic</span>
                        </div>
                        <p className="mt-2 muted">You're doing well! A quick review and another attempt could help you master this topic.</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            {onRetry && <button className="btn btn-primary" onClick={onRetry}>Retake Quiz</button>}
                            <button className="btn btn-outline" onClick={() => navigate(`/student-dashboard/my-courses?topicId=${result.topicId || result.quiz?.topicId}`)}>Review Topic</button>
                        </div>
                    </div>
                ) : (
                    <div className="recommendation-content">
                        <div className="target-info">
                            <span className="target-type">STRATEGY:</span>
                            <span className="target-title">Review Topic Materials</span>
                        </div>
                        <p className="mt-2 muted">It looks like you need a bit more practice. We recommend going through the topic materials again before retaking the quiz.</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            {onRetry && <button className="btn btn-primary" onClick={onRetry}>Retake Quiz</button>}
                            <button className="btn btn-outline" onClick={() => navigate(`/student-dashboard/my-courses?topicId=${result.topicId || result.quiz?.topicId}`)}>
                                Review Topic
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {result.questionResults && result.questionResults.length > 0 && (
                <div className="question-review">
                    <h3>Question Review</h3>
                    {result.questionResults.map((qr, index) => (
                        <div key={index} className={`review-item ${qr.isCorrect ? 'correct' : 'incorrect'}`}>
                            <div className="review-header">
                                <span className="question-number">Q{index + 1}</span>
                                <span className={`result-icon ${qr.isCorrect ? 'correct' : 'incorrect'}`}>
                                    {qr.isCorrect ? '✓' : '✗'}
                                </span>
                            </div>
                            <p className="review-question">{qr.questionText}</p>
                            <div className="review-answers">
                                <p>
                                    <strong>Your answer:</strong>
                                    <span className={qr.isCorrect ? 'correct-answer' : 'wrong-answer'}>
                                        {qr.selectedAnswer || 'Not answered'}
                                    </span>
                                </p>
                                {!qr.isCorrect && (
                                    <p>
                                        <strong>Correct answer:</strong>
                                        <span className="correct-answer">{qr.correctAnswer}</span>
                                    </p>
                                )}
                            </div>
                            {qr.explanation && (
                                <div className="explanation">
                                    <strong>Explanation:</strong> {qr.explanation}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="result-actions">
                <button className="close-btn" onClick={onClose}>
                    Back to Assigned Quizzes
                </button>
            </div>
        </div>
    );
}

export default QuizResult;
