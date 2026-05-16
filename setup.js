const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./portfolio.db');

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS portfolio', function(err) {
    if (err) {
      console.error(err.message);
    }
    db.run('DROP TABLE IF EXISTS users', function(err) {
      if (err) {
        console.error(err.message);
      }
      db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )`, function(err) {
        if (err) {
          console.error(err.message);
        }
        db.run(`CREATE TABLE portfolio (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          symbol VARCHAR(10) NOT NULL,
          quantity DECIMAL(10,2) NOT NULL,
          purchase_price DECIMAL(10,2) NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`, function(err) {
          if (err) {
            console.error(err.message);
          }
          bcrypt.hash('senha123', 12, function(err, hash) {
            if (err) {
              console.error('Erro no hash:', err.message);
              return;
            }
            db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
              ['glaucopina', 'glaucopina@hotmail.com', hash],
              function(err) {
                if (err) {
                  console.error('Erro ao inserir usuário:', err.message);
                } else {
                  console.log('Usuário criado com sucesso!');
                }
                db.close();
              }
            );
          });
        });
      });
    });
  });
});