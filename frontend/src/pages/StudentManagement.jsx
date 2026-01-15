import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './StudentManagement.css';

function StudentManagement() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        filterStudents();
    }, [students, searchQuery]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/students', {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            } else {
                setError('Failed to fetch students');
            }
        } catch (err) {
            setError('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const filterStudents = () => {
        if (searchQuery.trim() === '') {
            setFilteredStudents(students);
        } else {
            const filtered = students.filter(student =>
                student.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredStudents(filtered);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleViewPerformance = (studentId) => {
        navigate(`/students/${studentId}/performance`);
    };

    return (
        <div className="student-management-container">
            <h2 className="page-title">Student Management</h2>

            {error && (
                <div className="alert alert-error">{error}</div>
            )}

            {/* Search Filter */}
            <div className="filter-section">
                <h3 className="filter-title">Search Students</h3>
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Type to search by student name..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    {searchQuery && (
                        <button
                            className="clear-btn"
                            onClick={() => setSearchQuery('')}
                            title="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Student Grid */}
            <div className="students-section">
                {loading ? (
                    <div className="loading-message">Loading students...</div>
                ) : filteredStudents.length === 0 ? (
                    <div className="no-students-message">
                        {searchQuery.trim() === ''
                            ? 'No students found'
                            : `No students found matching "${searchQuery}"`}
                    </div>
                ) : (
                    <div className="students-grid">
                        {filteredStudents.map(student => (
                            <div key={student.id} className="student-card">
                                <div className="student-avatar">
                                    {student.name.charAt(0).toUpperCase()}
                                </div>
                                <h4 className="student-name">{student.name}</h4>
                                <button
                                    className="performance-btn"
                                    onClick={() => handleViewPerformance(student.id)}
                                >
                                    View Performance
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentManagement;
