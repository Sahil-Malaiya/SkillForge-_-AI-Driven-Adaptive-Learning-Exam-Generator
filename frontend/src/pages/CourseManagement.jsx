import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import CourseList from '../components/CourseList';

function CourseManagement() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        difficultyLevel: 'EASY'
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/courses', {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            }
        } catch (err) {
            setError('Failed to fetch courses');
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
                ? `http://localhost:8080/api/courses/${editingId}`
                : 'http://localhost:8080/api/courses';

            const method = editingId ? 'PUT' : 'POST';

            const currentUser = authService.getCurrentUser();
            const instructorId = currentUser?.userId;

            if (!instructorId) {
                setError('Unable to get instructor ID. Please log in again.');
                setLoading(false);
                return;
            }

            const courseData = {
                ...formData,
                instructorId: instructorId
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify(courseData)
            });

            if (response.ok) {
                setFormData({ title: '', difficultyLevel: 'EASY' });
                setEditingId(null);
                setShowModal(false);
                fetchCourses();
            } else {
                const errorText = await response.text();
                setError(`Failed to save course: ${errorText}`);
            }
        } catch (err) {
            setError(`Failed to save course: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (course) => {
        setFormData({
            title: course.title,
            difficultyLevel: course.difficultyLevel
        });
        setEditingId(course.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/courses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });

            if (response.ok) {
                fetchCourses();
            } else {
                setError('Failed to delete course');
            }
        } catch (err) {
            setError('Failed to delete course');
        }
    };

    const handleManageSubjects = (courseId) => {
        navigate(`/courses/${courseId}/subjects`);
    };

    const handleOpenModal = () => {
        setEditingId(null);
        setFormData({ title: '', difficultyLevel: 'EASY' });
        setError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ title: '', difficultyLevel: 'EASY' });
        setError('');
    };

    return (
        <div className="content-body">
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
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 600, color: '#2c3e50' }}>Course Catalog</h2>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {/* Search Bar */}
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search Courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '10px 40px 10px 15px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                width: '300px',
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

                    {/* Add New Course Button */}
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
                        + Add New Course
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>
            )}

            {/* Course List */}
            <CourseList
                courses={courses.filter(course =>
                    course.title.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManageSubjects={handleManageSubjects}
            />

            {/* Modal for Create/Edit Course */}
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
                            {editingId ? 'Edit Course' : 'Create New Course'}
                        </h3>

                        {error && (
                            <div className="alert alert-error" style={{ marginBottom: '15px' }}>{error}</div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#555' }}>
                                    Course Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Enter course title"
                                    value={formData.title}
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
                                    Difficulty Level
                                </label>
                                <select
                                    name="difficultyLevel"
                                    value={formData.difficultyLevel}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="EASY">EASY</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HARD">HARD</option>
                                </select>
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
                                    {loading ? 'Saving...' : editingId ? 'Update Course' : 'Save Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseManagement;
