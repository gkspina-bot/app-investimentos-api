const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_dev';
const DATABASE_URL = process.env.DATABASE_URL;

// Conectar ao MongoDB
mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Conectado ao MongoDB');
}).catch(err => {
  console.error('Erro ao conectar ao MongoDB:', err);
  process.exit(1);
});

// Schemas e Models
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

const portfolioSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const User = mongoose.model('User', userSchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);

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

// Rotas de autenticação
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
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

app.post('/api/registro', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    
    const hash = bcrypt.hashSync(password, 10);
    const newUser = new User({ username, password: hash });
    await newUser.save();
    
    res.status(201).json({ id: newUser._id, username: newUser.username });
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

// Rotas de API protegidas
app.get('/api/portfolio/:user_id', auth, async (req, res) => {
  try {
    if (req.user.id != req.params.user_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const portfolio = await Portfolio.find({ user_id: req.params.user_id });
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/total/:user_id', auth, async (req, res) => {
  try {
    if (req.user.id != req.params.user_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const result = await Portfolio.aggregate([
      { $match: { user_id: mongoose.Types.ObjectId(req.params.user_id) } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$price'] } } } }
    ]);
    res.json({ total: result[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/portfolio/:user_id', auth, async (req, res) => {
  try {
    if (req.user.id != req.params.user_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const { symbol, quantity, price } = req.body;
    if (!symbol || quantity == null || price == null) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    
    const newPortfolio = new Portfolio({
      user_id: req.params.user_id,
      symbol,
      quantity,
      price
    });
    await newPortfolio.save();
    res.status(201).json({ id: newPortfolio._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/portfolio/:id', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio || portfolio.user_id != req.user.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    await Portfolio.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ativo deletado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});