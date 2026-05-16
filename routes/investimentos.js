const express = require('express');
const router = express.Router();
const { getAll, create, update, deleteOne } = require('../controllers/investimentoController');

// Rota para obter todos os investimentos
router.get('/', getAll);

// Rota para criar um novo investimento
router.post('/', create);

// Rota para atualizar um investimento pelo ID
router.put('/:id', update);

// Rota para deletar um investimento pelo ID
router.delete('/:id', deleteOne);

module.exports = router;