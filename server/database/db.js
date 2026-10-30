const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = __dirname;
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'municipal.sqlite');

// Open SQLite database
const db = new Database(dbPath, {
  // verbose: process.env.NODE_ENV === 'development' ? console.log : null,
});

// Enable SQLite foreign key enforcement
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrency and crash resilience
db.pragma('journal_mode = WAL');

module.exports = db;
