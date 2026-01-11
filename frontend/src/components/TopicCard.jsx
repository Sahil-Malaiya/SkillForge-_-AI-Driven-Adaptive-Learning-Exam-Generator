import './TopicCard.css';

function TopicCard({ topic }) {
    const buildAssetUrl = (url) => {
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        const normalized = url.startsWith('/') ? url : `/${url}`;
        return `http://localhost:8080${normalized}`;
    };

    return (
        <div className="topic-card">
            <div className="topic-card-body">
                <h4 className="topic-card-title">{topic.title}</h4>

                <div className="topic-content-preview">
                    {topic.videoUrl && (
                        <div className="topic-video-container">
                            <video
                                controls
                                className="topic-video-element"
                            >
                                <source src={buildAssetUrl(topic.videoUrl)} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}
                </div>

                <div className="topic-links mt-3">
                    {topic.pdfUrl && (
                        <a
                            href={buildAssetUrl(topic.pdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="topic-link-btn pdf-btn"
                        >
                            📄 View PDF Document
                        </a>
                    )}
                    {topic.externalLink && (
                        <a
                            href={topic.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="topic-link-btn external-btn"
                        >
                            🔗 External Resource
                        </a>
                    )}
                    {!topic.pdfUrl && !topic.externalLink && !topic.videoUrl && (
                        <p className="no-resources">No additional resources available for this topic.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TopicCard;
