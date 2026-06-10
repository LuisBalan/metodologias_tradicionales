const express = require('express');
const path = require('path');
const { db, init } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

init();

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

app.get('/api/users', async (req, res) => {
  try {
    const users = await allQuery('SELECT * FROM users ORDER BY id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const result = await runQuery('INSERT INTO users (name) VALUES (?)', [name]);
    res.json({ id: result.lastID, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery('DELETE FROM users WHERE id = ?', [id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/books', async (req, res) => {
  try {
    const books = await allQuery('SELECT * FROM books ORDER BY id');
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', async (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) return res.status(400).json({ error: 'Title and author are required' });

  try {
    const result = await runQuery('INSERT INTO books (title, author) VALUES (?, ?)', [title, author]);
    res.json({ id: result.lastID, title, author });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery('DELETE FROM books WHERE id = ?', [id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/loans', async (req, res) => {
  try {
    const loans = await allQuery(`
      SELECT
        loans.id,
        loans.user_id,
        users.name AS user_name,
        loans.book_id,
        books.title AS book_title,
        books.author AS book_author,
        loans.salida_date,
        loans.due_date,
        loans.return_date,
        loans.created_at
      FROM loans
      JOIN users ON users.id = loans.user_id
      JOIN books ON books.id = loans.book_id
      ORDER BY loans.id DESC
    `);
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/loans', async (req, res) => {
  const { user_id, book_id, salida_date, due_date, return_date } = req.body;
  if (!user_id || !book_id || !salida_date || !due_date) {
    return res.status(400).json({ error: 'User, book, salida date and due date are required' });
  }

  try {
    const result = await runQuery(
      'INSERT INTO loans (user_id, book_id, salida_date, due_date, return_date) VALUES (?, ?, ?, ?, ?)',
      [user_id, book_id, salida_date, due_date, return_date || null]
    );
    res.json({ id: result.lastID, user_id, book_id, salida_date, due_date, return_date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/loans/:id/return', async (req, res) => {
  const { id } = req.params;
  const { return_date } = req.body;
  if (!return_date) return res.status(400).json({ error: 'Return date is required' });

  try {
    await runQuery('UPDATE loans SET return_date = ? WHERE id = ?', [return_date, id]);
    res.json({ updated: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Library app running at http://localhost:${port}`);
});
