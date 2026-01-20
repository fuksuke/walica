const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { v4: uuidv4 } = require('uuid');

// Create Group
router.post('/', (req, res) => {
    const { name, userId } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name is required' });

    db.serialize(() => {
        db.run(`INSERT INTO groups (name) VALUES (?)`, [name], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const groupId = this.lastID;

            // Add creator to group
            if (userId) {
                db.run(`INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`, [groupId, userId]);
            }

            res.json({ id: groupId, name });
        });
    });
});

// Get Group Details
router.get('/:id', (req, res) => {
    const sql = `SELECT * FROM groups WHERE id = ?`;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Group not found' });
        res.json(row);
    });
});

// Get Group Members
router.get('/:id/members', (req, res) => {
    const sql = `
    SELECT u.id, u.name, u.email FROM users u
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = ?
  `;
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get Group Summary (Balance)
router.get('/:id/summary', (req, res) => {
    const groupId = req.params.id;

    db.serialize(() => {
        // 1. Get all members
        db.all(`
      SELECT u.id, u.name FROM users u
      JOIN group_members gm ON u.id = gm.user_id
      WHERE gm.group_id = ?
    `, [groupId], (err, members) => {
            if (err) return res.status(500).json({ error: err.message });

            const summary = {};
            members.forEach(m => {
                summary[m.id] = { user: m, paid: 0, owed: 0, balance: 0 };
            });

            // 2. Sum Paid (Total amount paid by each user)
            db.all(`SELECT payer_id, SUM(amount) as total_paid FROM payments WHERE group_id = ? GROUP BY payer_id`, [groupId], (err, paidRows) => {
                if (err) return res.status(500).json({ error: err.message });

                paidRows.forEach(row => {
                    if (summary[row.payer_id]) {
                        summary[row.payer_id].paid = row.total_paid;
                    }
                });

                // 3. Sum Owed (Total share of each user)
                // Need to join payment_participants with payments to filter by group_id
                db.all(`
          SELECT pp.user_id, SUM(pp.amount_owed) as total_owed 
          FROM payment_participants pp
          JOIN payments p ON pp.payment_id = p.id
          WHERE p.group_id = ?
          GROUP BY pp.user_id
        `, [groupId], (err, owedRows) => {
                    if (err) return res.status(500).json({ error: err.message });

                    owedRows.forEach(row => {
                        if (summary[row.user_id]) {
                            summary[row.user_id].owed = row.total_owed;
                        }
                    });

                    // Calculate Balance
                    Object.values(summary).forEach(item => {
                        item.balance = item.paid - item.owed;
                    });

                    res.json(Object.values(summary));
                });
            });
        });
    });
});

// Get User's Groups
router.get('/user/:userId', (req, res) => {
    const sql = `
    SELECT g.* FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?
  `;
    db.all(sql, [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add Member (Manual/Proxy)
router.post('/:id/members', (req, res) => {
    const groupId = req.params.id;
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    db.serialize(() => {
        // 1. Check if user exists or create proxy user
        // For simplicity, we'll just create a new user if not found by strict email match (which we don't have here)
        // OR just create a new user with NO email (proxy)

        // Check if a proxy user with this name already exists for this group? 
        // Simplified: Just create a new user row with NULL email.

        db.run(`INSERT INTO users (name, email) VALUES (?, NULL)`, [name], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const userId = this.lastID;

            // 2. Add to group
            db.run(`INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`, [groupId, userId], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, user: { id: userId, name } });
            });
        });
    });
});

// Join Group
router.post('/:id/join', (req, res) => {
    const groupId = req.params.id;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    // Check if already member?
    db.get(`SELECT * FROM group_members WHERE group_id = ? AND user_id = ?`, [groupId, userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.json({ success: true, message: 'Already a member' });

        db.run(`INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`, [groupId, userId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

module.exports = router;
