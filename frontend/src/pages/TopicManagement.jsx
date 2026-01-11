import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import { warnIfStudentCallingInstructorApi } from '../services/devApiGuard';

function TopicManagement() {
    const { courseId, subjectId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [subject, setSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        externalLink: '',
        videoFile: null,
        pdfFile: null
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Quiz Generation State
    const [quizDialogOpen, setQuizDialogOpen] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const user = authService.getCurrentUser();
    const role = user?.role || user?.user?.role || user?.userRole;
    const isInstructor = role === 'INSTRUCTOR';
    const [difficulty, setDifficulty] = useState('Easy');
    const [questionCount, setQuestionCount] = useState(5);
    const [quizSuccessMsg, setQuizSuccessMsg] = useState('');
    const [generatingQuiz, setGeneratingQuiz] = useState(false);

    useEffect(() => {
        fetchCourse();
        fetchSubject();
        fetchTopics();
        if (!isInstructor) {
            navigate('/student-dashboard');
            return;
        }
    }, [courseId, subjectId, isInstructor, navigate]);

    const fetchCourse = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/courses/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCourse(data);
            }
        } catch (err) {
            console.error('Failed to fetch course', err);
        }
    };

    const fetchSubject = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/subjects/${subjectId}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSubject(data);
            }
        } catch (err) {
            console.error('Failed to fetch subject', err);
        }
    };

    const buildAssetUrl = (url) => {
        if (!url) return '';
        // If already absolute (http/https), use as-is; otherwise prefix backend origin.
        if (/^https?:\/\//i.test(url)) return url;
        const normalized = url.startsWith('/') ? url : `/${url}`;
        return `http://localhost:8080${normalized}`;
    };

    const fetchTopics = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/topics/subject/${subjectId}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTopics(data);
                console.log('Topics fetched:', data);
            }
        } catch (err) {
            setError('Failed to fetch topics');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            if (formData.externalLink) {
                formDataToSend.append('externalLink', formData.externalLink);
            }
            formDataToSend.append('subjectId', subjectId);

            if (formData.videoFile) {
                formDataToSend.append('video', formData.videoFile);
            }
            if (formData.pdfFile) {
                formDataToSend.append('pdf', formData.pdfFile);
            }

            const url = editingId
                ? `http://localhost:8080/api/topics/${editingId}`
                : 'http://localhost:8080/api/topics';

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: formDataToSend
            });

            if (response.ok) {
                setFormData({ title: '', externalLink: '', videoFile: null, pdfFile: null });
                setEditingId(null);
                // Reset file inputs
                const videoInput = document.getElementById('videoFile');
                const pdfInput = document.getElementById('pdfFile');
                if (videoInput) videoInput.value = '';
                if (pdfInput) pdfInput.value = '';
                fetchTopics();
            } else {
                const errorText = await response.text();
                console.error('Topic save error:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                setError(`Failed to save topic (${response.status}): ${errorText || response.statusText}`);
            }
        } catch (err) {
            console.error('Topic save exception:', err);
            setError(`Failed to save topic: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (topic) => {
        setFormData({
            title: topic.title,
            externalLink: topic.externalLink || '',
            videoFile: null,
            pdfFile: null
        });
        setEditingId(topic.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this topic?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/topics/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });

            if (response.ok) {
                fetchTopics();
            } else {
                setError('Failed to delete topic');
            }
        } catch (err) {
            setError('Failed to delete topic');
        }
    };

    const handleOpenQuizDialog = (topicId) => {
        if (!isInstructor) return;
        setSelectedTopicId(topicId);
        setDifficulty('Easy');
        setQuizDialogOpen(true);
    };

    const handleGenerateQuiz = async () => {
        setGeneratingQuiz(true);
        setError(''); // Clear previous errors
        try {
            const url = 'http://localhost:8080/api/instructor/quizzes';
            warnIfStudentCallingInstructorApi(url);
            console.log('Sending quiz generation request for topic:', selectedTopicId);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({
                    topicId: selectedTopicId,
                    difficulty: difficulty,
                    count: questionCount
                })
            });

            if (response.ok) {
                console.log('Quiz generation successful, setting success message');
                setQuizSuccessMsg('Quiz generated successfully!');
                setQuizDialogOpen(false);
            } else {
                const errText = await response.text();
                setError('Failed to generate quiz: ' + errText);
            }
        } catch (err) {
            setError('Error generating quiz');
        } finally {
            setGeneratingQuiz(false);
        }
    };

    return (
        <div className="content-body">
            <div className="breadcrumb">
                <Link to="/courses">Courses</Link>
                <span className="breadcrumb-separator">›</span>
                <Link to={`/courses/${courseId}/subjects`}>{course?.title || 'Course'}</Link>
                <span className="breadcrumb-separator">›</span>
                <span>{subject?.name || 'Subject'}</span>
                <span className="breadcrumb-separator">›</span>
                <span>Topics</span>
            </div>

            <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>
                Topics of {subject?.name}
            </h2>

            {error && (
                <div className="alert alert-error">{error}</div>
            )}

            {quizSuccessMsg && (
                <div className="alert alert-success">
                    {quizSuccessMsg}
                    <button
                        onClick={() => setQuizSuccessMsg('')}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="form-section">
                <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>
                    {editingId ? 'Edit Topic' : 'Create Topic'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="title">Title:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className="form-input"
                            placeholder="Topic Title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="externalLink">External Link:</label>
                        <input
                            type="url"
                            id="externalLink"
                            name="externalLink"
                            className="form-input"
                            placeholder="External URL"
                            value={formData.externalLink}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="videoFile">Choose Video:</label>
                        <input
                            type="file"
                            id="videoFile"
                            name="videoFile"
                            className="file-input"
                            accept="video/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="pdfFile">Choose PDF:</label>
                        <input
                            type="file"
                            id="pdfFile"
                            name="pdfFile"
                            className="file-input"
                            accept=".pdf"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : editingId ? 'Update Topic' : 'Create Topic'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ title: '', externalLink: '', videoFile: null, pdfFile: null });
                                    const videoInput = document.getElementById('videoFile');
                                    const pdfInput = document.getElementById('pdfFile');
                                    if (videoInput) videoInput.value = '';
                                    if (pdfInput) pdfInput.value = '';
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Title</th>
                            <th>Video</th>
                            <th>PDF</th>
                            <th>External Link</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topics.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                    No topics found
                                </td>
                            </tr>
                        ) : (
                            topics.map((topic, index) => (
                                <tr key={topic.id}>
                                    <td>{index + 1}</td>
                                    <td>{topic.title}</td>
                                    <td>
                                        {topic.videoUrl ? (
                                            <video
                                                controls
                                                style={{ width: '300px', maxHeight: '200px' }}
                                            >
                                                <source src={buildAssetUrl(topic.videoUrl)} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        {topic.pdfUrl ? (
                                            <a
                                                href={buildAssetUrl(topic.pdfUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-small btn-success"
                                            >
                                                View PDF
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        {topic.externalLink ? (
                                            <a
                                                href={topic.externalLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-small btn-success"
                                            >
                                                Open Link
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        <div className="table-actions" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                            <button
                                                className="btn btn-small btn-primary"
                                                onClick={() => handleEdit(topic)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-small btn-secondary"
                                                onClick={() => isInstructor ? handleOpenQuizDialog(topic.id) : null}
                                                disabled={!isInstructor}
                                                title={!isInstructor ? 'Instructor only' : ''}
                                                style={{ backgroundColor: '#9c27b0', color: 'white' }}
                                            >
                                                {isInstructor ? 'Generate Quiz' : 'Instructor Only'}
                                            </button>
                                            <button
                                                className="btn btn-small btn-danger"
                                                onClick={() => handleDelete(topic.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Quiz Difficulty Dialog */}
            <Dialog open={quizDialogOpen} onClose={() => setQuizDialogOpen(false)}>
                <DialogTitle>Generate Quiz</DialogTitle>
                <DialogContent sx={{ width: '300px', pt: 2 }}>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Difficulty Level</InputLabel>
                        <Select
                            value={difficulty}
                            label="Difficulty Level"
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <MenuItem value="Easy">Easy</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Hard">Hard</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel shrink>Number of Questions (1-10)</InputLabel>
                        <Select
                            value={questionCount}
                            label="Number of Questions"
                            onChange={(e) => setQuestionCount(e.target.value)}
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <MenuItem key={n} value={n}>{n}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQuizDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleGenerateQuiz} variant="contained" disabled={generatingQuiz || !isInstructor}>
                        {generatingQuiz ? 'Generating...' : (isInstructor ? 'Generate' : 'Not allowed')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!quizSuccessMsg}
                autoHideDuration={6000}
                onClose={() => setQuizSuccessMsg('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setQuizSuccessMsg('')} severity="success" sx={{ width: '100%' }}>
                    {quizSuccessMsg}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default TopicManagement;
