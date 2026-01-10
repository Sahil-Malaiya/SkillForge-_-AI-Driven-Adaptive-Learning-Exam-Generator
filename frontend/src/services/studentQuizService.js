const BASE = 'http://localhost:8080/api/students';

const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const studentQuizService = {
    generateQuiz: async (studentId, payload) => {
        const res = await fetch(`${BASE}/${studentId}/quizzes`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to generate quiz');
        return res.json();
    },

    submitQuiz: async (studentId, quizId, submission) => {
        const res = await fetch(`${BASE}/${studentId}/quizzes/${quizId}/submit`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(submission)
        });
        if (!res.ok) throw new Error('Failed to submit quiz');
        return res.json();
    },

    getAttempts: async (studentId) => {
        const res = await fetch(`${BASE}/${studentId}/attempts`, { headers: getAuthHeader() });
        if (!res.ok) throw new Error('Failed to fetch attempts');
        return res.json();
    },

    getProgress: async (studentId) => {
        const res = await fetch(`${BASE}/${studentId}/progress`, { headers: getAuthHeader() });
        if (!res.ok) throw new Error('Failed to fetch progress');
        return res.json();
    }
};
