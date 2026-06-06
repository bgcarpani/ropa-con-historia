import client from './client';
import { Sale } from '../types';

export const getSales = () => client.get<Sale[]>('/sales').then(r => r.data);
export const getSale = (id: string) => client.get<Sale>(`/sales/${id}`).then(r => r.data);
export const createSale = (productIds: string[]) =>
  client.post<Sale>('/sales', { productIds }).then(r => r.data);
