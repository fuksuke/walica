const API_URL = 'http://localhost:3000/api';

export const api = {
    async login(name) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (res.status === 404) return null; // User not found
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    },

    async register(name, email) {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email }),
        });
        if (!res.ok) throw new Error('Registration failed');
        return res.json();
    },

    async getGroups(userId) {
        const res = await fetch(`${API_URL}/groups/user/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch groups');
        return res.json();
    },

    async createGroup(name, userId) {
        const res = await fetch(`${API_URL}/groups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, userId }),
        });
        if (!res.ok) throw new Error('Failed to create group');
        return res.json();
    },

    async getGroup(id) {
        const res = await fetch(`${API_URL}/groups/${id}`);
        if (!res.ok) throw new Error('Failed to fetch group');
        return res.json();
    },

    async getGroupMembers(id) {
        const res = await fetch(`${API_URL}/groups/${id}/members`);
        if (!res.ok) throw new Error('Failed to fetch group members');
        return res.json();
    },

    async getGroupSummary(id) {
        const res = await fetch(`${API_URL}/groups/${id}/summary`);
        if (!res.ok) throw new Error('Failed to fetch group summary');
        return res.json();
    },

    async addMemberToGroup(groupId, name) {
        const res = await fetch(`${API_URL}/groups/${groupId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error('Failed to add member');
        return res.json();
    },

    async joinGroup(groupId, userId) {
        const res = await fetch(`${API_URL}/groups/${groupId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
        if (!res.ok) throw new Error('Failed to join group');
        return res.json();
    },

    async getPayments(groupId) {
        const res = await fetch(`${API_URL}/payments/group/${groupId}`);
        if (!res.ok) throw new Error('Failed to fetch payments');
        return res.json();
    },

    async getPayment(id) {
        const res = await fetch(`${API_URL}/payments/${id}`);
        if (!res.ok) throw new Error('Failed to fetch payment');
        return res.json();
    },

    async updatePayment(id, data) {
        const res = await fetch(`${API_URL}/payments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update payment');
        return res.json();
    },

    async createPayment(payment) {
        const res = await fetch(`${API_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payment),
        });
        if (!res.ok) throw new Error('Failed to create payment');
        return res.json();
    }
};
