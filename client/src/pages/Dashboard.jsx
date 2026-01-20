import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Users, RefreshCw } from 'lucide-react';
import { api } from '../api';

export default function Dashboard() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.id && !user.name) {
            navigate('/');
            return;
        }
        loadGroups();
    }, []);

    const loadGroups = async () => {
        setLoading(true);
        try {
            // In a real app we'd use user.id, but for this simple version check we rely on user object having ID if from login
            // If user object just has name from local storage demo, we might need to rely on name lookup or handle it.
            // For now, let's assume user.id is present from login response.
            if (user.id) {
                const data = await api.getGroups(user.id);
                setGroups(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async () => {
        const name = prompt('Enter group name:');
        if (name) {
            setCreating(true);
            try {
                await api.createGroup(name, user.id);
                loadGroups();
            } catch (err) {
                alert('Failed to create group');
            } finally {
                setCreating(false);
            }
        }
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem 0' }}>
                <h2>Dashboard</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{user.name}</span>
                    <button onClick={loadGroups} className="btn" style={{ padding: '0.5rem' }}><RefreshCw size={16} /></button>
                </div>
            </header>

            {loading ? (
                <div>Loading groups...</div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {groups.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                            No groups yet. Create one to get started!
                        </div>
                    )}

                    {groups.map(group => (
                        <Link to={`/group/${group.id}`} key={group.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.1s' }}>
                            <div>
                                <h3 style={{ marginBottom: '0.25rem' }}>{group.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                    <Users size={16} />
                                    <span>View Details</span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', width: '100%', gap: '0.5rem' }}
                        onClick={handleCreateGroup}
                        disabled={creating}
                    >
                        <Plus size={20} />
                        {creating ? 'Creating...' : 'Create New Group'}
                    </button>
                </div>
            )}
        </div>
    );
}
