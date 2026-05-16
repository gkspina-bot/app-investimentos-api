const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

async function addUser() {
  const db = new sqlite3.Database('portfolio.db');

  try {
    const password = 'senha123';
    const hashedPassword = await bcrypt.hash(password, 12);
    const username = 'glaucopina@hotmail.com';

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('Usuário adicionado com sucesso!');
      db.close();
    });
  } catch (error) {
    console.error('Erro ao hashear senha:', error);
    db.close();
  }
}

addUser();