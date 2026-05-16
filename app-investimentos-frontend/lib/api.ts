import axios from 'axios';
import type { Investimento } from '../types/investimento';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

type CreateInvestimento = Omit<Investimento, 'id'>;
type UpdateInvestimento = Partial<CreateInvestimento>;

export const getAllInvestimentos = async (): Promise<Investimento[]> => {
  const { data } = await api.get<Investimento[]>('/investimentos');
  return data;
};

export const createInvestimento = async (data: CreateInvestimento): Promise<Investimento> => {
  const { data: newInvestimento } = await api.post<Investimento>('/investimentos', data);
  return newInvestimento;
};

export const updateInvestimento = async (id: number, data: UpdateInvestimento): Promise<Investimento> => {
  const { data: updatedInvestimento } = await api.put<Investimento>(`/investimentos/${id}`, data);
  return updatedInvestimento;
};