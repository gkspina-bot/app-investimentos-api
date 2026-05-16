export type TipoInvestimento = 'Ação' | 'FII' | 'Cripto' | 'Tesouro';

export interface Investimento {
  id: string;
  nome: string;
  tipo: TipoInvestimento;
  valorUnitario: number;
  quantidade: number;
  dataCompra: Date;
}