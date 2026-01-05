const API_URL = 'http://localhost:8080/api/students';

// Get JWT token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const studentService = {
    // Get all students
    getAllStudents: async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });
            if (!response.ok) throw new Error('Failed to fetch students');
            return await response.json();
        } catch (error) {
            console.error('Error fetching students:', error);
            throw error;
        }
    },

    // Create a new student
    createStudent: async (studentData) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(studentData)
            });
            if (!response.ok) throw new Error('Failed to create student');
            return await response.json();
        } catch (error) {
            console.error('Error creating student:', error);
            throw error;
        }
    },

    // Update an existing student
    updateStudent: async (id, studentData) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(studentData)
            });
            if (!response.ok) throw new Error('Failed to update student');
            return await response.json();
        } catch (error) {
            console.error('Error updating student:', error);
            throw error;
        }
    },

    // Delete a student
    deleteStudent: async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    ...getAuthHeader()
                }
            });
            if (!response.ok) throw new Error('Failed to delete student');
            return true;
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    }
,

    getEnrolledCourses: async (studentId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/students/${studentId}/courses`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });
            if (!response.ok) throw new Error('Failed to fetch enrolled courses');
            return await response.json();
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            throw error;
        }
    }
};
