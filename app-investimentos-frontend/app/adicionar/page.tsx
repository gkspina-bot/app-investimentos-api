'use client';

import { useRouter } from 'next/navigation';
import InvestimentoForm from '@/components/InvestimentoForm';

export default function AdicionarInvestimento() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    const response = await fetch('/api/investimentos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.push('/');
    } else {
      console.error('Erro ao adicionar investimento');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-green-500 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center drop-shadow-md">
          Adicionar Novo Investimento
        </h1>
        <InvestimentoForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel} 
        />
      </div>
    </div>
  );
}