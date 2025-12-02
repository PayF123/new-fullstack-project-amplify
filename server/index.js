// server/index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// GET all items
app.get('/api/items', (req, res) => {
    db.all('SELECT * FROM items', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST a new item
app.post('/api/items', (req, res) => {
    const { name, description } = req.body;
    db.run(`INSERT INTO items (name, description) VALUES (?, ?)`, [name, description], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({
            id: this.lastID,
            name: name,
            description: description
        });
    });
});

// PUT (update) an item
app.put('/api/items/:id', (req, res) => {
    const { name, description } = req.body;
    const { id } = req.params;
    db.run(`UPDATE items SET name = ?, description = ? WHERE id = ?`, [name, description, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        res.json({ message: 'Item updated successfully' });
    });
});

// DELETE an item
app.delete('/api/items/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM items WHERE id = ?`, id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        res.json({ message: 'Item deleted successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
