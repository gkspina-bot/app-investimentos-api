'use client';

import React, { useState, useEffect, FormEvent } from 'react';

type TipoInvestimento = 'Ação' | 'FII' | 'Cripto' | 'Tesouro';

interface Investimento {
  nome: string;
  tipo: TipoInvestimento;
  valorUnitario: number;
  quantidade: number;
  dataCompra: string;
}

interface Props {
  initialData?: Investimento;
  onSubmit: (data: Investimento) => void;
  onCancel: () => void;
}

const InvestimentoForm: React.FC<Props> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Investimento>({
    nome: '',
    tipo: 'Ação',
    valorUnitario: 0,
    quantidade: 0,
    dataCompra: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setErrors({});
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório.';
    }
    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório.';
    }
    if (formData.valorUnitario <= 0) {
      newErrors.valorUnitario = 'Valor unitário deve ser maior que 0.';
    }
    if (formData.quantidade <= 0) {
      newErrors.quantidade = 'Quantidade deve ser maior que 0.';
    }
    if (!formData.dataCompra) {
      newErrors.dataCompra = 'Data de compra é obrigatória.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onCancel();
  };

  const updateField = (field: keyof Investimento, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const fieldName = field as string;
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-2xl border border-blue-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
        {initialData ? 'Editar Investimento' : 'Novo Investimento'}
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Nome do Investimento</label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => updateField('nome', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-200"
            placeholder="Ex: PETR4"
          />
          {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Tipo</label>
          <select
            value={formData.tipo}
            onChange={(e) => updateField('tipo', e.target.value as TipoInvestimento)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-200 bg-white"
          >
            <option value="Ação">📈 Ação</option>
            <option value="FII">🏢 FII</option>
            <option value="Cripto">₿ Cripto</option>
            <option value="Tesouro">💰 Tesouro</option>
          </select>
          {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Valor Unitário (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.valorUnitario || ''}
              onChange={(e) => updateField('valorUnitario', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-200"
              placeholder="0,00"
            />
            {errors.valorUnitario && <p className="text-red-500 text-sm mt-1">{errors.valorUnitario}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Quantidade</label>
            <input
              type="number"
              min="0"
              value={formData.quantidade || ''}
              onChange={(e) => updateField('quantidade', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-200"
              placeholder="0"
            />
            {errors.quantidade && <p className="text-red-500 text-sm mt-1">{errors.quantidade}</p>}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Data de Compra</label>
          <input
            type="date"
            value={formData.dataCompra}
            onChange={(e) => updateField('dataCompra', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-200"
          />
          {errors.dataCompra && <p className="text-red-500 text-sm mt-1">{errors.dataCompra}</p>}
        </div>
      </div>

      <div className="flex gap-4 mt-10 pt-8 border-t border-gray-200">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 px-6 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-200 font-semibold shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-green-500 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:via-blue-700 hover:to-green-600 transition-all duration-200 font-semibold shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Investimento'}
        </button>
      </div>
    </form>
  );
};
