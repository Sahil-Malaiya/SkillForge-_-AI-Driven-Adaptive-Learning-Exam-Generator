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

            // Get current user to extract instructorId
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    return (
        <div className="content-body">
            <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Course Management</h2>

            {error && (
                <div className="alert alert-error">{error}</div>
            )}

            <div className="form-section">
                <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>
                    {editingId ? 'Edit Course' : 'Create Course'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="title">Course Title:</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="form-input"
                                placeholder="Enter course title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="difficultyLevel">Difficulty:</label>
                            <select
                                id="difficultyLevel"
                                name="difficultyLevel"
                                className="form-select"
                                value={formData.difficultyLevel}
                                onChange={handleChange}
                            >
                                <option value="EASY">EASY</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HARD">HARD</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : editingId ? 'Update Course' : 'Save Course'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ title: '', difficultyLevel: 'EASY' });
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <CourseList
                courses={courses}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManageSubjects={handleManageSubjects}
            />
        </div>
    );
}

export default CourseManagement;

