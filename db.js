const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./library.db');

function init() {
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        salida_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        return_date TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
      )
    `);
  });
}

module.exports = { db, init };
