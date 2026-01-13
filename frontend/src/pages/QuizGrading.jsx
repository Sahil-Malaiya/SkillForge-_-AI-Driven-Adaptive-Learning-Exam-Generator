import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Snackbar } from '@mui/material';
import { authService } from '../services/authService';

const QuizGrading = () => {
    const [ungradedAttempts, setUngradedAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [gradingDialogOpen, setGradingDialogOpen] = useState(false);
    const [marks, setMarks] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchUngradedAttempts();
    }, []);

    const fetchUngradedAttempts = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/instructor/submissions/ungraded', {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUngradedAttempts(data);
            } else {
                setError('Failed to fetch ungraded attempts');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenGrading = async (attempt) => {
        setSelectedAttempt(attempt);
        setGradingDialogOpen(true);
        try {
            const response = await fetch(`http://localhost:8080/api/instructor/submissions/${attempt.id}/answers`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAnswers(data);
                const initialMarks = {};
                data.forEach(ans => {
                    if (ans.question.type === 'SAQ') {
                        initialMarks[ans.id] = ans.marksObtained || 0;
                    }
                });
                setMarks(initialMarks);
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error fetching answers', severity: 'error' });
        }
    };

    const handleMarkChange = (answerId, value) => {
        setMarks(prev => ({ ...prev, [answerId]: parseInt(value) || 0 }));
    };

    const handleSubmitGrading = async () => {
        setSubmitting(true);
        try {
            const response = await fetch(`http://localhost:8080/api/instructor/submissions/${selectedAttempt.id}/grade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify(marks)
            });
            if (response.ok) {
                setSnackbar({ open: true, message: 'Grading submitted successfully!', severity: 'success' });
                setGradingDialogOpen(false);
                fetchUngradedAttempts();
            } else {
                setSnackbar({ open: true, message: 'Failed to submit grading', severity: 'error' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error submitting grading', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Container>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
                Manual Grading Required
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {ungradedAttempts.length === 0 ? (
                <Alert severity="info">No quiz submissions require manual grading at this time.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {ungradedAttempts.map((attempt) => (
                        <Grid item xs={12} md={6} key={attempt.id}>
                            <Card elevation={3} sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h6">
                                        {attempt.quiz?.topic?.title || 'Quiz Attempt'}
                                    </Typography>
                                    <Typography color="textSecondary" gutterBottom>
                                        Student: {attempt.student?.name} ({attempt.student?.email})
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Attempted: {new Date(attempt.attemptedAt).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2">
                                        MCQ Score: {attempt.score} / {attempt.totalQuestions}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        onClick={() => handleOpenGrading(attempt)}
                                    >
                                        Grade SAQs
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={gradingDialogOpen} onClose={() => setGradingDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Grade Submission - {selectedAttempt?.student?.name}
                </DialogTitle>
                <DialogContent>
                    <div style={{ marginTop: '16px' }}>
                        {answers.map((ans, idx) => (
                            <Card key={ans.id} variant="outlined" sx={{ mb: 2, p: 2, backgroundColor: ans.question.type === 'SAQ' ? '#fff9db' : '#f8f9fa' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    Question {idx + 1} ({ans.question.type})
                                </Typography>
                                <Typography variant="body1" sx={{ my: 1 }}>
                                    {ans.question.question}
                                </Typography>

                                <div style={{ padding: '10px', background: '#fff', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '10px' }}>
                                    <Typography variant="caption" display="block" color="textSecondary">Student's Answer:</Typography>
                                    <Typography variant="body2">{ans.answerText || '(No answer provided)'}</Typography>
                                </div>

                                {ans.question.type === 'SAQ' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <TextField
                                            label="Marks"
                                            type="number"
                                            size="small"
                                            sx={{ width: '100px' }}
                                            value={marks[ans.id] || 0}
                                            onChange={(e) => handleMarkChange(ans.id, e.target.value)}
                                            inputProps={{ min: 0, max: 10 }}
                                        />
                                        <Typography variant="caption">Max marks recommended: 1 (or as per your criteria)</Typography>
                                    </div>
                                ) : (
                                    <Typography variant="body2" color={ans.marksObtained > 0 ? 'success.main' : 'error.main'} sx={{ fontWeight: 'bold' }}>
                                        Auto-graded: {ans.marksObtained} Marks
                                    </Typography>
                                )}
                            </Card>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setGradingDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmitGrading}
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting ? <CircularProgress size={24} /> : 'Submit Grading'}
                    </Button>
                </DialogActions>
            </Dialog>

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
        </Container>
    );
};

export default QuizGrading;
