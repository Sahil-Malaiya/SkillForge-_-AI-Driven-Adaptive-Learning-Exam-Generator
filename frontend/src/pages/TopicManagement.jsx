import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';

function TopicManagement() {
    const { courseId, subjectId } = useParams();
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

    useEffect(() => {
        fetchCourse();
        fetchSubject();
        fetchTopics();
    }, [courseId, subjectId]);

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
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-small btn-primary"
                                                onClick={() => handleEdit(topic)}
                                            >
                                                Edit
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
        </div>
    );
}

export default TopicManagement;
