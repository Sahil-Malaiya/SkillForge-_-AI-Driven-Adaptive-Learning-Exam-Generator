import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Grid, Chip, Container, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { authService } from '../services/authService';
import { warnIfStudentCallingInstructorApi } from '../services/devApiGuard';

const QuizManagement = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
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

    const handleViewQuestions = (quiz) => {
        setSelectedQuiz(quiz);
        setOpenDialog(true);
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
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        onClick={() => handleViewQuestions(quiz)}
                                    >
                                        View Questions
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Placeholder Dialog for Questions */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Quiz Questions</DialogTitle>
                <DialogContent>
                    <Typography>
                        No questions have been generated for this quiz yet.
                        <br />
                        (AI Question Generation will be implemented in the next phase)
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default QuizManagement;
