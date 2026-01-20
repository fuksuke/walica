import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function JoinGroup() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load group info to confirm what we are joining
        api.getGroup(id).then(setGroup).catch(() => {
            // If fail, maybe invalid ID
        });
    }, [id]);

    const handleJoin = async () => {
        if (!user) {
            // Simple registration/login flow inline
            if (!name) return;
            try {
                setLoading(true);
                let newUser = await api.login(name);
                if (!newUser) {
                    newUser = await api.register(name, `${name}@example.com`);
                }
                localStorage.setItem('user', JSON.stringify(newUser));
                setUser(newUser);
                // Now join
                await api.joinGroup(id, newUser.id);
                navigate(`/group/${id}`);
            } catch (err) {
                alert('Failed to join: ' + err.message);
                setLoading(false);
            }
        } else {
            try {
                setLoading(true);
                await api.joinGroup(id, user.id);
                navigate(`/group/${id}`);
            } catch (err) {
                alert('Failed to join: ' + err.message);
                setLoading(false);
            }
        }
    };

    if (!group) return <div className="container">Loading invite info...</div>;

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div className="card" style={{ width: '100%' }}>
                <h2 style={{ marginBottom: '1rem' }}>You are invited to join</h2>
                <h1 style={{ marginBottom: '2rem', color: 'var(--color-primary)' }}>{group.name}</h1>

                {!user ? (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>Enter your name to join:</p>
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{ marginBottom: '1rem' }}
                        />
                        <button onClick={handleJoin} className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Joining...' : 'Join Group'}
                        </button>
                    </div>
                ) : (
                    <div>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                            Joining as <strong>{user.name}</strong>
                        </p>
                        <button onClick={handleJoin} className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Joining...' : 'Join Group'}
                        </button>
                        <button onClick={() => {
                            localStorage.removeItem('user');
                            setUser(null);
                        }} className="btn" style={{ marginTop: '1rem', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
                            Switch Account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
