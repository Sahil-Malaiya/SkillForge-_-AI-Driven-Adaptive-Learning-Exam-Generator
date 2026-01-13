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
        correctAnswer: 'A'
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
                const errText = await response.text();
                setSnackbar({ open: true, message: `Failed to delete quiz: ${errText}`, severity: 'error' });
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
            correctAnswer: 'A'
        });
        setQuestionFormOpen(true);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
        setQuestionForm({
            question: question.question,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            correctAnswer: question.correctAnswer
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
            <Typography variant="h4" gutterBottom component="div" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
                Generated Quizzes
            </Typography>

            {quizzes.length === 0 ? (
                <Alert severity="info">No quizzes generated yet.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {quizzes.map((quiz) => (
                        <Grid item xs={12} md={6} key={quiz.id}>
                            <Card elevation={3} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {quiz.topic ? quiz.topic.title : 'Unknown Topic'}
                                    </Typography>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                        <Chip
                                            label={quiz.difficulty}
                                            color={
                                                quiz.difficulty === 'Easy' ? 'success' :
                                                    quiz.difficulty === 'Medium' ? 'warning' : 'error'
                                            }
                                            variant="outlined"
                                            size="small"
                                        />
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(quiz.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={() => handleViewQuestions(quiz)}
                                        >
                                            View Questions
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleDelete(quiz.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{ mt: 1 }}
                                        onClick={() => handleOpenAssignDialog(quiz)}
                                    >
                                        Assign to Students
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Questions Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Quiz Questions - {selectedQuiz?.topic?.title}
                    <Typography variant="caption" display="block" color="textSecondary">
                        Difficulty: {selectedQuiz?.difficulty}
                    </Typography>
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
                                <Card key={q.id} sx={{ mb: 2, p: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Question {index + 1}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                                        {q.question}
                                    </Typography>
                                    <div style={{ marginLeft: '16px' }}>
                                        {q.type === 'SAQ' ? (
                                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
                                                Short Answer Question (No options)
                                            </Typography>
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
                                                    <Typography
                                                        key={option}
                                                        variant="body2"
                                                        sx={{
                                                            mb: 1,
                                                            p: 1,
                                                            borderRadius: 1,
                                                            backgroundColor: isCorrect ? '#e8f5e9' : 'transparent',
                                                            fontWeight: isCorrect ? 600 : 400,
                                                            border: isCorrect ? '2px solid #4caf50' : '1px solid #e0e0e0'
                                                        }}
                                                    >
                                                        <strong>{option}.</strong> {optionText}
                                                        {isCorrect && (
                                                            <Chip
                                                                label="Correct"
                                                                size="small"
                                                                color="success"
                                                                sx={{ ml: 2, height: '20px' }}
                                                            />
                                                        )}
                                                    </Typography>
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
                    <TextField
                        label="Question"
                        fullWidth
                        multiline
                        rows={3}
                        value={questionForm.question}
                        onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                    />
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
