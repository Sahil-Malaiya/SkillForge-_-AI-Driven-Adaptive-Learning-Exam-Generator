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
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortFilter, setSortFilter] = useState('ALL');

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
                setShowModal(false);
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
        setShowModal(true);
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

    const handleOpenModal = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', courseId });
        setError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', description: '', courseId });
        setError('');
    };

    // Filter subjects based on search and sort
    const filteredSubjects = subjects
        .filter(subject =>
            subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortFilter === 'NAME_ASC') return a.name.localeCompare(b.name);
            if (sortFilter === 'NAME_DESC') return b.name.localeCompare(a.name);
            return 0; // ALL - keep original order
        });

    return (
        <div className="content-body">
            <button
                onClick={() => navigate('/courses')}
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
                ← Back to Courses
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
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '28px', fontWeight: 600, color: '#2c3e50' }}>Subject Management</h2>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>Course: {course?.title || 'Loading...'}</p>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {/* Search Bar */}
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search Subjects..."
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
                        value={sortFilter}
                        onChange={(e) => setSortFilter(e.target.value)}
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
                        <option value="ALL">All Subjects</option>
                        <option value="NAME_ASC">Name (A-Z)</option>
                        <option value="NAME_DESC">Name (Z-A)</option>
                    </select>

                    {/* Add New Subject Button */}
                    <button
                        onClick={handleOpenModal}
                        style={{
                            padding: '12px 24px',
                            background: '#667eea',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#764ba2'}
                        onMouseOut={(e) => e.target.style.background = '#667eea'}
                    >
                        + Add New Subject
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>
            )}

            {/* Subjects Grid */}
            <div style={{ marginTop: '24px' }}>
                {filteredSubjects.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        color: '#7f8c8d'
                    }}>
                        <p style={{ fontSize: '16px', margin: 0 }}>
                            {subjects.length === 0
                                ? 'No subjects found. Create your first subject above!'
                                : 'No subjects match your search. Try a different search term.'}
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '20px'
                    }}>
                        {filteredSubjects.map(subject => (
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
                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </button>
                                    <button
                                        className="subject-card-btn"
                                        onClick={() => handleDelete(subject.id)}
                                        title="Delete Subject"
                                    >
                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                    <button
                                        className="subject-card-btn btn-primary-action"
                                        onClick={() => handleManageTopics(subject.id)}
                                        title="Manage Topics"
                                    >
                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Manage Topics
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for Create/Edit Subject */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '30px',
                        width: '500px',
                        maxWidth: '90%',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: 600, color: '#2c3e50' }}>
                            {editingId ? 'Edit Subject' : 'Create New Subject'}
                        </h3>

                        {error && (
                            <div className="alert alert-error" style={{ marginBottom: '15px' }}>{error}</div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#555' }}>
                                    Subject Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter subject name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#555' }}>
                                    Description
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="Enter description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#f5f5f5',
                                        color: '#666',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#667eea',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? 'Saving...' : editingId ? 'Update Subject' : 'Save Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SubjectManagement;
