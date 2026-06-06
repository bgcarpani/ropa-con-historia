import client from './client';
import { User } from '../types';

export const getUsers = () => client.get<User[]>('/users').then(r => r.data);
export const getUser = (id: string) => client.get<User>(`/users/${id}`).then(r => r.data);
export const createUser = (data: Partial<User> & { password: string }) =>
  client.post<User>('/users', data).then(r => r.data);
export const updateUser = (id: string, data: Partial<User>) =>
  client.patch<User>(`/users/${id}`, data).then(r => r.data);
export const deleteUser = (id: string) => client.delete(`/users/${id}`).then(r => r.data);
