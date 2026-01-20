import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../api';

export default function EditPayment() {
    const { groupId, paymentId } = useParams();
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user')));

    const [members, setMembers] = useState([]);
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [currency, setCurrency] = useState('JPY');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [payerId, setPayerId] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [groupId, paymentId]);

    const loadData = async () => {
        try {
            const [membersData, paymentData] = await Promise.all([
                api.getGroupMembers(groupId),
                api.getPayment(paymentId)
            ]);

            setMembers(membersData);
            setAmount(paymentData.amount);
            setPurpose(paymentData.purpose);
            setCurrency(paymentData.currency || 'JPY');
            setPayerId(paymentData.payer_id);

            const participantIds = paymentData.participants.map(p => p.userId);
            setSelectedMembers(participantIds);

            setLoading(false);
        } catch (err) {
            console.error(err);
            alert('Failed to load payment data');
            navigate(`/group/${groupId}`);
        }
    };

    const toggleMember = (memberId) => {
        if (selectedMembers.includes(memberId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== memberId));
        } else {
            setSelectedMembers([...selectedMembers, memberId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !purpose || selectedMembers.length === 0) return;

        setLoading(true);
        try {
            const numAmount = parseFloat(amount);
            const splitAmount = numAmount / selectedMembers.length;

            const participants = selectedMembers.map(mId => ({
                userId: mId,
                amountOwed: splitAmount
            }));

            await api.updatePayment(paymentId, {
                payerId: payerId,
                amount: numAmount,
                currency: currency,
                purpose,
                participants
            });
            navigate(`/group/${groupId}`);
        } catch (err) {
            alert('Failed to update payment');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem', padding: '1rem 0' }}>
                <Link to={`/group/${groupId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    <ArrowLeft size={20} /> Cancel
                </Link>
                <h1>Edit Payment</h1>
            </header>

            <form onSubmit={handleSubmit} className="card">
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Amount</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            value={currency}
                            onChange={e => setCurrency(e.target.value)}
                            style={{ width: '100px', flexShrink: 0 }}
                        >
                            <option value="JPY">JPY</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="KRW">KRW</option>
                            <option value="TWD">TWD</option>
                        </select>
                        <input
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                            required
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Who Paid?</label>
                    <select
                        value={payerId}
                        onChange={e => setPayerId(Number(e.target.value))}
                        style={{ width: '100%' }}
                    >
                        {members.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Purpose</label>
                    <input
                        type="text"
                        placeholder="e.g. Dinner, Taxi"
                        value={purpose}
                        onChange={e => setPurpose(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>For Whom? ({selectedMembers.length})</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                        {members.map(member => {
                            const isSelected = selectedMembers.includes(member.id);
                            return (
                                <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => toggleMember(member.id)}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                                        background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                        color: isSelected ? 'white' : 'var(--color-text-muted)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {member.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Saving...' : 'Update Payment'}
                </button>
            </form>
        </div>
    );
}
