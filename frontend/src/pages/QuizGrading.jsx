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
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1e3c72', mb: 3 }}>
                Manual Grading Required
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {ungradedAttempts.length === 0 ? (
                <Alert severity="info">No quiz submissions require manual grading at this time.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {ungradedAttempts.map((attempt) => (
                        <Grid item xs={12} md={6} key={attempt.id}>
                            <Card elevation={3} sx={{
                                borderRadius: 3,
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
                                }
                            }}>
                                <CardContent>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                        </div>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3c72' }}>
                                            {attempt.quiz?.topic?.title || 'Quiz Attempt'}
                                        </Typography>
                                    </div>
                                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '14px' }}>
                                        <strong>Student:</strong> {attempt.student?.name} ({attempt.student?.email})
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1, color: '#6c757d' }}>
                                        <strong>Attempted:</strong> {new Date(attempt.attemptedAt).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                        <strong>MCQ Score:</strong> {attempt.score} / {attempt.totalQuestions}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            mt: 2,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5568d3 0%, #6a4193 100%)'
                                            }
                                        }}
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

            <Dialog
                open={gradingDialogOpen}
                onClose={() => setGradingDialogOpen(false)}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Grade Submission - {selectedAttempt?.student?.name}</span>
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div style={{ marginTop: '16px' }}>
                        {answers.map((ans, idx) => (
                            <Card key={ans.id} variant="outlined" sx={{
                                mb: 3,
                                p: 3,
                                borderRadius: 3,
                                border: '2px solid',
                                borderColor: ans.question.type === 'SAQ' ? '#667eea' : '#e9ecef',
                                background: ans.question.type === 'SAQ'
                                    ? 'linear-gradient(135deg, #f3f0ff 0%, #ffffff 100%)'
                                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': ans.question.type === 'SAQ' ? {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '6px',
                                    height: '100%',
                                    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)'
                                } : {}
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '14px'
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e3c72', flex: 1 }}>
                                        Question {idx + 1}
                                    </Typography>
                                    {ans.question.type === 'SAQ' && (
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }}>
                                            Needs Grading
                                        </span>
                                    )}
                                </div>
                                <Typography variant="body1" sx={{ my: 2, fontWeight: 500, fontSize: '15px', lineHeight: 1.6 }}>
                                    {ans.question.question}
                                </Typography>

                                <div style={{
                                    padding: '16px',
                                    background: '#ffffff',
                                    borderRadius: '12px',
                                    border: '2px solid #e9ecef',
                                    marginBottom: '16px'
                                }}>
                                    <Typography variant="caption" display="block" sx={{ color: '#667eea', fontWeight: 600, mb: 1 }}>Student's Answer:</Typography>
                                    <Typography variant="body2" sx={{ color: '#2c3e50', lineHeight: 1.6 }}>{ans.answerText || '(No answer provided)'}</Typography>
                                </div>

                                {ans.question.type === 'SAQ' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '10px' }}>
                                        <TextField
                                            label="Marks"
                                            type="number"
                                            size="small"
                                            sx={{
                                                width: '120px',
                                                '& .MuiOutlinedInput-root': {
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#667eea'
                                                    }
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#667eea'
                                                }
                                            }}
                                            value={marks[ans.id] || 0}
                                            onChange={(e) => handleMarkChange(ans.id, e.target.value)}
                                            inputProps={{ min: 0, max: 10 }}
                                        />
                                        <Typography variant="caption" sx={{ color: '#6c757d' }}>Max marks recommended: 1</Typography>
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '12px',
                                        borderRadius: '10px',
                                        background: ans.marksObtained > 0
                                            ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)'
                                            : 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                                        border: `2px solid ${ans.marksObtained > 0 ? '#28a745' : '#dc3545'}`
                                    }}>
                                        <Typography variant="body2" sx={{
                                            color: ans.marksObtained > 0 ? '#155724' : '#721c24',
                                            fontWeight: 600
                                        }}>
                                            Auto-graded: {ans.marksObtained} Marks
                                        </Typography>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button
                        onClick={() => setGradingDialogOpen(false)}
                        sx={{
                            color: '#6c757d',
                            '&:hover': {
                                background: '#f8f9fa'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitGrading}
                        variant="contained"
                        disabled={submitting}
                        sx={{
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0f8a7f 0%, #32d96f 100%)'
                            }
                        }}
                    >
                        {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Submit Grading'}
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
