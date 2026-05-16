'use client';

import Link from 'next/link';
import InvestimentosList from '@/components/InvestimentosList';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-green-600 bg-clip-text text-transparent mb-4">
            📊 Dashboard de Investimentos
          </h1>
        </div>
        <div className="flex justify-center mb-12">
          <Link
            href="/adicionar"
            className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-green-500 hover:from-blue-600 hover:via-blue-700 hover:to-green-600 text-white font-semibold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-300/50"
          >
            + Adicionar Investimento
          </Link>
        </div>
        <div className="w-full">
          <InvestimentosList />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
