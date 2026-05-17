const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_dev';
const DATABASE_URL = process.env.DATABASE_URL;

let db;
let usersCollection;
let portfolioCollection;

// Conectar ao MongoDB
MongoClient.connect(DATABASE_URL, { useUnifiedTopology: true })
  .then(client => {
    console.log('Conectado ao MongoDB');
    db = client.db('investimentos');
    usersCollection = db.collection('users');
    portfolioCollection = db.collection('portfolio');
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  });

app.use(express.json());
app.use(cookieParser());
app.use(cors());

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

// POST /api/registro
app.post('/api/registro', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    
    const hash = bcrypt.hashSync(password, 10);
    const result = await usersCollection.insertOne({ username, password: hash });
    
    res.status(201).json({ id: result.insertedId, username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await usersCollection.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign({ id: user._id.toString(), username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'strict'
    });
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/portfolio/:user_id
app.get('/api/portfolio/:user_id', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.user_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const portfolio = await portfolioCollection.find({ user_id: new ObjectId(req.params.user_id) }).toArray();
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/portfolio/:user_id
app.post('/api/portfolio/:user_id', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.user_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const { symbol, quantity, price } = req.body;
    if (!symbol || quantity == null || price == null) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    
    const result = await portfolioCollection.insertOne({
      user_id: new ObjectId(req.params.user_id),
      symbol,
      quantity,
      price
    });
    
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/total/:user_id
app.get('/api/total/:user_id', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.user_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const result = await portfolioCollection.aggregate([
      { $match: { user_id: new ObjectId(req.params.user_id) } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$price'] } } } }
    ]).toArray();
    
    res.json({ total: result[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/portfolio/:id
app.delete('/api/portfolio/:id', auth, async (req, res) => {
  try {
    const item = await portfolioCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!item || item.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    await portfolioCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Ativo deletado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rotas de páginas
app.get('/', (req, res) => res.redirect('/index.html'));
app.get('/login.html', (req, res) => res.redirect('/index.html'));

app.get('/dashboard.html', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});