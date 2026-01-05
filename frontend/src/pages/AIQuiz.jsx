import React, { useState } from 'react';
import { authService } from '../services/authService';
import { studentQuizService } from '../services/studentQuizService';
import QuizTaker from '../components/QuizTaker';
import QuizResult from '../components/QuizResult';

function AIQuiz() {
    const user = authService.getCurrentUser();
    const studentId = user?.userId || user?.userId;

    const [topicId, setTopicId] = useState('');
    const [difficulty, setDifficulty] = useState('EASY');
    const [quiz, setQuiz] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const startQuiz = async () => {
        try {
            setLoading(true);
            setError(null);
            const resp = await studentQuizService.generateQuiz(studentId, { topicId, difficulty });
            // resp.quiz and resp.questions
            const mapped = {
                id: resp.quiz.id,
                title: `AI Quiz - ${resp.quiz.topic.title}`,
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
            setQuiz(mapped);
        } catch (err) {
            console.error(err);
            setError('Failed to generate quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (submission) => {
        try {
            setLoading(true);
            const resp = await studentQuizService.submitQuiz(studentId, submission.quizId, submission);
            setResult(resp);
            setQuiz(null);
        } catch (err) {
            console.error(err);
            setError('Failed to submit quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-layout">
            <h2>AI Quiz</h2>
            {!quiz && !result && (
                <div className="quiz-setup">
                    <label>
                        Topic ID:
                        <input value={topicId} onChange={e => setTopicId(e.target.value)} />
                    </label>
                    <label>
                        Difficulty:
                        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                        </select>
                    </label>
                    <button onClick={startQuiz} disabled={loading || !topicId}>Start Quiz</button>
                    {error && <p className="error">{error}</p>}
                </div>
            )}

            {quiz && (
                <QuizTaker quiz={quiz} onSubmit={handleSubmit} onCancel={() => setQuiz(null)} />
            )}

            {result && (
                <QuizResult result={result} onClose={() => setResult(null)} />
            )}
        </div>
    );
}

export default AIQuiz;
