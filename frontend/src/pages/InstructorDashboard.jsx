import { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

function InstructorDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = authService.getCurrentUser()?.user || authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const menuItems = [
        {
            name: 'Home',
            path: '/instructor',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 13h8V3H3v10z" /><path d="M13 21h8v-8h-8v8z" /><path d="M13 3v8h8" /></svg>
        },
        {
            name: 'Courses',
            path: '/courses',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        },
        {
            name: 'Students',
            path: '/students',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        },
        {
            name: 'Quizzes',
            path: '/quizzes',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        },
        {
            name: 'Grading',
            path: '/grading',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
        },
    ];

    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    const showDashboard = location.pathname === '/instructor-dashboard' || location.pathname === '/instructor';

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-brand">SkillForge</div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <div
                            key={item.name}
                            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
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
            <div className="main-content">
                <div className="content-header">
                    <h1>Instructor Dashboard</h1>
                    <p>Welcome, {user?.fullName || 'Instructor'}</p>
                </div>

                {/* This will render the child routes (CourseManagement, StudentManagement, etc.) */}
                {showDashboard ? (
                    <div className="content-body">
                        <div className="dashboard-cards">
                            <div className="dashboard-card">
                                <h3>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}>
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                    </svg>
                                    Manage Courses
                                </h3>
                                <p>Create, edit, and manage your course content and materials.</p>
                                <button className="btn btn-primary" onClick={() => navigate('/courses')}>
                                    View Courses
                                </button>
                            </div>

                            <div className="dashboard-card">
                                <h3>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}>
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    Manage Students
                                </h3>
                                <p>Add, edit, and manage student information and enrollments.</p>
                                <button className="btn btn-primary" onClick={() => navigate('/students')}>
                                    View Students
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Outlet />
                )}
            </div>
        </div>
    );
}

export default InstructorDashboard;
