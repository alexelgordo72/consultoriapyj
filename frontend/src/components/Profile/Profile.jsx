import React, { useState, useEffect } from 'react';

const Profile = ({ user }) => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://10.147.17.6:4000/api/auth/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (!profile) return <div>Cargando...</div>;

    return (
        <div className="profile-info" style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
            <p><strong>Usuario:</strong> {profile.username}</p>
            <p><strong>Nombre:</strong> {profile.full_name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Rol:</strong> {profile.role}</p>
        </div>
    );
};

export default Profile;
