// SkillForge - AI-Driven Adaptive Learning Platform
// second refference commmit
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import Profile from './pages/Profile';
import MyCourses from './pages/MyCourses';
import AIQuiz from './pages/AIQuiz';
import StudentQuizzes from './pages/StudentQuizzes';
import Performance from './pages/Performance';
import InstructorStudentPerformance from './pages/InstructorStudentPerformance';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourseManagement from './pages/CourseManagement';
import SubjectManagement from './pages/SubjectManagement';
import TopicManagement from './pages/TopicManagement';
import StudentManagement from './pages/StudentManagement';
import QuizManagement from './pages/QuizManagement';
import QuizGrading from './pages/QuizGrading';
import { authService } from './services/authService';

function PrivateRoute({ children }) {
    return authService.isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/student-dashboard"
                    element={
                        <PrivateRoute>
                            <StudentDashboard />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/student-dashboard/profile"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/student-dashboard/my-courses"
                    element={
                        <PrivateRoute>
                            <MyCourses />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/student-dashboard/quizzes"
                    element={
                        <PrivateRoute>
                            <StudentQuizzes />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/student-dashboard/ai-quiz"
                    element={
                        <PrivateRoute>
                            <AIQuiz />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/student-dashboard/performance"
                    element={
                        <PrivateRoute>
                            <Performance />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/instructor/students/:studentId/performance"
                    element={
                        <PrivateRoute>
                            <InstructorStudentPerformance />
                        </PrivateRoute>
                    }
                />

                {/* Instructor Dashboard with nested routes */}
                <Route
                    path="/instructor-dashboard"
                    element={
                        <PrivateRoute>
                            <InstructorDashboard />
                        </PrivateRoute>
                    }
                >
                    <Route path="courses" element={<CourseManagement />} />
                    <Route path="students" element={<StudentManagement />} />
                </Route>

                {/* Instructor route (alias) with index to show dashboard */}
                <Route
                    path="/instructor"
                    element={
                        <PrivateRoute>
                            <InstructorDashboard />
                        </PrivateRoute>
                    }
                >
                    <Route path="courses" element={<CourseManagement />} />
                    <Route path="students" element={<StudentManagement />} />
                </Route>

                {/* Standalone routes for management pages */}
                <Route
                    path="/courses"
                    element={
                        <PrivateRoute>
                            <InstructorDashboard />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<CourseManagement />} />
                    <Route path=":courseId/subjects" element={<SubjectManagement />} />
                    <Route path=":courseId/subjects/:subjectId/topics" element={<TopicManagement />} />
                </Route>

                <Route
                    path="/students"
                    element={
                        <PrivateRoute>
                            <InstructorDashboard />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<StudentManagement />} />
                </Route>

                <Route
                    path="/quizzes"
                    element={
                        <PrivateRoute>
                            <InstructorDashboard />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<QuizManagement />} />
                </Route>

                <Route
                    path="/grading"
                    element={
                        <PrivateRoute>
                            <InstructorDashboard />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<QuizGrading />} />
                </Route>

                <Route
                    path="/admin-dashboard"
                    element={
                        <PrivateRoute>
                            <AdminDashboard />
                        </PrivateRoute>
                    }
                />

                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
