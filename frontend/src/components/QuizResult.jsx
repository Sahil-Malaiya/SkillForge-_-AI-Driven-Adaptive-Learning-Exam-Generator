import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { progression } from '../utils/progression';
import { topicService } from '../services/topicService';
import './QuizResult.css';

function QuizResult({ result = {}, onClose, onRetry }) {
    const totalQuestions = Number(result.totalQuestions ?? result.total ?? (result.questionResults ? result.questionResults.length : 0) ?? 0);
    // Score represents the COUNT of correct answers (each question worth 1 mark)
    // NOT a percentage or weighted score
    const correct = Number(result.correctAnswers ?? result.correct_answers ?? result.correct ?? result.score ?? NaN);

    // Calculate percentage: (correct answers / total questions) * 100
    let percentage = 0;
    if (totalQuestions === 0) {
        percentage = 0;
    } else if (!Number.isNaN(correct)) {
        // Correct is the number of questions answered correctly
        // Cap at 100% to handle any data inconsistencies
        percentage = Math.min(100, Math.round((correct / totalQuestions) * 100));
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
        if (pct >= 80) return '#28a745'; // green - Excellent
        if (pct >= 60) return '#0d6efd'; // blue - Above Average
        if (pct >= 40) return '#fd7e14'; // orange - Below Average
        return '#dc3545'; // red - Poor
    };

    const getStatusLabel = (pct) => {
        if (pct < 40) return 'Poor';
        if (pct < 60) return 'Below Average';
        if (pct < 80) return 'Above Average';
        return 'Excellent';
    };

    const statusLabel = getStatusLabel(percentage);

    const getScoreMessage = (pct) => {
        if (pct >= 80) return 'Outstanding performance!';
        if (pct >= 60) return 'Good work — you passed!';
        if (pct >= 40) return 'Satisfactory — room to improve.';
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
    const [currentTopicContext, setCurrentTopicContext] = useState(null);
    const [loadingNext, setLoadingNext] = useState(false);

    useEffect(() => {
        const fetchNextTarget = async () => {
            const tId = result.topicId || result.quiz?.topicId || result.quiz?.topic?.id;
            if (tId) {
                setLoadingNext(true);
                const target = await progression.findNextTarget(tId);
                const context = await progression.getTopicContext(tId);

                setNextTarget(target);
                setCurrentTopicContext(context);
                setLoadingNext(false);
            }
        };
        fetchNextTarget();
    }, [result]);

    const handleOpenTarget = async () => {
        if (!nextTarget) return;

        if (nextTarget.type === 'TOPIC') {
            // Navigate to the topic list for the subject
            navigate(`/student-dashboard/my-courses/${nextTarget.courseId}/subjects/${nextTarget.subjectId}/topics`);
        } else if (nextTarget.type === 'SUBJECT') {
            // Navigate to the subject list for the course
            navigate(`/student-dashboard/my-courses/${nextTarget.courseId}/subjects`);
        } else if (nextTarget.type === 'COURSE') {
            // Navigate to the subject list for the new course
            navigate(`/student-dashboard/my-courses/${nextTarget.id}/subjects`);
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
                ) : percentage >= 80 ? (
                    <div className="recommendation-content">
                        {nextTarget && nextTarget.type === 'COMPLETED' ? (
                            <div className="completion-badge">
                                <span className="icon">🏆</span>
                                <p>{nextTarget.message}</p>
                            </div>
                        ) : (
                            <>
                                <div className="target-info">
                                    <span className="target-type">STRATEGY:</span>
                                    <span className="target-title">Excellent! Move to Next Topic</span>
                                </div>
                                <p className="mt-2 muted">Outstanding work! You've mastered this topic. Continue your learning journey with the next one.</p>

                                {/* Recommendation (Next Topic) */}
                                {nextTarget && nextTarget.type !== 'COMPLETED' && (
                                    <div className="mt-2" style={{ marginBottom: '10px' }}>
                                        <p style={{ fontSize: '0.9em', fontWeight: 'bold' }}>Recommended:</p>
                                        <div className="target-info" style={{ marginTop: '5px' }}>
                                            <span className="target-type">{nextTarget.type}:</span>
                                            <span className="target-title">{nextTarget.title}</span>
                                        </div>
                                        <button className="btn btn-success mt-1" onClick={handleOpenTarget}>
                                            Go to {nextTarget.type.toLowerCase()}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : percentage >= 60 ? (
                    <div className="recommendation-content">
                        <div className="target-info">
                            <span className="target-type">STRATEGY:</span>
                            <span className="target-title">Good Job! Move Forward or Improve</span>
                        </div>
                        <p className="mt-2 muted">You passed! You can move to the next topic or retake this one to get a perfect score.</p>

                        {/* Recommendation (Next Topic) */}
                        {nextTarget && nextTarget.type !== 'COMPLETED' && (
                            <div className="mt-2" style={{ marginBottom: '10px' }}>
                                <p style={{ fontSize: '0.9em', fontWeight: 'bold' }}>Recommended:</p>
                                <div className="target-info" style={{ marginTop: '5px' }}>
                                    <span className="target-type">{nextTarget.type}:</span>
                                    <span className="target-title">{nextTarget.title}</span>
                                </div>
                                <button className="btn btn-success mt-1" onClick={handleOpenTarget}>
                                    Go to {nextTarget.type.toLowerCase()}
                                </button>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            {onRetry && <button className="btn btn-primary" onClick={onRetry}>Retake Quiz</button>}

                        </div>
                    </div>
                ) : percentage >= 40 ? (
                    <div className="recommendation-content">
                        <div className="target-info">
                            <span className="target-type">STRATEGY:</span>
                            <span className="target-title">Almost There!</span>
                        </div>
                        <p className="mt-2 muted">You need just a bit more to pass (60%). Review the topic and try again!</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            {onRetry && <button className="btn btn-primary" onClick={onRetry}>Retake Quiz</button>}
                            {/* Review Topic Link */}
                            {currentTopicContext && (
                                <button className="btn btn-outline" onClick={() => navigate(`/student-dashboard/my-courses/${currentTopicContext.courseId}/subjects/${currentTopicContext.subjectId}/topics`)}>
                                    Review Topic
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="recommendation-content">
                        <div className="target-info">
                            <span className="target-type">STRATEGY:</span>
                            <span className="target-title">Needs Improvement</span>
                        </div>
                        <p className="mt-2 muted">Don't worry, practice makes perfect. Review the materials and retake the quiz.</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            {onRetry && <button className="btn btn-primary" onClick={onRetry}>Retake Quiz</button>}
                            {currentTopicContext && (
                                <button className="btn btn-outline" onClick={() => navigate(`/student-dashboard/my-courses/${currentTopicContext.courseId}/subjects/${currentTopicContext.subjectId}/topics`)}>
                                    Review Topic
                                </button>
                            )}
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
