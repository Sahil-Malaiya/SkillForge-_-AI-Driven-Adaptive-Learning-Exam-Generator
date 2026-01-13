import React, { useState, useEffect } from 'react';
import './QuizTaker.css';

function QuizTaker({ quiz, onSubmit, onCancel }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit * 60); // Convert minutes to seconds
    const [startTime] = useState(Date.now());

    useEffect(() => {
        if (timeRemaining <= 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    const handleAnswerSelect = (questionId, answer) => {
        setAnswers({
            ...answers,
            [questionId]: answer
        });
    };

    const handleTextChange = (questionId, text) => {
        setAnswers({
            ...answers,
            [questionId]: text
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = () => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const submission = {
            quizId: quiz.id,
            answers: answers,
            timeSpent: timeSpent
        };
        onSubmit(submission);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <div className="quiz-taker">
            <div className="quiz-header">
                <h2>{quiz.title}</h2>
                <div className="quiz-info">
                    <span className="timer">⏱️ {formatTime(timeRemaining)}</span>
                    <span className="question-counter">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>
                </div>
            </div>

            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="question-container">
                <h3 className="question-text">{currentQuestion.questionText}</h3>

                <div className="options-container">
                    {currentQuestion.type === 'SAQ' ? (
                        <textarea
                            className="saq-input"
                            placeholder="Type your answer here..."
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                            rows={6}
                        />
                    ) : (
                        ['A', 'B', 'C', 'D'].map((option) => (
                            <div
                                key={option}
                                className={`option ${answers[currentQuestion.id] === option ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                            >
                                <div className="option-letter">{option}</div>
                                <div className="option-text">
                                    {currentQuestion[`option${option}`]}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="quiz-navigation">
                <button
                    className="nav-btn"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    ← Previous
                </button>

                <button className="cancel-btn" onClick={onCancel}>
                    Cancel Quiz
                </button>

                {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <button
                        className="nav-btn primary"
                        onClick={handleNext}
                    >
                        Next →
                    </button>
                ) : (
                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={Object.keys(answers).length !== quiz.questions.length}
                    >
                        Submit Quiz
                    </button>
                )}
            </div>

            <div className="answered-status">
                Answered: {Object.keys(answers).length} / {quiz.questions.length}
            </div>
        </div>
    );
}

export default QuizTaker;
