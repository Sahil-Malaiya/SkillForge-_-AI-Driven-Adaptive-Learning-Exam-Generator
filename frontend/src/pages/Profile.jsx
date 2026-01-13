import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import Sidebar from '../components/Sidebar';
import './Profile.css';

function Profile() {
    const user = authService.getCurrentUser();
    const studentId = user?.userId;

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [showImageDialog, setShowImageDialog] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        dateOfBirth: '',
        location: '',
        profileImage: null
    });

    useEffect(() => {
        fetchProfile();
    }, [studentId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            let res = await fetch(`http://localhost:8080/api/students/${studentId}`, {
                headers: { 'Authorization': `Bearer ${authService.getToken()}` }
            });

            if (!res.ok) {
                const all = await fetch('http://localhost:8080/api/students', {
                    headers: { 'Authorization': `Bearer ${authService.getToken()}` }
                }).then(r => r.json());
                const match = all.find(s => s.email === user?.email);
                if (match) {
                    res = { ok: true, json: async () => match };
                } else {
                    throw new Error('Profile not found');
                }
            }

            const data = await res.json();
            setProfile(data);
            setFormData({
                name: data.name || data.fullName || '',
                email: data.email || '',
                phone: data.phone || '',
                bio: data.bio || '',
                dateOfBirth: data.dateOfBirth || '',
                location: data.location || '',
                profileImage: data.profileImage || null
            });
        } catch (err) {
            console.error(err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('Image size must be less than 2MB');
            return;
        }

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setError('Only JPEG, PNG, and WEBP images are allowed');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, profileImage: reader.result }));
            setShowImageDialog(false);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, profileImage: null }));
        setShowImageDialog(false);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`http://localhost:8080/api/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to update profile');

            const data = await res.json();
            setProfile(data);
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: profile?.name || profile?.fullName || '',
            email: profile?.email || '',
            phone: profile?.phone || '',
            bio: profile?.bio || '',
            dateOfBirth: profile?.dateOfBirth || '',
            location: profile?.location || '',
            profileImage: profile?.profileImage || null
        });
        setIsEditing(false);
        setError(null);
    };

    const getInitials = () => {
        const name = formData.name || 'Student';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-content">
                <div className="profile-page">
                    {/* Header */}
                    <div className="profile-header">
                        <h1 style={{ color: '#1e3c72', fontSize: '32px', fontWeight: 700, margin: 0 }}>My Profile</h1>
                        <p style={{ color: '#6c757d', margin: '8px 0 0 0' }}>Manage your personal information</p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="success-banner">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {successMessage}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="error-banner">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {loading && !profile ? (
                        <div className="profile-loading">
                            <div className="spinner"></div>
                            <p>Loading profile...</p>
                        </div>
                    ) : (
                        <div className="profile-container">
                            {/* Profile Card */}
                            <div className="profile-card">
                                {/* Avatar Section */}
                                <div className="avatar-section">
                                    <div className="avatar-wrapper">
                                        {formData.profileImage ? (
                                            <img src={formData.profileImage} alt="Profile" className="avatar-image" />
                                        ) : (
                                            <div className="avatar-initials">{getInitials()}</div>
                                        )}
                                        {isEditing && (
                                            <button
                                                className="avatar-edit-btn"
                                                onClick={() => setShowImageDialog(true)}
                                                title="Change profile picture"
                                            >
                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    <div className="avatar-info">
                                        <h2>{formData.name || 'Student'}</h2>
                                        <p>{formData.email}</p>
                                    </div>
                                </div>

                                {/* Profile Form */}
                                <div className="profile-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="name">Full Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Enter your full name"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="email">Email Address</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Enter your email"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="phone">Phone Number</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Enter your phone number"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="dateOfBirth">Date of Birth</label>
                                            <input
                                                type="date"
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label htmlFor="location">Location</label>
                                            <input
                                                type="text"
                                                id="location"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="City, Country"
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label htmlFor="bio">Bio</label>
                                            <textarea
                                                id="bio"
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Tell us about yourself..."
                                                rows="4"
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="form-actions">
                                        {!isEditing ? (
                                            <button
                                                className="btn-edit"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit Profile
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn-save"
                                                    onClick={handleSave}
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Saving...' : 'Save Changes'}
                                                </button>
                                                <button
                                                    className="btn-cancel"
                                                    onClick={handleCancel}
                                                    disabled={loading}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image Upload Dialog */}
                    {showImageDialog && (
                        <div className="modal-overlay" onClick={() => setShowImageDialog(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <h3>Profile Picture</h3>
                                <div className="modal-actions">
                                    <label className="upload-btn">
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Upload New Photo
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {formData.profileImage && (
                                        <button className="remove-btn" onClick={handleRemoveImage}>
                                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Remove Photo
                                        </button>
                                    )}
                                    <button className="close-btn" onClick={() => setShowImageDialog(false)}>
                                        Close
                                    </button>
                                </div>
                                <p className="modal-hint">Supported formats: JPEG, PNG, WEBP (max 2MB)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
