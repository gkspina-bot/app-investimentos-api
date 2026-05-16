const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Delete portfolio.db if it exists
const dbPath = 'portfolio.db';
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

// Create new database
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    symbol TEXT,
    quantity REAL,
    price REAL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Hash password
  const plainPassword = 'senha123';
  const hashedPassword = bcrypt.hashSync(plainPassword, 10);

  // Insert user
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, ['glaucopina@hotmail.com', hashedPassword], function(err) {
    if (err) {
      console.error('Error inserting user:', err.message);
    } else {
      console.log('Banco de dados recriado com sucesso!');
    }
    db.close();
  });
});