const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Add Payment
router.post('/', (req, res) => {
    const { groupId, payerId, amount, currency, purpose, participants } = req.body;

    if (!groupId || !payerId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.serialize(() => {
        // 1. Insert Payment
        db.run(`INSERT INTO payments (group_id, payer_id, amount, currency, purpose) VALUES (?, ?, ?, ?, ?)`,
            [groupId, payerId, amount, currency || 'JPY', purpose],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                const paymentId = this.lastID;

                // 2. Insert Participants
                if (participants && participants.length > 0) {
                    const stmt = db.prepare(`INSERT INTO payment_participants (payment_id, user_id, amount_owed) VALUES (?, ?, ?)`);
                    participants.forEach(p => {
                        stmt.run(paymentId, p.userId, p.amountOwed);
                    });
                    stmt.finalize();
                }

                res.json({ id: paymentId, groupId, amount, purpose });
            }
        );
    });
});

// Get Group Payments
router.get('/group/:groupId', (req, res) => {
    const sql = `SELECT * FROM payments WHERE group_id = ? ORDER BY created_at DESC`;
    db.all(sql, [req.params.groupId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get Single Payment Details
router.get('/:id', (req, res) => {
    const paymentId = req.params.id;
    db.get(`SELECT * FROM payments WHERE id = ?`, [paymentId], (err, payment) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!payment) return res.status(404).json({ error: 'Payment not found' });

        db.all(`SELECT user_id as userId, amount_owed as amountOwed FROM payment_participants WHERE payment_id = ?`, [paymentId], (err, participants) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...payment, participants });
        });
    });
});

// Update Payment
router.put('/:id', (req, res) => {
    const paymentId = req.params.id;
    const { payerId, amount, currency, purpose, participants } = req.body;

    if (!payerId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.serialize(() => {
        // 1. Update Payment Info
        db.run(`UPDATE payments SET payer_id = ?, amount = ?, currency = ?, purpose = ? WHERE id = ?`,
            [payerId, amount, currency || 'JPY', purpose, paymentId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });

                // 2. Update Participants (Delete all and re-insert)
                db.run(`DELETE FROM payment_participants WHERE payment_id = ?`, [paymentId], (err) => {
                    if (err) return res.status(500).json({ error: err.message });

                    if (participants && participants.length > 0) {
                        const stmt = db.prepare(`INSERT INTO payment_participants (payment_id, user_id, amount_owed) VALUES (?, ?, ?)`);
                        participants.forEach(p => {
                            stmt.run(paymentId, p.userId, p.amountOwed);
                        });
                        stmt.finalize();
                    }
                    res.json({ success: true });
                });
            }
        );
    });
});

module.exports = router;
