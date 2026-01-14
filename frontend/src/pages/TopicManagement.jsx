import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import { warnIfStudentCallingInstructorApi } from '../services/devApiGuard';
import './TopicManagement.css';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [contentFilter, setContentFilter] = useState('ALL');

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
    const [saqCount, setSaqCount] = useState(0);

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
                const videoInput = document.getElementById('videoFile');
                const pdfInput = document.getElementById('pdfFile');
                if (videoInput) videoInput.value = '';
                if (pdfInput) pdfInput.value = '';
                fetchTopics();
            } else {
                const errorText = await response.text();
                setError(`Failed to save topic (${response.status}): ${errorText || response.statusText}`);
            }
        } catch (err) {
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
        setError('');
        try {
            const url = 'http://localhost:8080/api/instructor/quizzes';
            warnIfStudentCallingInstructorApi(url);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({
                    topicId: selectedTopicId,
                    difficulty: difficulty,
                    count: questionCount,
                    countSAQ: saqCount
                })
            });

            if (response.ok) {
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

    // Filter topics based on search and content type
    const filteredTopics = topics
        .filter(topic => {
            const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase());

            if (contentFilter === 'ALL') return matchesSearch;
            if (contentFilter === 'VIDEO') return matchesSearch && topic.videoUrl;
            if (contentFilter === 'PDF') return matchesSearch && topic.pdfUrl;
            if (contentFilter === 'LINK') return matchesSearch && topic.externalLink;

            return matchesSearch;
        });

    return (
        <div className="content-body">
            <button
                onClick={() => navigate(`/courses/${courseId}/subjects`)}
                style={{
                    background: '#f3f0ff',
                    border: '1px solid #667eea',
                    color: '#764ba2',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginBottom: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                    padding: '10px 20px',
                    borderRadius: '8px'
                }}
                onMouseOver={(e) => { e.target.style.background = '#667eea'; e.target.style.color = '#fff'; }}
                onMouseOut={(e) => { e.target.style.background = '#f3f0ff'; e.target.style.color = '#764ba2'; }}
            >
                ← Back to Subjects
            </button>

            {/* Header Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                padding: '20px',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '28px', fontWeight: 600, color: '#2c3e50' }}>Topic Management</h2>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
                        {course?.title} › {subject?.name}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {/* Search Bar */}
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search Topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '10px 40px 10px 15px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                width: '250px',
                                outline: 'none'
                            }}
                        />
                        <svg
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9e9e9e' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Filter Dropdown */}
                    <select
                        value={contentFilter}
                        onChange={(e) => setContentFilter(e.target.value)}
                        style={{
                            padding: '10px 35px 10px 15px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer',
                            background: '#fff',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239e9e9e' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center'
                        }}
                    >
                        <option value="ALL">All Content</option>
                        <option value="VIDEO">With Video</option>
                        <option value="PDF">With PDF</option>
                        <option value="LINK">With Link</option>
                    </select>
                </div>
            </div>

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

            {/* Create/Edit Form */}
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

            {/* Topics Grid */}
            <div style={{ marginTop: '30px' }}>
                {filteredTopics.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        color: '#7f8c8d'
                    }}>
                        <p style={{ fontSize: '16px', margin: 0 }}>
                            {topics.length === 0
                                ? 'No topics found. Create your first topic above!'
                                : 'No topics match your search or filter. Try adjusting your criteria.'}
                        </p>
                    </div>
                ) : (
                    <div className="topics-grid">
                        {filteredTopics.map((topic) => (
                            <div key={topic.id} className="topic-card">
                                <div className="topic-card-header">
                                    <h4 className="topic-title">{topic.title}</h4>
                                    <div className="topic-badges">
                                        {topic.videoUrl && <span className="badge badge-video">Video</span>}
                                        {topic.pdfUrl && <span className="badge badge-pdf">PDF</span>}
                                        {topic.externalLink && <span className="badge badge-link">Link</span>}
                                    </div>
                                </div>

                                <div className="topic-card-content">
                                    {topic.videoUrl && (
                                        <div className="content-item">
                                            <video
                                                controls
                                                style={{ width: '100%', maxHeight: '200px', borderRadius: '8px' }}
                                            >
                                                <source src={buildAssetUrl(topic.videoUrl)} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    )}

                                    {topic.pdfUrl && (
                                        <div className="content-item">
                                            <a
                                                href={buildAssetUrl(topic.pdfUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="content-link"
                                            >
                                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                View PDF Document
                                            </a>
                                        </div>
                                    )}

                                    {topic.externalLink && (
                                        <div className="content-item">
                                            <a
                                                href={topic.externalLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="content-link"
                                            >
                                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Open External Link
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="topic-card-actions">
                                    <button
                                        className="action-btn edit-btn"
                                        onClick={() => handleEdit(topic)}
                                    >
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </button>
                                    <button
                                        className="action-btn quiz-btn"
                                        onClick={() => isInstructor ? handleOpenQuizDialog(topic.id) : null}
                                        disabled={!isInstructor}
                                    >
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Quiz
                                    </button>
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDelete(topic.id)}
                                    >
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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

                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel shrink>Short Answer Questions (0-5)</InputLabel>
                        <Select
                            value={saqCount}
                            label="Short Answer Questions"
                            onChange={(e) => setSaqCount(e.target.value)}
                        >
                            {[0, 1, 2, 3, 4, 5].map(n => (
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
