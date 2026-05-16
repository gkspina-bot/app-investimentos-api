const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const dbPath = 'portfolio.db';

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath);

const createUsersTable = `
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`;

const createPortfolioTable = `
  CREATE TABLE portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`;

db.serialize(() => {
  db.run(createUsersTable, (err) => {
    if (err) {
      console.error(err.message);
      db.close();
      return;
    }
    db.run(createPortfolioTable, (err) => {
      if (err) {
        console.error(err.message);
        db.close();
        return;
      }
      bcrypt.hash('senha123', 10, (err, hash) => {
        if (err) {
          console.error('Erro no hash:', err.message);
          db.close();
          return;
        }
        db.run(
          'INSERT INTO users (username, password) VALUES (?, ?)',
          ['glaucopina@hotmail.com', hash],
          (err) => {
            if (err) {
              console.error('Erro na inserção:', err.message);
            } else {
              console.log('Banco de dados recriado com sucesso!');
            }
            db.close();
          }
        );
      });
    });
  });
});
