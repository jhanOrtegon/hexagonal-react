import type { OrderStatus } from '../../domain/Order.entity';

/**
 * DTO para crear un pedido
 */
export interface CreateOrderDTO {
  readonly userId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
}

/**
 * DTO para actualizar estado del pedido
 */
export interface UpdateOrderStatusDTO {
  readonly id: string;
  readonly status: OrderStatus;
}

/**
 * DTO de respuesta de pedido
 */
export interface OrderResponseDTO {
  readonly id: string;
  readonly userId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly totalPrice: number;
  readonly status: OrderStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
