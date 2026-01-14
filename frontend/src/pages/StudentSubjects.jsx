import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { courseService } from '../services/courseService';
import SubjectCard from '../components/SubjectCard';
import Sidebar from '../components/Sidebar';
import '../components/CourseList.css';

function StudentSubjects() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch course details for breadcrumb/title
                // Note: ideally we might want a specific getCourse endpoint or reuse the list
                const allCourses = await courseService.getAllCourses();
                const currentCourse = allCourses.find(c => c.id === Number(courseId));
                setCourse(currentCourse);

                // Fetch subjects
                const response = await fetch(`http://localhost:8080/api/subjects/course/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setSubjects(data);
                } else {
                    throw new Error('Failed to fetch subjects');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load subjects');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchData();
        }
    }, [courseId]);

    const handleSubjectClick = (subjectId) => {
        navigate(`/student-dashboard/my-courses/${courseId}/subjects/${subjectId}/topics`);
    };

    return (
        <div className="dashboard-layout" style={{ background: 'white' }}>
            <Sidebar />
            <div className="main-content" style={{ background: 'white' }}>
                <div className="content-header" style={{ borderBottom: '1px solid #e1e8ed', background: 'white' }}>
                    <h1 style={{ color: '#1e3c72' }}>{course ? course.title : 'Course Subjects'}</h1>
                    <p style={{ color: '#7f8c8d' }}>Select a subject to view its topics.</p>
                </div>

                <div className="content-body" style={{ background: 'white' }}>
                    <div className="breadcrumb" style={{ marginBottom: '20px', fontSize: '14px' }}>
                        <Link to="/student-dashboard/my-courses" className="breadcrumb-item link" style={{ color: '#667eea', textDecoration: 'none' }}>
                            All Courses
                        </Link>
                        <span className="breadcrumb-separator" style={{ margin: '0 8px' }}>›</span>
                        <span className="breadcrumb-item active" style={{ color: '#7f8c8d' }}>
                            {course ? course.title : 'Loading...'}
                        </span>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/student-dashboard/my-courses')}
                        >
                            ← Back to Courses
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Loading subjects...</div>
                    ) : error ? (
                        <div className="alert alert-error">{error}</div>
                    ) : (
                        <div className="subjects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {subjects.map(subject => (
                                <SubjectCard
                                    key={subject.id}
                                    subject={subject}
                                    onManageTopics={handleSubjectClick}
                                // No onEdit or onDelete passed here
                                />
                            ))}
                            {subjects.length === 0 && <p style={{ color: '#7f8c8d' }}>No subjects found for this course.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentSubjects;
