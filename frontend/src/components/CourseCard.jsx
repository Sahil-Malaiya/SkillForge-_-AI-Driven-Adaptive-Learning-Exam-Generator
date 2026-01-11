import './CourseCard.css';

function CourseCard({ course, onEdit, onDelete, onManageSubjects }) {
    const getDifficultyColor = (level) => {
        switch (level) {
            case 'EASY': return '#10b981';
            case 'MEDIUM': return '#f59e0b';
            case 'HARD': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getDifficultyGradient = (level) => {
        switch (level) {
            case 'EASY': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            case 'MEDIUM': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            case 'HARD': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
        }
    };

    return (
        <div className="course-card">
            <div
                className="course-card-header"
                style={{ background: getDifficultyGradient(course.difficultyLevel) }}
            >
                <div className="course-card-badge">
                    <span className="difficulty-badge">
                        {course.difficultyLevel}
                    </span>
                </div>
            </div>

            <div className="course-card-body">
                <h3 className="course-card-title" title={course.title}>
                    {course.title}
                </h3>

                <div className="course-card-meta">
                    <div className="meta-item">
                        <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>ID: {course.id}</span>
                    </div>
                </div>
            </div>

            <div className="course-card-footer">
                {onEdit && (
                    <button
                        onClick={() => onEdit(course)}
                        className="card-btn card-btn-edit"
                        title="Edit Course"
                    >
                        <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                )}

                {onManageSubjects && (
                    <button
                        onClick={() => onManageSubjects(course.id)}
                        className="card-btn card-btn-manage"
                        title="Manage Subjects"
                    >
                        <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {onEdit ? 'Subjects' : 'View Course'}
                    </button>
                )}

                {onDelete && (
                    <button
                        onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
                                onDelete(course.id);
                            }
                        }}
                        className="card-btn card-btn-delete"
                        title="Delete Course"
                    >
                        <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}

export default CourseCard;
