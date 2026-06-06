import client from './client';
import { Product, ProductState } from '../types';

export const getProducts = () => client.get<Product[]>('/products').then(r => r.data);
export const getProduct = (id: string) => client.get<Product>(`/products/${id}`).then(r => r.data);
export const createProduct = (data: { name: string; description?: string; category?: string; price: number; supplierId: string }) =>
  client.post<Product>('/products', data).then(r => r.data);
export const updateProductState = (id: string, state: ProductState) =>
  client.patch<Product>(`/products/${id}/state`, { state }).then(r => r.data);
export const deleteProduct = (id: string) => client.delete(`/products/${id}`).then(r => r.data);
