import client from './client';
import { BalanceSummary, BalanceTransaction, TransactionState, TransactionType } from '../types';

export const getBalance = (supplierId: string) =>
  client.get<BalanceSummary>(`/balance/${supplierId}`).then(r => r.data);
export const getBalanceHistory = (supplierId: string) =>
  client.get<BalanceTransaction[]>(`/balance/${supplierId}/history`).then(r => r.data);
export const updateTransaction = (id: string, state: TransactionState) =>
  client.patch<BalanceTransaction>(`/balance/transactions/${id}`, { state }).then(r => r.data);
export const adjustBalance = (supplierId: string, data: { amount: number; type: TransactionType; note: string }) =>
  client.post<BalanceTransaction>(`/balance/${supplierId}/adjust`, data).then(r => r.data);
