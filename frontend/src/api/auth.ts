import client from './client';
import { AuthTokens } from '../types';

export const login = (email: string, password: string) =>
  client.post<AuthTokens>('/auth/login', { email, password }).then(r => r.data);

export const register = (data: { name: string; email: string; password: string; phone?: string }) =>
  client.post<AuthTokens>('/auth/register', data).then(r => r.data);
