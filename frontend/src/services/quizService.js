// Backend exposes instructor quiz endpoints under /api/instructor/quizzes
const API_URL = 'http://localhost:8080/api/instructor/quizzes';
import { warnIfStudentCallingInstructorApi } from './devApiGuard';

const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const quizService = {
    // Instructor: create quiz (expects { topicId, difficulty })
    createQuiz: async (quizData) => {
        warnIfStudentCallingInstructorApi(API_URL);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(quizData)
        });
        if (!response.ok) throw new Error('Failed to create quiz');
        return response.json();
    },

    // Get all quizzes (instructor view)
    getAllQuizzes: async () => {
        warnIfStudentCallingInstructorApi(API_URL);
        const response = await fetch(API_URL, { headers: getAuthHeader() });
        if (!response.ok) throw new Error('Failed to fetch quizzes');
        return response.json();
    },

    // Get quizzes by topic
    getQuizzesByTopic: async (topicId) => {
        const url = `${API_URL}/topic/${topicId}`;
        warnIfStudentCallingInstructorApi(url);
        const response = await fetch(url, { headers: getAuthHeader() });
        if (!response.ok) throw new Error('Failed to fetch quizzes by topic');
        return response.json();
    }
};
