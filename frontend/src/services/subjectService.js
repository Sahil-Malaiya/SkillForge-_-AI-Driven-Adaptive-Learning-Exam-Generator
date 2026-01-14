const API_URL = 'http://localhost:8080/api/subjects';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const subjectService = {
    getAllSubjects: async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });
            if (!response.ok) throw new Error('Failed to fetch subjects');
            return await response.json();
        } catch (error) {
            console.error('Error fetching subjects:', error);
            throw error;
        }
    },

    getSubjectById: async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });
            if (!response.ok) throw new Error('Failed to fetch subject');
            return await response.json();
        } catch (error) {
            console.error('Error fetching subject:', error);
            throw error;
        }
    },

    createSubject: async (subjectData) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(subjectData)
            });
            if (!response.ok) throw new Error('Failed to create subject');
            return await response.json();
        } catch (error) {
            console.error('Error creating subject:', error);
            throw error;
        }
    },

    updateSubject: async (id, subjectData) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(subjectData)
            });
            if (!response.ok) throw new Error('Failed to update subject');
            return await response.json();
        } catch (error) {
            console.error('Error updating subject:', error);
            throw error;
        }
    },

    deleteSubject: async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    ...getAuthHeader()
                }
            });
            if (!response.ok) throw new Error('Failed to delete subject');
            return true;
        } catch (error) {
            console.error('Error deleting subject:', error);
            throw error;
        }
    }
};
