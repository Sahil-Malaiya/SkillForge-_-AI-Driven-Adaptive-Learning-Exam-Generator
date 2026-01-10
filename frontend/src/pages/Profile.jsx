import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { studentService } from '../services/studentService';

function Profile() {
    const user = authService.getCurrentUser();
    const studentId = user?.userId;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                // Try fetch by studentId (some setups use a separate students table)
                let res = await fetch(`http://localhost:8080/api/students/${studentId}`, { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
                if (!res.ok) {
                    // fallback: fetch all students and match by email
                    const all = await fetch('http://localhost:8080/api/students', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } }).then(r => r.json());
                    const match = all.find(s => s.email === user?.email || user?.email == null ? null : user.email);
                    if (match) {
                        res = { ok: true, json: async () => match };
                    } else {
                        throw new Error('Profile not found');
                    }
                }
                const data = await res.json();
                setProfile(data);
                setName(data.name || data.fullName || '');
                setEmail(data.email || '');
            } catch (err) {
                console.error(err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        })();
    }, [studentId]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const updated = { name, email };
            const res = await fetch(`http://localhost:8080/api/students/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
                body: JSON.stringify(updated)
            });
            if (!res.ok) throw new Error('Failed to update');
            const data = await res.json();
            setProfile(data);
            alert('Profile updated');
        } catch (err) {
            console.error(err);
            setError('Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-layout">
            <h2>Profile</h2>
            {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
                <div className="profile-form">
                    <label>Full Name
                        <input value={name} onChange={e => setName(e.target.value)} />
                    </label>
                    <label>Email
                        <input value={email} onChange={e => setEmail(e.target.value)} />
                    </label>
                    <button onClick={handleSave}>Save</button>
                </div>
            )}
        </div>
    );
}

export default Profile;
