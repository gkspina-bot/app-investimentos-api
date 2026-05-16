const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_dev';

const db = new sqlite3.Database('portfolio.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )`);
});

app.use(express.json());
app.use(cookieParser());

// Middleware de autenticação
function auth(req, res, next) {
  let token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.token;
  if (!token) {
    if (req.path === '/dashboard.html') {
      return res.redirect('/index.html');
    }
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (req.path === '/dashboard.html') {
      return res.redirect('/index.html');
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Rotas de autenticação
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
      sameSite: 'strict'
    });
    res.json({ token, user: { id: user.id, username: user.username } });
  });
});

app.post('/api/registro', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'Usuário já existe' });
    const hash = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, username });
    });
  });
});

// Rotas de páginas
app.get('/', (req, res) => res.redirect('/index.html'));
app.get('/login.html', (req, res) => res.redirect('/index.html'));

app.get('/dashboard.html', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Rotas de API protegidas
app.get('/api/portfolio/:user_id', auth, (req, res) => {
  if (req.user.id != req.params.user_id) return res.status(403).json({ error: 'Acesso negado' });
  db.all('SELECT * FROM portfolio WHERE user_id = ?', [req.params.user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/total/:user_id', auth, (req, res) => {
  if (req.user.id != req.params.user_id) return res.status(403).json({ error: 'Acesso negado' });
  db.get('SELECT SUM(quantity * price) as total FROM portfolio WHERE user_id = ?', [req.params.user_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ total: row?.total || 0 });
  });
});

app.post('/api/portfolio/:user_id', auth, (req, res) => {
  if (req.user.id != req.params.user_id) return res.status(403).json({ error: 'Acesso negado' });
  const { symbol, quantity, price } = req.body;
  if (!symbol || quantity == null || price == null) return res.status(400).json({ error: 'Dados inválidos' });
  db.run('INSERT INTO portfolio (user_id, symbol, quantity, price) VALUES (?, ?, ?, ?)',
    [req.params.user_id, symbol, quantity, price],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.delete('/api/portfolio/:id', auth, (req, res) => {
  db.get('SELECT user_id FROM portfolio WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row || row.user_id != req.user.id) return res.status(403).json({ error: 'Acesso negado' });
    db.run('DELETE FROM portfolio WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Ativo deletado' });
    });
  });
});

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});