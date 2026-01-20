const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Mock Registration
router.post('/register', (req, res) => {
    const { name, email } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const sql = `INSERT INTO users (name, email) VALUES (?, ?)`;
    db.run(sql, [name, email], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, email });
    });
});

// Mock Login (just returns user if exists, or creates)
router.post('/login', (req, res) => {
    const { name } = req.body;
    // Simplified login: just find by name
    db.get(`SELECT * FROM users WHERE name = ?`, [name], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    });
});

module.exports = router;
