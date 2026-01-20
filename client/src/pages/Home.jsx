import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Home() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (name) {
            setLoading(true);
            try {
                let user = await api.login(name);
                if (!user) {
                    // If not found, register automatically for this demo
                    user = await api.register(name, `${name}@example.com`);
                }
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/dashboard');
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Payment Memory
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                Record payments, share memories.
            </p>

            <form onSubmit={handleLogin} className="card" style={{ width: '100%' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Welcome</h2>
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Loading...' : 'Get Started'}
                </button>
            </form>
        </div>
    );
}
