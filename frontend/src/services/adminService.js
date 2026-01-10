const API_URL = 'http://localhost:8080/api/admin';

const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const adminService = {
    createAdmin: async (registerPayload) => {
        const response = await fetch(`${API_URL}/create-admin`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(registerPayload)
        });
        if (!response.ok) throw new Error('Failed to create admin');
        return response.json();
    },

    getAllUsers: async () => {
        const response = await fetch(`${API_URL}/users`, { headers: getAuthHeader() });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    deleteUser: async (userId) => {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(err || 'Failed to delete user');
        }
        return response.json();
    }
};
