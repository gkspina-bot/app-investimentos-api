const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('portfolio.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  bcrypt.hash('senha123', 12, (err, hash) => {
    if (err) {
      console.error(err);
      db.close();
      return;
    }
    db.run(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`, ['glaucopina@hotmail.com', hash], function(err) {
      if (this.changes === 0) {
        console.log('Usuário já existe!');
      } else {
        console.log('Usuário criado com sucesso!');
      }
      db.close();
    });
  });
});