const Database = require('better-sqlite3');
const path = require('path');

// Store the DB in the backend folder
const dbPath = path.join(__dirname, 'chat_history.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const insertMessage = db.prepare('INSERT INTO messages (role, content) VALUES (?, ?)');
const getMessages = db.prepare('SELECT * FROM messages ORDER BY timestamp ASC');
const clearMessages = db.prepare('DELETE FROM messages');

module.exports = {
  db,
  insertMessage,
  getMessages,
  clearMessages
};
