const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('portfolio.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    nome_ativo TEXT,
    quantidade REAL,
    preco_unitario REAL
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela:', err.message);
    } else {
      console.log('Banco de dados atualizado com sucesso!');
    }
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
    });
  });
});