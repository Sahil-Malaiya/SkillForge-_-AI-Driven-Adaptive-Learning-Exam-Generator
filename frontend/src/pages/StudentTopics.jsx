import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { topicService } from '../services/topicService';
import { subjectService } from '../services/subjectService';
import { courseService } from '../services/courseService';
import TopicCard from '../components/TopicCard';
import Sidebar from '../components/Sidebar';
import '../components/CourseList.css';

function StudentTopics() {
    const { courseId, subjectId } = useParams();
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [course, setCourse] = useState(null);
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch course info
                const allCourses = await courseService.getAllCourses();
                const currentCourse = allCourses.find(c => c.id === Number(courseId));
                setCourse(currentCourse);

                // Fetch subject info
                // We'll need to fetch all subjects or a specific one if endpoints allow
                // For now, let's fetch all subjects and find the right one to be safe, 
                // or use the specific endpoint if available.
                // Assuming subjectService.getAllSubjects returns all, or we can use the course subjects endpoint again.
                // Better approach: fetch specific subject by ID if endpoint exists, else filter.

                // Checking previous code: subjectService has getAllSubjects. 
                // Let's rely on that for now or fetch by ID if supported.
                // Based on TopicManagement.jsx, there is http://localhost:8080/api/subjects/${subjectId}

                const subjectResponse = await fetch(`http://localhost:8080/api/subjects/${subjectId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (subjectResponse.ok) {
                    const subjectData = await subjectResponse.json();
                    setSubject(subjectData);
                }

                // Fetch topics
                const topicsData = await topicService.getTopicsBySubject(subjectId);
                setTopics(topicsData);

            } catch (err) {
                console.error(err);
                setError('Failed to load content');
            } finally {
                setLoading(false);
            }
        };

        if (courseId && subjectId) {
            fetchData();
        }
    }, [courseId, subjectId]);

    return (
        <div className="dashboard-layout" style={{ background: 'white' }}>
            <Sidebar />
            <div className="main-content" style={{ background: 'white' }}>
                <div className="content-header" style={{ borderBottom: '1px solid #e1e8ed', background: 'white' }}>
                    <h1 style={{ color: '#1e3c72' }}>{subject ? subject.name : 'Subject Topics'}</h1>
                    <p style={{ color: '#7f8c8d' }}>
                        {subject ? `Topics in ${subject.name}` : 'Topics'}
                    </p>
                </div>

                <div className="content-body" style={{ background: 'white' }}>
                    <div className="breadcrumb" style={{ marginBottom: '20px', fontSize: '14px' }}>
                        <Link to="/student-dashboard/my-courses" className="breadcrumb-item link" style={{ color: '#667eea', textDecoration: 'none' }}>
                            All Courses
                        </Link>
                        <span className="breadcrumb-separator" style={{ margin: '0 8px' }}>›</span>
                        <Link to={`/student-dashboard/my-courses/${courseId}/subjects`} className="breadcrumb-item link" style={{ color: '#667eea', textDecoration: 'none' }}>
                            {course ? course.title : 'Course'}
                        </Link>
                        <span className="breadcrumb-separator" style={{ margin: '0 8px' }}>›</span>
                        <span className="breadcrumb-item active" style={{ color: '#7f8c8d' }}>
                            {subject ? subject.name : 'Subject'}
                        </span>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/student-dashboard/my-courses/${courseId}/subjects`)}
                        >
                            ← Back to Subjects
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Loading topics...</div>
                    ) : error ? (
                        <div className="alert alert-error">{error}</div>
                    ) : (
                        <div className="topics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                            {topics.map(topic => (
                                <TopicCard key={topic.id} topic={topic} />
                            ))}
                            {topics.length === 0 && <p style={{ color: '#7f8c8d' }}>No topics found for this subject.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentTopics;
