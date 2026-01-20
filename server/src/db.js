const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const initDB = () => {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        // Groups Table
        db.run(`CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        // Group Members (User-Group relation)
        db.run(`CREATE TABLE IF NOT EXISTS group_members (
      group_id INTEGER,
      user_id INTEGER,
      FOREIGN KEY(group_id) REFERENCES groups(id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      PRIMARY KEY (group_id, user_id)
    )`);

        // Payments Table
        db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER,
      payer_id INTEGER,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'JPY',
      purpose TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(group_id) REFERENCES groups(id),
      FOREIGN KEY(payer_id) REFERENCES users(id)
    )`);

        // Payment Participants Table aka Splits
        db.run(`CREATE TABLE IF NOT EXISTS payment_participants (
      payment_id INTEGER,
      user_id INTEGER,
      amount_owed REAL,
      FOREIGN KEY(payment_id) REFERENCES payments(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
    });
};

module.exports = { db, initDB };
