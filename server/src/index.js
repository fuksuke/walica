const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Database
initDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/payments', require('./routes/payments'));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Payment Memory API is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
