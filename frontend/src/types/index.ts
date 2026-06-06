export type Role = 'ADMIN' | 'PROVEEDOR';

export type ProductState = 'EN_VENTA' | 'VENDIDO' | 'PAGADO' | 'DEVUELTO' | 'CANCELADO';
export type AppointmentType = 'DROP_OFF' | 'COLLECTION';
export type AppointmentState = 'PENDIENTE' | 'CONFIRMADO' | 'COMPLETADO' | 'CANCELADO';
export type TransactionType = 'CREDIT' | 'CASH';
export type TransactionState = 'PENDIENTE' | 'COBRADO' | 'USADO';
export type ReturnState = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  creditPercentage: number;
  cashPercentage: number;
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  state: ProductState;
  supplierId: string;
  saleId?: string;
  createdAt: string;
  updatedAt: string;
  supplier?: { id: string; name: string };
}

export interface Appointment {
  id: string;
  supplierId: string;
  type: AppointmentType;
  state: AppointmentState;
  scheduledAt: string;
  notes?: string;
  createdAt: string;
  supplier?: { id: string; name: string };
}

export interface Sale {
  id: string;
  adminId: string;
  createdAt: string;
  admin?: { id: string; name: string };
  products?: Product[];
}

export interface BalanceTransaction {
  id: string;
  supplierId: string;
  amount: number;
  type: TransactionType;
  state: TransactionState;
  productId?: string;
  note?: string;
  createdAt: string;
  product?: { id: string; name: string };
}

export interface BalanceSummary {
  supplierId: string;
  pendingCredit: number;
  pendingCash: number;
  total: number;
}

export interface ReturnRequest {
  id: string;
  supplierId: string;
  productId: string;
  state: ReturnState;
  reason: string;
  adminNote?: string;
  createdAt: string;
  product?: { id: string; name: string; price: number };
  supplier?: { id: string; name: string };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  role: Role;
}
