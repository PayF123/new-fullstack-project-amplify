// server/database.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const dataPath = path.join(__dirname, 'data.json');

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTableAndSeed();
    }
});

function createTableAndSeed() {
    db.serialize(() => {
        // Create the items table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
                return;
            }
            console.log('Table "items" created or already exists.');
            seedData();
        });
    });
}

function seedData() {
    // Check if the table is empty before seeding
    db.get('SELECT COUNT(*) as count FROM items', (err, row) => {
        if (err) {
            console.error('Error checking item count', err.message);
            return;
        }

        if (row.count === 0) {
            console.log('Seeding data from data.json...');
            const items = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
            const stmt = db.prepare('INSERT INTO items (name, description) VALUES (?, ?)');
            
            items.forEach(item => {
                stmt.run(item.name, item.description);
            });
            
            stmt.finalize((err) => {
                if(err) {
                    console.error('Error finalizing statement', err.message);
                } else {
                    console.log('Finished seeding data.');
                }
                closeDatabase();
            });
        } else {
            console.log('Database already seeded.');
            closeDatabase();
        }
    });
}

function closeDatabase() {
    db.close((err) => {
        if (err) {
            console.error('Error closing database', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
}
