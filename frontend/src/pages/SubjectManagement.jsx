import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import '../components/SubjectCard.css';

function SubjectManagement() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        courseId: courseId
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourse();
        fetchSubjects();
    }, [courseId]);

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
            setError('Failed to fetch course');
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/subjects/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSubjects(data);
            }
        } catch (err) {
            setError('Failed to fetch subjects');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = editingId
                ? `http://localhost:8080/api/subjects/${editingId}`
                : 'http://localhost:8080/api/subjects';

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({ ...formData, courseId })
            });

            if (response.ok) {
                setFormData({ name: '', description: '', courseId });
                setEditingId(null);
                fetchSubjects();
            } else {
                setError('Failed to save subject');
            }
        } catch (err) {
            setError('Failed to save subject');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (subject) => {
        setFormData({
            name: subject.name,
            description: subject.description,
            courseId: courseId
        });
        setEditingId(subject.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/subjects/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });

            if (response.ok) {
                fetchSubjects();
            } else {
                setError('Failed to delete subject');
            }
        } catch (err) {
            setError('Failed to delete subject');
        }
    };

    const handleManageTopics = (subjectId) => {
        navigate(`/courses/${courseId}/subjects/${subjectId}/topics`);
    };

    return (
        <div className="content-body">
            <div className="breadcrumb">
                <Link to="/courses">Courses</Link>
                <span className="breadcrumb-separator">›</span>
                <span>{course?.title || 'Loading...'}</span>
                <span className="breadcrumb-separator">›</span>
                <span>Subjects</span>
            </div>

            <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Subject Management</h2>

            {error && (
                <div className="alert alert-error">{error}</div>
            )}

            <div className="form-section">
                <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>
                    {editingId ? 'Edit Subject' : 'Create Subject'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Subject Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-input"
                                placeholder="Enter subject name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="description">Description:</label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                className="form-input"
                                placeholder="Enter description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : editingId ? 'Update Subject' : 'Save Subject'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ name: '', description: '', courseId });
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#2c3e50' }}>Subjects for {course?.title}</h3>
                {subjects.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        color: '#7f8c8d'
                    }}>
                        <p style={{ fontSize: '16px', margin: 0 }}>No subjects found. Create your first subject above!</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '20px'
                    }}>
                        {subjects.map(subject => (
                            <div key={subject.id} className="subject-card">
                                <div className="subject-card-header"></div>
                                <div className="subject-card-body">
                                    <h4 className="subject-card-title">{subject.name}</h4>
                                    <p className="subject-card-description">
                                        {subject.description || 'No description provided'}
                                    </p>
                                </div>
                                <div className="subject-card-footer">
                                    <button
                                        className="subject-card-btn"
                                        onClick={() => handleEdit(subject)}
                                        title="Edit Subject"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="subject-card-btn"
                                        onClick={() => handleDelete(subject.id)}
                                        title="Delete Subject"
                                    >
                                        🗑️ Delete
                                    </button>
                                    <button
                                        className="subject-card-btn btn-primary-action"
                                        onClick={() => handleManageTopics(subject.id)}
                                        title="Manage Topics"
                                    >
                                        📚 Manage Topics
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SubjectManagement;
