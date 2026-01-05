import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { studentQuizService } from '../services/studentQuizService';

function Performance() {
    const user = authService.getCurrentUser();
    const studentId = user?.userId;
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await studentQuizService.getProgress(studentId);
                setStats(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load performance');
            } finally {
                setLoading(false);
            }
        })();
    }, [studentId]);

    return (
        <div className="page-layout">
            <h2>Your Performance</h2>
            {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
                <div>
                    <p>Total Attempts: {stats.totalAttempts}</p>
                    <p>Average Score: {Math.round(stats.avgScore)}</p>
                    <p>Accuracy: {Math.round(stats.accuracy)}%</p>

                    <h3>Attempts</h3>
                    <ul>
                        {stats.attempts && stats.attempts.map(a => (
                            <li key={a.id}>Quiz {a.quiz?.id} — Score: {a.score}/{a.totalQuestions} — {new Date(a.attemptedAt).toLocaleString()}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Performance;
