const Investimento = require('../models/Investimento');

async function getAll(req, res) {
  try {
    const investimentos = await Investimento.find({});
    res.status(200).json(investimentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function create(req, res) {
  try {
    const novoInvestimento = new Investimento({
      titulo: req.body.titulo,
      valor: req.body.valor,
      pais: req.body.pais,
      // outros campos conforme o modelo
    });
    const investimentoSalvo = await novoInvestimento.save();
    res.status(201).json(investimentoSalvo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
    const id = req.params.id;
    const investimentoAtualizado = await Investimento.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!investimentoAtualizado) {
      return res.status(404).json({ error: 'Investimento não encontrado' });
    }
    res.status(200).json(investimentoAtualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteOne(req, res) {
  try {
    const id = req.params.id;
    const investimentoDeletado = await Investimento.findByIdAndDelete(id);
    if (!investimentoDeletado) {
      return res.status(404).json({ error: 'Investimento não encontrado' });
    }
    res.status(200).json({ message: 'Investimento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAll,
  create,
  update,
  deleteOne
};