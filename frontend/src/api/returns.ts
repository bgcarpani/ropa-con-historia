import client from './client';
import { ReturnRequest, ReturnState } from '../types';

export const getReturns = () => client.get<ReturnRequest[]>('/returns').then(r => r.data);
export const createReturn = (data: { productId: string; reason: string }) =>
  client.post<ReturnRequest>('/returns', data).then(r => r.data);
export const updateReturnState = (id: string, state: ReturnState, adminNote?: string) =>
  client.patch<ReturnRequest>(`/returns/${id}/state`, { state, adminNote }).then(r => r.data);
