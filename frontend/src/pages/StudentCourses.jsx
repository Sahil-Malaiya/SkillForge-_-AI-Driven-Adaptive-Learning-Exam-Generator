import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseService';
import CourseCard from '../components/CourseCard';
import Sidebar from '../components/Sidebar';
import '../components/CourseList.css';

function StudentCourses() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllCourses();
    }, []);

    const fetchAllCourses = async () => {
        try {
            setLoading(true);
            const data = await courseService.getAllCourses();
            setCourses(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseClick = (courseId) => {
        navigate(`/student-dashboard/my-courses/${courseId}/subjects`);
    };

    return (
        <div className="dashboard-layout" style={{ background: 'white' }}>
            <Sidebar />
            <div className="main-content" style={{ background: 'white' }}>
                <div className="content-header" style={{ borderBottom: '1px solid #e1e8ed', background: 'white' }}>
                    <h1 style={{ color: '#1e3c72' }}>My Courses</h1>
                    <p style={{ color: '#7f8c8d' }}>Explore and learn from the courses available to you.</p>
                </div>

                <div className="content-body" style={{ background: 'white' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Loading courses...</div>
                    ) : error ? (
                        <div className="alert alert-error">{error}</div>
                    ) : (
                        <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {courses.map(course => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onManageSubjects={handleCourseClick}
                                // No onEdit or onDelete passed here, so buttons won't show
                                />
                            ))}
                            {courses.length === 0 && <p style={{ color: '#7f8c8d' }}>No courses available at the moment.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentCourses;
