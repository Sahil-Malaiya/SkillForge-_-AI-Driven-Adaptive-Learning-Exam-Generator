import { useState, useMemo } from 'react';
import CourseCard from './CourseCard';
import './CourseList.css';

function CourseList({ courses, onEdit, onDelete, onManageSubjects, hideSearch = false }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('ALL');

    // Filter and search courses
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDifficulty = difficultyFilter === 'ALL' || course.difficultyLevel === difficultyFilter;
            return matchesSearch && matchesDifficulty;
        });
    }, [courses, searchTerm, difficultyFilter]);

    // Calculate statistics
    const stats = useMemo(() => {
        return {
            total: courses.length,
            easy: courses.filter(c => c.difficultyLevel === 'EASY').length,
            medium: courses.filter(c => c.difficultyLevel === 'MEDIUM').length,
            hard: courses.filter(c => c.difficultyLevel === 'HARD').length,
        };
    }, [courses]);

    // Use filtered courses if hideSearch is false, otherwise use courses directly
    const displayCourses = hideSearch ? courses : filteredCourses;

    return (
        <div className="course-list-container">
            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Courses</div>
                    </div>
                </div>

                <div className="stat-card stat-easy">
                    <div className="stat-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.easy}</div>
                        <div className="stat-label">Easy</div>
                    </div>
                </div>

                <div className="stat-card stat-medium">
                    <div className="stat-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.medium}</div>
                        <div className="stat-label">Medium</div>
                    </div>
                </div>

                <div className="stat-card stat-hard">
                    <div className="stat-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.hard}</div>
                        <div className="stat-label">Hard</div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar - Only show if hideSearch is false */}
            {!hideSearch && (
                <>
                    <div className="filter-bar">
                        <div className="search-box">
                            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            {searchTerm && (
                                <button
                                    className="clear-search"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="Clear search"
                                >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="filter-group">
                            <label htmlFor="difficulty-filter" className="filter-label">
                                <svg className="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filter:
                            </label>
                            <select
                                id="difficulty-filter"
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="ALL">All Levels</option>
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="results-info">
                        Showing <strong>{displayCourses.length}</strong> of <strong>{courses.length}</strong> courses
                    </div>
                </>
            )}

            {/* Course Cards Grid */}
            {displayCourses.length === 0 ? (
                <div className="empty-state">
                    <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="empty-title">
                        {courses.length === 0 ? 'No courses yet' : 'No courses found'}
                    </h3>
                    <p className="empty-description">
                        {courses.length === 0
                            ? 'Create your first course to get started!'
                            : 'Try adjusting your search or filter criteria'}
                    </p>
                </div>
            ) : (
                <div className="courses-grid">
                    {displayCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onManageSubjects={onManageSubjects}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default CourseList;
