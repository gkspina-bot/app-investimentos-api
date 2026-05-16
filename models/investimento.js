const mongoose = require('mongoose');

const investimentoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  descricao: {
    type: String
  },
  valor: {
    type: Number,
    required: true
  },
  moeda: {
    type: String,
    default: 'USD'
  },
  pais: {
    type: String
  },
  dataInvestimento: {
    type: Date,
    default: Date.now
  },
  rentabilidade: {
    type: Number
  },
  status: {
    type: String,
    enum: ['ativo', 'inativo', 'pausado']
  }
}, {
  timestamps: true
});

const Investimento = mongoose.model('Investimento', investimentoSchema);

module.exports = Investimento;