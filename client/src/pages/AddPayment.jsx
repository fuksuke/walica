import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { ArrowLeft, Check } from 'lucide-react';

export default function AddPayment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [payerId, setPayerId] = useState(user.id);
    const [currency, setCurrency] = useState('JPY');

    useEffect(() => {
        loadMembers();
    }, [id]);

    const loadMembers = async () => {
        try {
            const data = await api.getGroupMembers(id);
            setMembers(data);
            // Default select all
            setSelectedMembers(data.map(m => m.id));

            // Ensure current user is in members list, if not maybe they are creator but not in list? 
            // (Our logic adds creator to members, so should be fine)
            if (!payerId && data.length > 0) {
                setPayerId(data[0].id);
            }
        } catch (err) {
            console.error(err);
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

            await api.createPayment({
                groupId: id,
                payerId: payerId || user.id, // Use selected payer
                amount: numAmount,
                currency: currency,
                purpose,
                participants
            });
            navigate(`/group/${id}`);
        } catch (err) {
            alert('Failed to create payment');
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceInput = () => {
        setPurpose('Listening...');
        setTimeout(() => {
            // Mock Recognition Result
            const mockResult = {
                amount: 5000,
                purpose: 'Dinner with friends',
                currency: 'JPY'
            };

            setAmount(mockResult.amount);
            setPurpose(mockResult.purpose);
            setCurrency(mockResult.currency); // Added this line
            // Select all members by default (already done, but just to be sure)
            if (members.length > 0) {
                setSelectedMembers(members.map(m => m.id));
            }
            alert('Voice Recognized: "Dinner 5000 yen"');
        }, 2000);
    };

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem', padding: '1rem 0' }}>
                <Link to={`/group/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    <ArrowLeft size={20} /> Cancel
                </Link>
                <h1>Add Payment</h1>
            </header>

            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <button
                    type="button"
                    onClick={handleVoiceInput}
                    className="btn"
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        width: '100%',
                        color: 'var(--color-primary)'
                    }}
                >
                    🎙️ Tap to Record (Mock)
                </button>
            </div>

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
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Split with ({selectedMembers.length})</label>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {members.map(member => {
                            const isSelected = selectedMembers.includes(member.id);
                            return (
                                <div
                                    key={member.id}
                                    onClick={() => toggleMember(member.id)}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid',
                                        borderColor: isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span>{member.name}</span>
                                    {isSelected && <Check size={16} color="var(--color-primary)" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={loading || selectedMembers.length === 0}
                >
                    {loading ? 'Saving...' : 'Save Payment'}
                </button>
            </form>
        </div>
    );
}
