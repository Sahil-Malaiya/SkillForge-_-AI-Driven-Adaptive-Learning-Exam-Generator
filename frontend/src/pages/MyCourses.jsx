import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseService';
import { subjectService } from '../services/subjectService';
import { topicService } from '../services/topicService';
import { authService } from '../services/authService';
import CourseCard from '../components/CourseCard';
import SubjectCard from '../components/SubjectCard';
import TopicCard from '../components/TopicCard';
import '../components/CourseList.css';

const VIEWS = {
    COURSES: 'COURSES',
    SUBJECTS: 'SUBJECTS',
    TOPICS: 'TOPICS'
};

function MyCourses() {
    const navigate = useNavigate();
    const [view, setView] = useState(VIEWS.COURSES);
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user = authService.getCurrentUser()?.user || authService.getCurrentUser();

    useEffect(() => {
        if (view === VIEWS.COURSES) {
            fetchAllCourses();
        }
    }, [view]);

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

    const handleCourseClick = async (courseId) => {
        try {
            setLoading(true);
            const course = courses.find(c => c.id === courseId);
            setSelectedCourse(course);

            const response = await fetch(`http://localhost:8080/api/subjects/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSubjects(data);
                setView(VIEWS.SUBJECTS);
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

    const handleSubjectClick = async (subjectId) => {
        try {
            setLoading(true);
            const subject = subjects.find(s => s.id === subjectId);
            setSelectedSubject(subject);

            const data = await topicService.getTopicsBySubject(subjectId);
            setTopics(data);
            setView(VIEWS.TOPICS);
        } catch (err) {
            console.error(err);
            setError('Failed to load topics');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToCourses = () => {
        setView(VIEWS.COURSES);
        setSelectedCourse(null);
        setSelectedSubject(null);
        setSubjects([]);
        setTopics([]);
    };

    const handleBackToSubjects = () => {
        setView(VIEWS.SUBJECTS);
        setSelectedSubject(null);
        setTopics([]);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const menuItems = [
        {
            name: 'Dashboard',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
        },
        {
            name: 'My Courses',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        },
        {
            name: 'Profile',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        },
        {
            name: 'Performance',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><polyline points="3 13 9 7 13 11 21 3" /></svg>
        },
    ];

    const renderBreadcrumbs = () => (
        <div className="breadcrumb" style={{ marginBottom: '20px', fontSize: '14px' }}>
            <span
                className={`breadcrumb-item ${view === VIEWS.COURSES ? 'active' : 'link'}`}
                onClick={view !== VIEWS.COURSES ? handleBackToCourses : undefined}
                style={{ cursor: view !== VIEWS.COURSES ? 'pointer' : 'default', color: view !== VIEWS.COURSES ? '#667eea' : '#7f8c8d' }}
            >
                All Courses
            </span>
            {selectedCourse && (
                <>
                    <span className="breadcrumb-separator" style={{ margin: '0 8px' }}>›</span>
                    <span
                        className={`breadcrumb-item ${view === VIEWS.SUBJECTS ? 'active' : 'link'}`}
                        onClick={view === VIEWS.TOPICS ? handleBackToSubjects : undefined}
                        style={{ cursor: view === VIEWS.TOPICS ? 'pointer' : 'default', color: view === VIEWS.TOPICS ? '#667eea' : '#7f8c8d' }}
                    >
                        {selectedCourse.title}
                    </span>
                </>
            )}
            {selectedSubject && (
                <>
                    <span className="breadcrumb-separator" style={{ margin: '0 8px' }}>›</span>
                    <span className="breadcrumb-item active" style={{ color: '#7f8c8d' }}>
                        {selectedSubject.name}
                    </span>
                </>
            )}
        </div>
    );

    return (
        <div className="dashboard-layout" style={{ background: 'white' }}>
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-brand">SkillForge</div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <div
                            key={item.name}
                            className={`sidebar-item ${item.name === 'My Courses' ? 'active' : ''}`}
                            onClick={() => {
                                if (item.name === 'Dashboard') {
                                    navigate('/student-dashboard');
                                } else if (item.name === 'Profile') {
                                    navigate('/student-dashboard/profile');
                                } else if (item.name === 'My Courses') {
                                    handleBackToCourses();
                                } else if (item.name === 'Performance') {
                                    navigate('/student-dashboard/performance');
                                }
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                            {item.name}
                        </div>
                    ))}
                    <div className="sidebar-item" onClick={handleLogout}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </span>
                        Logout
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content" style={{ background: 'white' }}>
                <div className="content-header" style={{ borderBottom: '1px solid #e1e8ed', background: 'white' }}>
                    <h1 style={{ color: '#1e3c72' }}>My Courses</h1>
                    <p style={{ color: '#7f8c8d' }}>Explore and learn from the courses available to you.</p>
                </div>

                <div className="content-body" style={{ background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ color: '#2c3e50', margin: 0 }}>
                            {view === VIEWS.COURSES && 'Recommended Courses'}
                            {view === VIEWS.SUBJECTS && `Subjects in ${selectedCourse?.title}`}
                            {view === VIEWS.TOPICS && `Topics in ${selectedSubject?.name}`}
                        </h2>
                        {view !== VIEWS.COURSES && (
                            <button
                                className="btn btn-primary"
                                onClick={view === VIEWS.TOPICS ? handleBackToSubjects : handleBackToCourses}
                            >
                                ← Back
                            </button>
                        )}
                    </div>

                    {renderBreadcrumbs()}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Loading content...</div>
                    ) : error ? (
                        <div className="alert alert-error">{error}</div>
                    ) : (
                        <>
                            {view === VIEWS.COURSES && (
                                <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                    {courses.map(course => (
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                            onManageSubjects={handleCourseClick}
                                        />
                                    ))}
                                    {courses.length === 0 && <p style={{ color: '#7f8c8d' }}>No courses available at the moment.</p>}
                                </div>
                            )}

                            {view === VIEWS.SUBJECTS && (
                                <div className="subjects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                    {subjects.map(subject => (
                                        <SubjectCard
                                            key={subject.id}
                                            subject={subject}
                                            onManageTopics={handleSubjectClick}
                                        />
                                    ))}
                                    {subjects.length === 0 && <p style={{ color: '#7f8c8d' }}>No subjects found for this course.</p>}
                                </div>
                            )}

                            {view === VIEWS.TOPICS && (
                                <div className="topics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                                    {topics.map(topic => (
                                        <TopicCard key={topic.id} topic={topic} />
                                    ))}
                                    {topics.length === 0 && <p style={{ color: '#7f8c8d' }}>No topics found for this subject.</p>}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyCourses;
