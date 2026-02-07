import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="auth-container">
            <div className="about-card">
                <div style={{ padding: 24 }}>
                    <header>
                        <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em' }}>About This Project</div>
                        <h1 className="card-title" style={{ marginTop: 10 }}>SkillForge</h1>
                        <div className="card-subtitle" style={{ marginTop: 8 }}>AI-Driven Adaptive Learning &amp; Exam Generator</div>
                        <div className="header-accent" style={{ marginTop: 18 }} />
                    </header>

                    <div className="about-grid" style={{ marginTop: 24 }}>
                        <div className="about-left">
                            <section className="about-section">
                                <h2>Project Overview</h2>
                                <p>SkillForge is a full-stack AI-based e-learning platform developed as part of the Infosys Springboard Internship Program. The project focuses on building an adaptive learning system that personalizes quizzes and learning paths for students based on their performance and engagement.</p>
                                <p className="mt-3">SkillForge helps students practice and improve through AI-generated quizzes and adaptive difficulty levels. Instructors can manage courses and content, while the system analyzes learner performance to provide meaningful insights and progress tracking.</p>
                                <p className="mt-3">This project demonstrates practical use of AI APIs, role-based systems, and scalable backend architecture in a real-world learning application.</p>
                            </section>

                            <section className="about-section">
                                <h3>Core Modules</h3>
                                <ul>
                                    <li><strong>User Authentication &amp; Role-Based Dashboards</strong> — Secure login with student and instructor dashboards using role-based access.</li>
                                    <li><strong>Course &amp; Content Management (Instructor)</strong> — Create and manage courses, subjects, topics, and question banks.</li>
                                    <li><strong>Adaptive Learning Engine (Student)</strong> — Quiz difficulty and learning flow adjust based on student performance.</li>
                                    <li><strong>AI-Generated Quiz Module</strong> — Uses Gemini API (LLM) to generate quiz questions dynamically.</li>
                                    <li><strong>Quiz Attempt &amp; Scoring</strong> — Supports timed quizzes, automatic scoring, and result summaries.</li>
                                    <li><strong>Analytics &amp; Adaptive Reports</strong> — Visual insights into performance trends and learning progression.</li>
                                </ul>
                            </section>
                        </div>

                        <aside className="about-right">
                            <section className="tech-card">
                                <h4>Tech stack</h4>
                                <div className="tech-list">
                                    <div className="tech-item"><div className="tech-title">Frontend</div><div className="tech-sub">React (Vite), Tailwind CSS</div></div>
                                    <div className="tech-item"><div className="tech-title">Backend</div><div className="tech-sub">Spring Boot (Java)</div></div>
                                    <div className="tech-item"><div className="tech-title">Database</div><div className="tech-sub">MySQL</div></div>
                                    <div className="tech-item"><div className="tech-title">AI Integration</div><div className="tech-sub">Gemini API for quiz generation and adaptive logic</div></div>
                                </div>
                            </section>

                            <section className="about-section">
                                <h4>Modules summary</h4>
                                <dl>
                                    <div>
                                        <dt>Authentication</dt>
                                        <dd>JWT/session-based authentication with role-specific dashboards for students and instructors.</dd>
                                    </div>
                                    <div>
                                        <dt>Content Management</dt>
                                        <dd>Instructor tools to curate courses, topics, and question banks.</dd>
                                    </div>
                                    <div>
                                        <dt>Adaptive Engine</dt>
                                        <dd>Learner profiling and adaptive question selection.</dd>
                                    </div>
                                </dl>
                            </section>

                            <section className="about-section">
                                <h4>Project credits</h4>
                                <ul>
                                    <li>Sahil Malaiya</li>
                                    <li>Anu M N</li>
                                    <li>Nilima Lakra</li>
                                </ul>
                            </section>
                        </aside>
                    </div>

                    <footer style={{ marginTop: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <Link to="/login" className="btn btn-lg btn-outline">Login</Link>
                            <Link to="/signup" className="btn btn-primary btn-lg">Sign Up</Link>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
