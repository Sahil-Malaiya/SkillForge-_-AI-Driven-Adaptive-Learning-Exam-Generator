import React, { useEffect, useState } from 'react';
import { studentService } from '../services/studentService';
import { authService } from '../services/authService';
import CourseCard from '../components/CourseCard';

function MyCourses() {
    const user = authService.getCurrentUser();
    const studentId = user?.userId || user?.userId || user?.userId;
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!studentId) return;
        (async () => {
            try {
                setLoading(true);
                const data = await studentService.getEnrolledCourses(studentId);
                setCourses(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load courses');
            } finally {
                setLoading(false);
            }
        })();
    }, [studentId]);

    return (
        <div className="page-layout">
            <h2>My Courses</h2>
            {loading ? (
                <p>Loading courses...</p>
            ) : error ? (
                <p>{error}</p>
            ) : courses.length === 0 ? (
                <p>No enrolled courses.</p>
            ) : (
                <div className="course-grid">
                    {courses.map(c => (
                        <CourseCard key={c.id} course={c} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyCourses;
