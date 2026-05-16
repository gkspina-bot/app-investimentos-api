require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Conectado ao MongoDB!');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
  });