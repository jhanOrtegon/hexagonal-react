import type { OrderStatus } from '../Order.entity';

/**
 * Tipos para crear un pedido
 */
export interface CreateOrderData {
  readonly userId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
}

/**
 * Tipos para restaurar un pedido desde persistencia
 */
export interface RestoreOrderData {
  readonly id: string;
  readonly userId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly totalPrice: number;
  readonly status: OrderStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Tipos para serialización (localStorage, API)
 */
export interface OrderData {
  readonly id: string;
  readonly userId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly totalPrice: number;
  readonly status: OrderStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
