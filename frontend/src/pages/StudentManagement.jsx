import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function StudentManagement() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/students', {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (err) {
            setError('Failed to fetch students');
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
                ? `http://localhost:8080/api/students/${editingId}`
                : 'http://localhost:8080/api/students';

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setFormData({ name: '', email: '' });
                setEditingId(null);
                fetchStudents();
            } else {
                setError('Failed to save student');
            }
        } catch (err) {
            setError('Failed to save student');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (student) => {
        setFormData({
            name: student.name,
            email: student.email
        });
        setEditingId(student.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/students/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });

            if (response.ok) {
                fetchStudents();
            } else {
                setError('Failed to delete student');
            }
        } catch (err) {
            setError('Failed to delete student');
        }
    };

    return (
        <div className="content-body">
            <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Student Management</h2>

            {error && (
                <div className="alert alert-error">{error}</div>
            )}

            <div className="form-section">
                <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>
                    {editingId ? 'Edit Student' : 'Add Student'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Student Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-input"
                                placeholder="Enter student name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Student Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                placeholder="Enter student email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : editingId ? 'Update Student' : 'Save Student'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ name: '', email: '' });
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="table-container">
                <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>All Students</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                    No students found
                                </td>
                            </tr>
                        ) : (
                            students.map(student => (
                                <tr key={student.id}>
                                    <td>{student.id}</td>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-small btn-primary"
                                                onClick={() => handleEdit(student)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-small btn-secondary"
                                                onClick={() => navigate(`/students/${student.id}/performance`)}
                                                style={{ marginLeft: 8 }}
                                            >
                                                View Performance
                                            </button>
                                            <button
                                                className="btn btn-small btn-danger"
                                                onClick={() => handleDelete(student.id)}
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

export default StudentManagement;
