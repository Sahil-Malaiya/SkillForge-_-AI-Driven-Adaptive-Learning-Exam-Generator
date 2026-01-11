import './SubjectCard.css';

function SubjectCard({ subject, onEdit, onDelete, onManageTopics }) {
    return (
        <div className="subject-card">
            <div className="subject-card-header"></div>
            <div className="subject-card-body">
                <h4 className="subject-card-title">{subject.name}</h4>
                <p className="subject-card-description">
                    {subject.description || 'No description provided'}
                </p>
            </div>
            <div className="subject-card-footer">
                {onEdit && (
                    <button
                        className="subject-card-btn"
                        onClick={() => onEdit(subject)}
                        title="Edit Subject"
                    >
                        ✏️ Edit
                    </button>
                )}
                {onDelete && (
                    <button
                        className="subject-card-btn"
                        onClick={() => onDelete(subject.id)}
                        title="Delete Subject"
                    >
                        🗑️ Delete
                    </button>
                )}
                {onManageTopics && (
                    <button
                        className="subject-card-btn btn-primary-action"
                        onClick={() => onManageTopics(subject.id)}
                        title={onEdit ? "Manage Topics" : "View Topics"}
                    >
                        📚 {onEdit ? 'Manage Topics' : 'View Topics'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default SubjectCard;
