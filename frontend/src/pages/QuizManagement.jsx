import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Grid, Chip, Container, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, TextField, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import { authService } from '../services/authService';
import { warnIfStudentCallingInstructorApi } from '../services/devApiGuard';

const QuizManagement = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [questionFormOpen, setQuestionFormOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [questionForm, setQuestionForm] = useState({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        type: 'MCQ'
    });
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const role = user?.role || user?.user?.role || user?.userRole;
    const isInstructor = role === 'INSTRUCTOR';

    useEffect(() => {
        const user = authService.getCurrentUser();
        const role = user?.role || user?.user?.role || user?.userRole;
        if (role !== 'INSTRUCTOR') {
            navigate('/student-dashboard');
        }
    }, [navigate]);

    const handleViewQuestions = async (quiz) => {
        setSelectedQuiz(quiz);
        setOpenDialog(true);
        setLoadingQuestions(true);
        try {
            const url = `http://localhost:8080/api/instructor/quizzes/${quiz.id}/questions`;
            warnIfStudentCallingInstructorApi(url);
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setQuestions(data);
            } else {
                setSnackbar({ open: true, message: 'Failed to fetch questions', severity: 'error' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error fetching questions', severity: 'error' });
        } finally {
            setLoadingQuestions(false);
        }
    };

    useEffect(() => {
        if (!isInstructor) return;
        fetchQuizzes();
    }, [isInstructor]);

    const fetchQuizzes = async () => {
        try {
            const url = 'http://localhost:8080/api/instructor/quizzes';
            warnIfStudentCallingInstructorApi(url);
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setQuizzes(data);
            } else {
                setError('Failed to fetch quizzes');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) {
            return;
        }
        try {
            const url = `http://localhost:8080/api/instructor/quizzes/${id}`;
            warnIfStudentCallingInstructorApi(url);
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                setQuizzes(quizzes.filter(quiz => quiz.id !== id));
                setSnackbar({ open: true, message: 'Quiz deleted successfully!', severity: 'success' });
            } else {
                let errMsg = 'Failed to delete quiz';
                try {
                    const body = await response.json();
                    errMsg = body.message || body.error || JSON.stringify(body);
                } catch (e) {
                    const text = await response.text();
                    if (text) errMsg = text;
                }
                setSnackbar({ open: true, message: errMsg, severity: 'error' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: `Error deleting quiz: ${err.message}`, severity: 'error' });
        }
    };

    const handleAddQuestion = () => {
        setEditingQuestion(null);
        setQuestionForm({
            question: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctAnswer: 'A',
            type: 'MCQ'
        });
        setQuestionFormOpen(true);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
        setQuestionForm({
            question: question.question,
            optionA: question.optionA || '',
            optionB: question.optionB || '',
            optionC: question.optionC || '',
            optionD: question.optionD || '',
            correctAnswer: question.correctAnswer,
            type: question.type || 'MCQ'
        });
        setQuestionFormOpen(true);
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question?')) {
            return;
        }
        try {
            const url = `http://localhost:8080/api/instructor/quizzes/questions/${questionId}`;
            warnIfStudentCallingInstructorApi(url);
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                setQuestions(questions.filter(q => q.id !== questionId));
                setSnackbar({ open: true, message: 'Question deleted successfully!', severity: 'success' });
            } else {
                setSnackbar({ open: true, message: 'Failed to delete question', severity: 'error' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error deleting question', severity: 'error' });
        }
    };

    const handleSaveQuestion = async () => {
        try {
            const url = editingQuestion
                ? `http://localhost:8080/api/instructor/quizzes/questions/${editingQuestion.id}`
                : `http://localhost:8080/api/instructor/quizzes/${selectedQuiz.id}/questions`;
            warnIfStudentCallingInstructorApi(url);
            const response = await fetch(url, {
                method: editingQuestion ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify(questionForm)
            });
            if (response.ok) {
                const savedQuestion = await response.json();
                if (editingQuestion) {
                    setQuestions(questions.map(q => q.id === savedQuestion.id ? savedQuestion : q));
                    setSnackbar({ open: true, message: 'Question updated successfully!', severity: 'success' });
                } else {
                    setQuestions([...questions, savedQuestion]);
                    setSnackbar({ open: true, message: 'Question added successfully!', severity: 'success' });
                }
                setQuestionFormOpen(false);
            } else {
                setSnackbar({ open: true, message: 'Failed to save question', severity: 'error' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error saving question', severity: 'error' });
        }
    };

    const handleOpenAssignDialog = async (quiz) => {
        setSelectedQuiz(quiz);
        setAssignDialogOpen(true);
        setLoadingStudents(true);
        setSelectedStudentIds([]);
        try {
            const url = 'http://localhost:8080/api/instructor/quizzes/students';
            warnIfStudentCallingInstructorApi(url);
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            } else {
                setSnackbar({ open: true, message: 'Failed to fetch students', severity: 'error' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error fetching students', severity: 'error' });
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleToggleStudent = (studentId) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSelectAllStudents = () => {
        if (selectedStudentIds.length === students.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(students.map(s => s.id));
        }
    };

    const handleAssignQuiz = async (assignToAll) => {
        if (!assignToAll && selectedStudentIds.length === 0) {
            setSnackbar({ open: true, message: 'Please select at least one student', severity: 'warning' });
            return;
        }

        setAssigning(true);
        try {
            const url = `http://localhost:8080/api/instructor/quizzes/${selectedQuiz.id}/assign`;
            warnIfStudentCallingInstructorApi(url);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({
                    allStudents: assignToAll,
                    studentIds: assignToAll ? [] : selectedStudentIds
                })
            });
            if (response.ok) {
                setSnackbar({ open: true, message: 'Quiz assigned successfully!', severity: 'success' });
                setAssignDialogOpen(false);
            } else {
                setSnackbar({ open: true, message: 'Failed to assign quiz', severity: 'error' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error assigning quiz', severity: 'error' });
        } finally {
            setAssigning(false);
        }
    };

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom component="div" sx={{ fontWeight: 'bold', color: '#1e3c72', mb: 3 }}>
                Generated Quizzes
            </Typography>

            {quizzes.length === 0 ? (
                <Alert severity="info">No quizzes generated yet.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {quizzes.map((quiz) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={quiz.id}>
                            <Card
                                elevation={3}
                                sx={{
                                    borderRadius: 2,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                    },
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e3c72', mb: 2, fontSize: '22px' }}>
                                        {quiz.topic ? quiz.topic.title : 'Unknown Topic'}
                                    </Typography>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', marginBottom: '20px' }}>
                                        <Chip
                                            label={quiz.difficulty}
                                            sx={{
                                                bgcolor: quiz.difficulty === 'Easy' ? '#22c55e' :
                                                    quiz.difficulty === 'Medium' ? '#eab308' : '#ef4444',
                                                color: 'white',
                                                fontWeight: 700,
                                                fontSize: '13px',
                                                height: '28px',
                                                boxShadow: quiz.difficulty === 'Easy' ? '0 2px 8px rgba(34, 197, 94, 0.3)' :
                                                    quiz.difficulty === 'Medium' ? '0 2px 8px rgba(234, 179, 8, 0.3)' : '0 2px 8px rgba(239, 68, 68, 0.3)'
                                            }}
                                            size="small"
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6c757d', fontSize: '14px' }}>
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <Typography variant="caption" color="textSecondary">
                                                {new Date(quiz.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={() => handleViewQuestions(quiz)}
                                            startIcon={
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            }
                                            sx={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #5568d3 0%, #6a4193 100%)'
                                                }
                                            }}
                                        >
                                            View Questions
                                        </Button>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                startIcon={
                                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                }
                                                sx={{
                                                    borderColor: '#3b82f6',
                                                    color: '#3b82f6',
                                                    fontWeight: 600,
                                                    '&:hover': {
                                                        borderColor: '#2563eb',
                                                        bgcolor: '#eff6ff'
                                                    }
                                                }}
                                                onClick={() => handleOpenAssignDialog(quiz)}
                                            >
                                                Assign
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                startIcon={
                                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                }
                                                sx={{
                                                    borderColor: '#ef4444',
                                                    color: '#ef4444',
                                                    fontWeight: 600,
                                                    '&:hover': {
                                                        borderColor: '#dc2626',
                                                        bgcolor: '#fef2f2'
                                                    }
                                                }}
                                                onClick={() => handleDelete(quiz.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Questions Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    pb: 3
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {selectedQuiz?.topic?.title}
                        </Typography>
                    </div>
                    <Chip
                        label={selectedQuiz?.difficulty}
                        size="small"
                        sx={{
                            bgcolor: selectedQuiz?.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.9)' :
                                selectedQuiz?.difficulty === 'Medium' ? 'rgba(234, 179, 8, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                            color: 'white',
                            fontWeight: 700,
                            borderRadius: '12px',
                            fontSize: '13px'
                        }}
                    />
                </DialogTitle>
                <DialogContent>
                    {loadingQuestions ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                            <CircularProgress />
                        </div>
                    ) : questions.length === 0 ? (
                        <Alert severity="info">
                            No questions have been generated for this quiz yet.
                        </Alert>
                    ) : (
                        <div style={{ marginTop: '16px' }}>
                            {questions.map((q, index) => (
                                <Card key={q.id} sx={{
                                    mb: 3,
                                    p: 3,
                                    borderRadius: 3,
                                    border: '2px solid #f0f0f0',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '6px',
                                        height: '100%',
                                        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)'
                                    }
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: '16px'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3c72', flex: 1 }}>
                                            Question {index + 1}
                                        </Typography>
                                        {q.type === 'SAQ' && (
                                            <Chip
                                                label="Short Answer"
                                                size="small"
                                                sx={{
                                                    bgcolor: '#e3f2fd',
                                                    color: '#667eea',
                                                    fontWeight: 600
                                                }}
                                            />
                                        )}
                                    </div>
                                    <Typography variant="body1" sx={{ mb: 3, fontWeight: 500, fontSize: '16px', lineHeight: 1.6, color: '#2c3e50' }}>
                                        {q.question}
                                    </Typography>
                                    <div style={{ marginLeft: '0px' }}>
                                        {q.type === 'SAQ' ? (
                                            <div style={{
                                                padding: '20px',
                                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                                borderRadius: '12px',
                                                border: '2px dashed #dee2e6',
                                                textAlign: 'center'
                                            }}>
                                                <svg width="40" height="40" fill="none" stroke="#667eea" viewBox="0 0 24 24" style={{ margin: '0 auto 12px' }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#6c757d', fontWeight: 500 }}>
                                                    Student will provide a written answer
                                                </Typography>
                                            </div>
                                        ) : (
                                            ['A', 'B', 'C', 'D'].map((option) => {
                                                const optionText = q[`option${option}`];
                                                // Handle both "A" (letter) and "The choice text" (full text) formats
                                                const correctAns = (q.correctAnswer || '').trim().toUpperCase();
                                                const normalizedOptionText = (optionText || '').trim().toUpperCase();
                                                const isCorrect = correctAns === option ||
                                                    correctAns.startsWith(option + '.') ||
                                                    correctAns.startsWith(option + ')') ||
                                                    correctAns === normalizedOptionText;
                                                return (
                                                    <div
                                                        key={option}
                                                        style={{
                                                            marginBottom: '12px',
                                                            padding: '14px 16px',
                                                            borderRadius: '12px',
                                                            background: isCorrect
                                                                ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)'
                                                                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                                            border: isCorrect ? '2px solid #28a745' : '2px solid #e9ecef',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            transition: 'all 0.2s ease',
                                                            cursor: 'default'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: isCorrect
                                                                ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                                                                : 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
                                                            color: isCorrect ? 'white' : '#6c757d',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 700,
                                                            fontSize: '14px',
                                                            flexShrink: 0
                                                        }}>
                                                            {option}
                                                        </div>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: isCorrect ? 600 : 400,
                                                                color: isCorrect ? '#155724' : '#2c3e50',
                                                                flex: 1
                                                            }}
                                                        >
                                                            {optionText}
                                                        </Typography>
                                                        {isCorrect && (
                                                            <Chip
                                                                label="Correct"
                                                                size="small"
                                                                color="success"
                                                                sx={{ ml: 2, height: '20px' }}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleEditQuestion(q)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDeleteQuestion(q.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddQuestion} variant="contained" color="primary">
                        Add Question
                    </Button>
                    <Button onClick={() => setOpenDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Question Form Dialog */}
            <Dialog open={questionFormOpen} onClose={() => setQuestionFormOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                        <InputLabel>Question Type</InputLabel>
                        <Select
                            value={questionForm.type}
                            label="Question Type"
                            onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}
                        >
                            <MenuItem value="MCQ">Multiple Choice</MenuItem>
                            <MenuItem value="SAQ">Short Answer</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Question"
                        fullWidth
                        multiline
                        rows={3}
                        value={questionForm.question}
                        onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    {questionForm.type === 'MCQ' && (
                        <>
                            <TextField
                                label="Option A"
                                fullWidth
                                value={questionForm.optionA}
                                onChange={(e) => setQuestionForm({ ...questionForm, optionA: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Option B"
                                fullWidth
                                value={questionForm.optionB}
                                onChange={(e) => setQuestionForm({ ...questionForm, optionB: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Option C"
                                fullWidth
                                value={questionForm.optionC}
                                onChange={(e) => setQuestionForm({ ...questionForm, optionC: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Option D"
                                fullWidth
                                value={questionForm.optionD}
                                onChange={(e) => setQuestionForm({ ...questionForm, optionD: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                        </>
                    )}
                    {questionForm.type === 'MCQ' ? (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Correct Answer</InputLabel>
                            <Select
                                value={questionForm.correctAnswer}
                                label="Correct Answer"
                                onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                            >
                                <MenuItem value="A">A</MenuItem>
                                <MenuItem value="B">B</MenuItem>
                                <MenuItem value="C">C</MenuItem>
                                <MenuItem value="D">D</MenuItem>
                            </Select>
                        </FormControl>
                    ) : (
                        <TextField
                            label="Correct Answer"
                            fullWidth
                            multiline
                            rows={2}
                            value={questionForm.correctAnswer}
                            onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                            sx={{ mb: 2 }}
                            helperText="Enter the expected answer for this short answer question"
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQuestionFormOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveQuestion} variant="contained" color="primary">
                        {editingQuestion ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Assign Quiz Dialog */}
            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Assign Quiz to Students</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1" gutterBottom>
                        Quiz: {selectedQuiz?.topic?.title}
                    </Typography>
                    {loadingStudents ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                            <CircularProgress />
                        </div>
                    ) : students.length === 0 ? (
                        <Alert severity="info">No students found.</Alert>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <Typography variant="body2">
                                    Selected: {selectedStudentIds.length} / {students.length}
                                </Typography>
                                <Button size="small" onClick={handleSelectAllStudents}>
                                    {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
                                </Button>
                            </div>
                            <Grid container spacing={1}>
                                {students.map((student) => (
                                    <Grid item xs={12} key={student.id}>
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                p: 1,
                                                cursor: 'pointer',
                                                backgroundColor: selectedStudentIds.includes(student.id) ? '#e3f2fd' : 'inherit',
                                                borderColor: selectedStudentIds.includes(student.id) ? '#1976d2' : 'divider'
                                            }}
                                            onClick={() => handleToggleStudent(student.id)}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <Typography variant="body1">{student.name}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{student.email}</Typography>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudentIds.includes(student.id)}
                                                    readOnly
                                                />
                                            </div>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => handleAssignQuiz(true)}
                        disabled={assigning || loadingStudents || students.length === 0}
                        color="secondary"
                    >
                        Assign to All
                    </Button>
                    <Button
                        onClick={() => handleAssignQuiz(false)}
                        variant="contained"
                        color="primary"
                        disabled={assigning || loadingStudents || selectedStudentIds.length === 0}
                    >
                        {assigning ? <CircularProgress size={24} /> : 'Assign'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default QuizManagement;