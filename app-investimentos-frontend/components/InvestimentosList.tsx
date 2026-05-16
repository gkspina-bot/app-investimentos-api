'use client';

import React, { useState, useEffect } from 'react';

type Investment = {
  id: string;
  nome: string;
  tipo: string;
  valorUnitario: number;
  quantidade: number;
  total: number;
  dataCompra: string;
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('pt-BR').format(value);

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('pt-BR');

const Spinner = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
);

const InvestimentosList: React.FC = () => {
  const [investimentos, setInvestimentos] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<Investment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getAllInvestimentos = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/investimentos');
      if (!response.ok) {
        throw new Error('Erro ao buscar investimentos');
      }
      const data: Investment[] = await response.json();
      setInvestimentos(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro desconhecido ao buscar investimentos'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllInvestimentos();
  }, []);

  const handleEdit = (investment: Investment) => {
    setEditData(investment);
    setShowEditModal(true);
  };

  const handleDeleteConfirm = (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await fetch(`/api/investimentos/${deletingId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erro ao deletar investimento');
      }
      setShowDeleteConfirm(false);
      setDeletingId(null);
      getAllInvestimentos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro desconhecido ao deletar'
      );
    }
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editData) return;

    try {
      const response = await fetch(`/api/investimentos/${editData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar investimento');
      }
      setShowEditModal(false);
      setEditData(null);
      getAllInvestimentos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro desconhecido ao atualizar'
      );
    }
  };

  const handleInputChange = (
    field: keyof Omit<Investment, 'id' | 'total'>,
    value: string | number
  ) => {
    if (!editData) return;

    const newData = { ...editData, [field]: value };
    if (field === 'valorUnitario' || field === 'quantidade') {
      const valNum = field === 'valorUnitario' ? (value as number) : editData.valorUnitario;
      const qtdNum = field === 'quantidade' ? (value as number) : editData.quantidade;
      newData.total = valNum * qtdNum;
    }
    setEditData(newData);
  };

  const totalPortfolio = investimentos.reduce((sum, inv) => sum + inv.total, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <button
          onClick={getAllInvestimentos}
          className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gradient-to-br from-blue-50 via-green-50 to-emerald-50 min-h-screen rounded-2xl shadow-2xl">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-8 text-center">
        Meus Investimentos
      </h1>

      {investimentos.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-2xl text-gray-500 font-semibold mb-2">
            Nenhum investimento encontrado.
          </p>
          <p className="text-gray-400">Adicione seu primeiro investimento para começar!</p>
        </div>
      ) : (
        <>
          <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Total do Portfólio
            </h2>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              {formatCurrency(totalPortfolio)}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl shadow-2xl border border-gray-200">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                    Valor Unit.
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                    Qtd.
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Data Compra
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {investimentos.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inv.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {inv.tipo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                      {formatCurrency(inv.valorUnitario)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                      {formatNumber(inv.quantidade)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(inv.dataCompra)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(inv)}
                        className="mr-3 text-blue-600 hover:text-blue-900 p-2 -m-2 rounded-lg hover:bg-blue-100 transition-all"
                        title="Editar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 4.5M16.862 4.487L19.5 7.125"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(inv.id)}
                        className="text-red-600 hover:text-red-900 p-2 -m-2 rounded-lg hover:bg-red-100 transition-all"
                        title="Deletar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal de Edição */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Editar Investimento
              </h2>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <input
                  type="text"
                  value={editData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nome do investimento"
                  required
                />
                <select
                  value={editData.tipo}
                  onChange={(e) => handleInputChange('tipo', e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  required
                >
                  <option value="Ações">Ações</option>
                  <option value="Criptomoedas">Criptomoedas</option>
                  <option value="FII">FII</option>
                  <option value="Tesouro">Tesouro Direto</option>
                  <option value="Outros">Outros</option>
                </select>
                <input
                  type="number"
                  value={editData.valorUnitario}
                  onChange={(e) => handleInputChange('valorUnitario', parseFloat(e.target.value) || 0)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Valor Unitário"
                  step="0.01"
                  min="0"
                  required
                />
                <input
                  type="number"
                  value={editData.quantidade}
                  onChange={(e) => handleInputChange('quantidade', parseFloat(e.target.value) || 0)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Quantidade"
                  step="0.01"
                  min="0"
                  required
                />
                <input
                  type="date"
                  value={editData.dataCompra.slice(0, 10)}
                  onChange={(e) => handleInputChange('dataCompra', e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-lg font-bold text-green-800">
                    Total: <span className="text-2xl">{formatCurrency(editData.total)}</span>
                  </p>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditData(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-4 px-6 rounded-xl font-bold text-lg hover:bg-gray-400 transition-all shadow-lg"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Deleção */}
      {showDeleteConfirm && deletingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-200">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-2xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Confirmar Deleção?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Tem certeza que deseja deletar este investimento?{' '}
              <strong className="text-red-600">Esta ação não pode ser desfeita.</strong>
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
              >
                Sim, Deletar
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingId(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-4 px-6 rounded-xl font-bold text-lg hover:bg-gray-400 transition-all shadow-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestimentosList;
