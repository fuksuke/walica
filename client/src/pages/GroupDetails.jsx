import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { Plus, ArrowLeft, Receipt, Calendar } from 'lucide-react';

export default function GroupDetails() {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [g, p, s] = await Promise.all([
                api.getGroup(id),
                api.getPayments(id),
                api.getGroupSummary(id)
            ]);
            setGroup(g);
            setPayments(p);
            setSummary(s);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container">Loading...</div>;
    if (!group) return <div className="container">Group not found</div>;

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem', padding: '1rem 0' }}>
                <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    <ArrowLeft size={20} /> Back to Dashboard
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>{group.name}</h1>
                    <Link to={`/group/${id}/add-payment`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', gap: '0.25rem' }}>
                        <Plus size={16} /> Add Payment
                    </Link>
                </div>
            </header>

            {/* Summary Section */}
            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(to bottom, var(--color-surface), rgba(15, 23, 42, 0))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: 0 }}>Summary</h2>
                    <button
                        onClick={async () => {
                            const name = prompt("Enter new member's name:");
                            if (name) {
                                try {
                                    await api.addMemberToGroup(id, name);
                                    loadData(); // Reload all data
                                } catch (e) {
                                    alert(e.message);
                                }
                            }
                        }}
                        className="btn"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', marginRight: '0.5rem' }}
                    >
                        + Add Member
                    </button>
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/invite/${id}`;
                            navigator.clipboard.writeText(url);
                            alert('Invite link copied!\n' + url);
                        }}
                        className="btn"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: 'var(--color-primary)', color: 'white' }}
                    >
                        Copy Link
                    </button>
                </div>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {summary.map(item => (
                        <div key={item.user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span>{item.user.name}</span>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    color: item.balance >= 0 ? 'var(--color-primary)' : 'var(--color-accent)',
                                    fontWeight: 'bold',
                                    display: 'block'
                                }}>
                                    {item.balance >= 0 ? '+' : ''}{Math.round(item.balance).toLocaleString()}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    Paid: {Math.round(item.paid).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>Recent Payments</h2>
                {payments.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                        <p>No payments recorded yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {payments.map(payment => (
                            <div key={payment.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
                                        <Receipt size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{payment.purpose}</h3>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Calendar size={12} />
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-text)' }}>
                                        {payment.currency} {payment.amount.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        by {summary.find(s => s.user.id === payment.payer_id)?.user.name || 'Unknown'}
                                    </div>
                                    <Link to={`/group/${id}/payment/${payment.id}/edit`} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'none', marginTop: '0.25rem', display: 'inline-block' }}>
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
